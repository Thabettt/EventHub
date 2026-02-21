const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const mongoose = require("mongoose");

/**
 * @desc    Create a Stripe Checkout Session for a paid event booking
 * @route   POST /api/payments/create-checkout-session
 * @access  Private
 */
exports.createCheckoutSession = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId, ticketsBooked = 1 } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Invalid event ID" });
    }

    if (!Number.isInteger(ticketsBooked) || ticketsBooked <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Number of tickets must be a positive integer",
      });
    }

    // Check event exists
    const eventCheck = await Event.findById(eventId).session(session);
    if (!eventCheck) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Free events should not use Stripe
    if (eventCheck.ticketPrice <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "This event is free. Use the regular booking endpoint.",
      });
    }

    // Atomically reserve tickets
    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        remainingTickets: { $gte: ticketsBooked },
      },
      {
        $inc: { remainingTickets: -ticketsBooked },
      },
      {
        new: true,
        session,
      },
    );

    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Not enough tickets available.",
      });
    }

    const totalPrice = event.ticketPrice * ticketsBooked;

    // Create a Pending booking
    const booking = new Booking({
      event: eventId,
      user: userId,
      ticketsBooked,
      totalPrice,
      status: "Pending",
      paymentStatus: "pending",
    });
    await booking.save({ session });

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.title,
              description: `${ticketsBooked} ticket(s) for ${event.title}`,
              images: event.image ? [event.image] : [],
            },
            unit_amount: Math.round(event.ticketPrice * 100), // Stripe uses cents
          },
          quantity: ticketsBooked,
        },
      ],
      metadata: {
        bookingId: booking._id.toString(),
        eventId: eventId,
        userId: userId.toString(),
      },
      success_url: `${req.headers.origin || "http://localhost:5173"}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || "http://localhost:5173"}/events/${eventId}?cancelled=true`,
    });

    // Save the Stripe session ID on the booking
    booking.stripeSessionId = checkoutSession.id;
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      data: {
        url: checkoutSession.url,
        sessionId: checkoutSession.id,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
    });
  }
};

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/payments/webhook
 * @access  Public (verified by Stripe signature)
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      req.body, // raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  // Handle event types
  switch (stripeEvent.type) {
    case "checkout.session.completed": {
      const completedSession = stripeEvent.data.object;
      try {
        const booking = await Booking.findOne({
          stripeSessionId: completedSession.id,
        });

        if (booking) {
          booking.status = "Confirmed";
          booking.paymentStatus = "paid";
          booking.stripePaymentIntentId = completedSession.payment_intent || "";
          await booking.save();
          console.log(`✅ Booking ${booking._id} confirmed via Stripe webhook`);
        } else {
          console.warn(
            `⚠️ No booking found for session: ${completedSession.id}`,
          );
        }
      } catch (err) {
        console.error("Error processing checkout.session.completed:", err);
      }
      break;
    }

    case "checkout.session.expired": {
      const expiredSession = stripeEvent.data.object;
      try {
        const booking = await Booking.findOne({
          stripeSessionId: expiredSession.id,
        });

        if (booking && booking.status === "Pending") {
          // Restore tickets
          await Event.findByIdAndUpdate(booking.event, {
            $inc: { remainingTickets: booking.ticketsBooked },
          });

          booking.status = "Canceled";
          booking.paymentStatus = "none";
          await booking.save();
          console.log(
            `🔄 Booking ${booking._id} canceled — Stripe session expired`,
          );
        }
      } catch (err) {
        console.error("Error processing checkout.session.expired:", err);
      }
      break;
    }

    default:
      // Unhandled event type — ignore silently
      break;
  }

  // Acknowledge receipt
  res.status(200).json({ received: true });
};

/**
 * @desc    Get the status of a Stripe Checkout Session
 * @route   GET /api/payments/session-status?session_id=...
 * @access  Private
 */
exports.getSessionStatus = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "session_id query parameter is required",
      });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    // Find the associated booking
    const booking = await Booking.findOne({
      stripeSessionId: session_id,
    }).populate("event", "title image date location");

    res.status(200).json({
      success: true,
      data: {
        status: checkoutSession.status,
        paymentStatus: checkoutSession.payment_status,
        booking: booking || null,
      },
    });
  } catch (error) {
    console.error("Error fetching session status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch session status",
    });
  }
};
