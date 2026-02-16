# Security Patching Implementation Plan — EventHub Backend

---

## Phase 1 — Vulnerability Inventory

| #   | File                 | Function               | Severity    | Type                        | Fix Status |
| --- | -------------------- | ---------------------- | ----------- | --------------------------- | ---------- |
| 1   | eventController.js   | `updateEvent`          | 🔴 Critical | Mass Assignment             | ⬜ Pending |
| 2   | bookingController.js | `getBookingDetails`    | 🔴 Critical | Broken Access Control       | ⬜ Pending |
| 3   | bookingController.js | `cancelBooking`        | 🔴 Critical | Broken Access Control       | ⬜ Pending |
| 4   | authController.js    | `register`             | 🔴 Critical | Missing Input Validation    | ⬜ Pending |
| 5   | routes/auth.js       | `/test-email`          | 🔴 Critical | Unauthenticated Email Relay | ⬜ Pending |
| 6   | eventController.js   | `getEvents`            | 🔴 High     | ReDoS / Regex Injection     | ⬜ Pending |
| 7   | eventController.js   | `searchEvents`         | 🔴 High     | ReDoS / Regex Injection     | ⬜ Pending |
| 8   | eventController.js   | `getEventsByCategory`  | 🔴 High     | ReDoS / Regex Injection     | ⬜ Pending |
| 9   | eventController.js   | `getEventsByLocation`  | 🔴 High     | ReDoS / Regex Injection     | ⬜ Pending |
| 10  | eventController.js   | `getOrganizerEvents`   | 🔴 High     | ReDoS / Regex Injection     | ⬜ Pending |
| 11  | userController.js    | `updateProfile`        | 🔴 High     | Sensitive Data Exposure     | ⬜ Pending |
| 12  | userController.js    | `updateUser`           | 🔴 High     | Sensitive Data Exposure     | ⬜ Pending |
| 13  | authController.js    | `resetPassword`        | 🔴 High     | Missing Input Validation    | ⬜ Pending |
| 14  | eventController.js   | `createEvent`          | ⚠️ Medium   | Error Message Leakage       | ⬜ Pending |
| 15  | eventController.js   | `getOrganizerEvents`   | ⚠️ Medium   | Error Message Leakage       | ⬜ Pending |
| 16  | authController.js    | `logout`               | ⚠️ Medium   | Uncaught Exception          | ⬜ Pending |
| 17  | authController.js    | `register`             | ⚠️ Medium   | User Enumeration            | ⬜ Pending |
| 18  | middleware/error.js  | (empty)                | ⚠️ Medium   | Missing Error Handler       | ⬜ Pending |
| 19  | middleware/upload.js | (empty)                | ⚠️ Medium   | Missing Upload Security     | ⬜ Pending |
| 20  | authController.js    | JWT tokens             | ⚠️ Medium   | Excessive Token Lifetime    | ⬜ Pending |
| 21  | adminController.js   | `getDashboardData`     | ⚠️ Medium   | DoS — Unbounded Query       | ⬜ Pending |
| 22  | bookingController.js | `getOrganizerBookings` | ⚠️ Medium   | DoS — Unbounded Query       | ⬜ Pending |
| 23  | userController.js    | `changePassword`       | ⚠️ Medium   | Missing Password Validation | ⬜ Pending |
| 24  | server.js            | CORS config            | 🟡 Low      | Hardcoded CORS Origin       | ⬜ Pending |
| 25  | authController.js    | `forgotPassword`       | 🟡 Low      | Hardcoded Reset URL         | ⬜ Pending |
| 26  | server.js            | Request logging        | 🟡 Low      | Verbose Logging             | ⬜ Pending |
| 27  | emailService.js      | transporter            | 🟡 Low      | Debug Mode Enabled          | ⬜ Pending |
| 28  | adminController.js   | All functions          | 🟡 Low      | Sensitive Data in Console   | ⬜ Pending |
| 29  | bookingController.js | `createBookingForUser` | 🟡 Low      | User Enumeration via Email  | ⬜ Pending |
| 30  | authController.js    | `forgotPassword`       | 🟡 Low      | Variable Scope Bug          | ⬜ Pending |

---

## Phase 2 — Grouped Fix Execution

---

### GROUP 1 — Authentication & Authorization Fixes

---

#### Fix #2 — Broken Access Control in `getBookingDetails`

**File:** [bookingController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/bookingController.js) — Line 289

**Vulnerable code:**

```javascript
    if (booking.user.toString() !== userId.toString() && !req.user.isAdmin) {
```

**Patched code:**

```javascript
    // Handle both populated and non-populated user field
    const bookingUserId = booking.user._id ? booking.user._id.toString() : booking.user.toString();
    if (bookingUserId !== userId.toString() && req.user.role !== "System Admin") {
```

**Why this works:** The User model has no `isAdmin` field — it uses `role: "System Admin"`. Also, after `.populate("user", "name email")`, `booking.user` is an object, so `.toString()` returns `[object Object]`. We safely handle both cases by checking for `._id`.

---

#### Fix #3 — Broken Access Control in `cancelBooking`

**File:** [bookingController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/bookingController.js) — Line 347

**Vulnerable code:**

```javascript
      if (booking.user.toString() !== userId.toString() && !req.user.isAdmin) {
```

**Patched code:**

```javascript
      if (booking.user.toString() !== userId.toString() && req.user.role !== "System Admin") {
```

**Why this works:** In `cancelBooking`, `booking.user` is NOT populated (only `.populate("event")` is called), so `.toString()` correctly returns the ObjectId. We only need to fix the `isAdmin` check to use the actual role field.

---

#### Fix #5 — Unauthenticated Email Relay

**File:** [routes/auth.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/routes/auth.js) — Lines 29–52

**Vulnerable code:**

```javascript
router.post("/test-email", async (req, res) => {
```

**Patched code — remove entirely or gate behind auth:**

```javascript
// OPTION A (recommended): Delete lines 28-52 entirely in production

// OPTION B: Keep for dev only, gated behind admin auth
router.post("/test-email", protect, authorize("System Admin"), async (req, res) => {
```

> [!IMPORTANT]
> The recommended approach is **Option A** — delete the entire `/test-email` route block (lines 28–52) from `routes/auth.js`. It's a debug endpoint that should never exist in production.

---

#### Fix #20 — Excessive JWT Token Lifetime

**File:** [authController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/authController.js) — Lines 48 and 96

These two occurrences are identical. Both need the same change.

**Vulnerable code (appears twice — line 48 and line 96):**

```javascript
      { expiresIn: "30d" },
```

**Patched code (both locations):**

```javascript
      { expiresIn: "1d" },
```

**Why:** 30 days is far too long. A stolen token remains valid for a month. 1 day is a reasonable balance between UX and security.

---

### GROUP 2 — Input Validation & Injection Fixes

---

#### Fix #4 — No Input Validation on Registration

**File:** [authController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/authController.js) — Lines 13–26

**Vulnerable code:**

```javascript
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("Registration attempt:", { name, email });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }
```

**Patched code (replaces lines 13–26):**

```javascript
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // --- Input validation ---
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (typeof name !== "string" || name.trim().length < 1 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 1 and 100 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }
    // --- End input validation ---

    // Check if user already exists (Fix #17: generic message)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Registration could not be completed. Please try a different email.",
      });
    }
```

**Side effect:** Also fixes **#17 (User Enumeration)** by using a generic message.

---

#### Fix #13 — No Password Validation on Reset

**File:** [authController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/authController.js) — Lines 233–257

**Vulnerable code (insert validation before line 256):**

```javascript
// Set new password and hash it
const salt = await bcrypt.genSalt(10);
user.password = await bcrypt.hash(req.body.password, salt);
```

**Patched code (replaces the above block):**

```javascript
// Validate new password
if (
  !req.body.password ||
  typeof req.body.password !== "string" ||
  req.body.password.length < 8
) {
  return res.status(400).json({
    success: false,
    message: "Password must be at least 8 characters",
  });
}

// Set new password and hash it
const salt = await bcrypt.genSalt(10);
user.password = await bcrypt.hash(req.body.password, salt);
```

---

#### Fixes #6–10 — ReDoS / Regex Injection (5 instances)

All 5 share the same root cause: user input passed directly to `$regex`. All use the same fix: a shared `escapeRegex` utility.

**New utility function** — add at the top of [eventController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/eventController.js) after the imports (line 2):

```javascript
// Escape special regex characters to prevent ReDoS and regex injection
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

**Fix #6 — `getEvents` line 32:**

Vulnerable:

```javascript
query.location = { $regex: req.query.location, $options: "i" };
```

Patched:

```javascript
query.location = { $regex: escapeRegex(req.query.location), $options: "i" };
```

**Fix #7 — `searchEvents` line 301:**

Vulnerable:

```javascript
      title: { $regex: title, $options: "i" },
```

Patched:

```javascript
      title: { $regex: escapeRegex(title), $options: "i" },
```

**Fix #8 — `getEventsByCategory` line 326:**

Vulnerable:

```javascript
      category: { $regex: category, $options: "i" },
```

Patched:

```javascript
      category: { $regex: escapeRegex(category), $options: "i" },
```

**Fix #9 — `getEventsByLocation` line 351:**

Vulnerable:

```javascript
      location: { $regex: location, $options: "i" },
```

Patched:

```javascript
      location: { $regex: escapeRegex(location), $options: "i" },
```

**Fix #10 — `getOrganizerEvents` lines 445 and 450:**

Vulnerable (line 445):

```javascript
query.location = { $regex: req.query.location, $options: "i" };
```

Patched:

```javascript
query.location = { $regex: escapeRegex(req.query.location), $options: "i" };
```

Vulnerable (line 450):

```javascript
query.title = { $regex: req.query.search, $options: "i" };
```

Patched:

```javascript
query.title = { $regex: escapeRegex(req.query.search), $options: "i" };
```

---

#### Fix #23 — Missing Password Validation in `changePassword` and `updateProfile`

**File:** [userController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/userController.js)

**`changePassword` (line 227) — after destructuring, before using password:**

Vulnerable:

```javascript
const { currentPassword, password } = req.body;
const user = await User.findById(req.user._id);
```

Patched:

```javascript
const { currentPassword, password } = req.body;

if (!currentPassword || !password) {
  return res.status(400).json({
    success: false,
    message: "Current password and new password are required",
  });
}

if (typeof password !== "string" || password.length < 8) {
  return res.status(400).json({
    success: false,
    message: "New password must be at least 8 characters",
  });
}

const user = await User.findById(req.user._id);
```

**`updateProfile` (line 43) — wrap the password section:**

Vulnerable:

```javascript
if (password) {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
}
```

Patched:

```javascript
if (password) {
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters",
    });
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
}
```

---

### GROUP 3 — Mass Assignment Fixes

---

#### Fix #1 — Mass Assignment in `updateEvent`

**File:** [eventController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/eventController.js) — Lines 225–229

**Vulnerable code:**

```javascript
// Update event
event = await Event.findByIdAndUpdate(req.params.id, req.body, {
  new: true,
  runValidators: true,
});
```

**Patched code:**

```javascript
// Whitelist allowed fields — NEVER pass req.body directly
const allowedFields = [
  "title",
  "description",
  "date",
  "location",
  "address",
  "city",
  "state",
  "country",
  "isOnline",
  "onlineLink",
  "category",
  "tags",
  "image",
  "ticketPrice",
  "totalTickets",
  "maxAttendees",
  "requiresApproval",
  "allowWaitlist",
  "refundPolicy",
  "additionalInfo",
  "isPublic",
];

const updateData = {};
for (const field of allowedFields) {
  if (req.body[field] !== undefined) {
    updateData[field] = req.body[field];
  }
}

// Update event with whitelisted fields only
event = await Event.findByIdAndUpdate(req.params.id, updateData, {
  new: true,
  runValidators: true,
});
```

**Blocked fields** (never writable via this endpoint):
`organizer`, `status`, `featured`, `attendeeCount`, `remainingTickets`, `_id`, `createdAt`, `updatedAt`

---

### GROUP 4 — Business Logic Fixes

---

#### Fix #21 — DoS via Unbounded Query in `getDashboardData`

**File:** [adminController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/adminController.js) — Lines 30–38

**Vulnerable code:**

```javascript
// Get revenue summary
const bookings = await Booking.find({ status: "confirmed" }).populate(
  "event",
  "price",
);

const totalRevenue = bookings.reduce((sum, booking) => {
  return sum + (booking.event?.price || 0);
}, 0);
```

**Patched code:**

```javascript
// Get revenue summary using aggregation (no unbounded find)
const revenueResult = await Booking.aggregate([
  { $match: { status: "confirmed" } },
  {
    $lookup: {
      from: "events",
      localField: "event",
      foreignField: "_id",
      as: "eventData",
    },
  },
  { $unwind: { path: "$eventData", preserveNullAndEmptyArrays: true } },
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: { $ifNull: ["$eventData.ticketPrice", 0] } },
    },
  },
]);

const totalRevenue =
  revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
```

---

#### Fix #22 — Unbounded Query in `getOrganizerBookings` (Admin path)

**File:** [bookingController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/bookingController.js) — Lines 447–456

**Vulnerable code:**

```javascript
if (userRole === "System Admin") {
  const bookings = await Booking.find()
    .populate("event", "title date organizer")
    .populate("user", "name email profilePicture")
    .sort({ bookingDate: -1 });

  return res
    .status(200)
    .json({ success: true, count: bookings.length, data: bookings });
}
```

**Patched code:**

```javascript
if (userRole === "System Admin") {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const bookings = await Booking.find()
    .populate("event", "title date organizer")
    .populate("user", "name email profilePicture")
    .sort({ bookingDate: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Booking.countDocuments();

  return res.status(200).json({
    success: true,
    count: bookings.length,
    pagination: { total, pages: Math.ceil(total / limit), page },
    data: bookings,
  });
}
```

---

### GROUP 5 — Sensitive Data Exposure Fixes

---

#### Fix #11 — Password Hash in `updateProfile` Response

**File:** [userController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/userController.js) — Lines 48–53

**Vulnerable code:**

```javascript
await user.save();

res.status(200).json({
  success: true,
  data: user,
});
```

**Patched code:**

```javascript
await user.save();

// Strip password from response
const userResponse = user.toObject();
delete userResponse.password;

res.status(200).json({
  success: true,
  data: userResponse,
});
```

---

#### Fix #12 — Password Hash in `updateUser` Response

**File:** [userController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/userController.js) — Lines 150–155

**Vulnerable code:**

```javascript
await user.save();

res.status(200).json({
  success: true,
  data: user,
});
```

**Patched code:**

```javascript
await user.save();

// Strip password from response
const userResponse = user.toObject();
delete userResponse.password;

res.status(200).json({
  success: true,
  data: userResponse,
});
```

---

#### Fix #14 — Error Message Leakage in `createEvent`

**File:** [eventController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/eventController.js) — Line 195

**Vulnerable code:**

```javascript
      message: error.message || "Failed to create event",
```

**Patched code:**

```javascript
      message: "Failed to create event",
```

---

#### Fix #15 — Error Message Leakage in `getOrganizerEvents`

**File:** [eventController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/eventController.js) — Lines 561–581

**Vulnerable code:**

```javascript
if (error.name === "CastError") {
  return res.status(400).json({
    success: false,
    message: "Invalid ID format or query parameter",
    error: error.message,
  });
}

if (error.name === "ValidationError") {
  return res.status(400).json({
    success: false,
    message: "Validation error in query parameters",
    error: error.message,
  });
}

res.status(500).json({
  success: false,
  message: "Server error while retrieving organizer events",
  error: process.env.NODE_ENV === "development" ? error.message : undefined,
});
```

**Patched code:**

```javascript
if (error.name === "CastError") {
  return res.status(400).json({
    success: false,
    message: "Invalid ID format or query parameter",
  });
}

if (error.name === "ValidationError") {
  return res.status(400).json({
    success: false,
    message: "Validation error in query parameters",
  });
}

res.status(500).json({
  success: false,
  message: "Server error while retrieving organizer events",
});
```

---

#### Fix #28 — Sensitive Error Logging in `adminController.js`

**File:** [adminController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/adminController.js)

Replace all 5 occurrences of `console.error("...", error)`:

**Vulnerable (5 instances):**

```javascript
console.error("Admin dashboard error:", error);
console.error("Events analytics error:", error);
console.error("Bookings analytics error:", error);
console.error("Users analytics error:", error);
console.error("Revenue analytics error:", error);
```

**Patched (5 instances):**

```javascript
console.error("Admin dashboard error:", error.message);
console.error("Events analytics error:", error.message);
console.error("Bookings analytics error:", error.message);
console.error("Users analytics error:", error.message);
console.error("Revenue analytics error:", error.message);
```

---

### GROUP 6 — File Upload Fixes

---

#### Fix #19 — Empty Upload Middleware

**File:** [middleware/upload.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/middleware/upload.js) — Currently empty

**Complete file rewrite:**

```javascript
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    // Generate random filename to prevent path traversal and overwrites
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${safeExt}`);
  },
});

// File filter — whitelist safe image types only
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedExts = /\.(jpeg|jpg|png|gif|webp)$/i;

  const mimeOk = allowedMimes.includes(file.mimetype);
  const extOk = allowedExts.test(path.extname(file.originalname));

  if (mimeOk && extOk) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // Max 1 file per request
  },
});

module.exports = upload;
```

> [!NOTE]
> **Dependency required:** `npm install multer`
> Also create the `uploads/` directory: `mkdir uploads`

---

### GROUP 7 — Rate Limiting & Brute Force Fixes

The server already has a global rate limiter (100 req / 15 min via `express-rate-limit`). However, sensitive endpoints need stricter limits.

**New file:** `middleware/rateLimiter.js`

```javascript
const rateLimit = require("express-rate-limit");

// Strict limiter for login — 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for registration — 3 per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many accounts created. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for password reset — 3 per 15 minutes per IP
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, registerLimiter, passwordResetLimiter };
```

**Apply in [routes/auth.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/routes/auth.js):**

Add import at top:

```javascript
const {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
} = require("../middleware/rateLimiter");
```

Update route lines:

```javascript
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
```

---

### GROUP 8 — Error Handling Fixes

---

#### Fix #18 — Empty Error Handler Middleware

**File:** [middleware/error.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/middleware/error.js) — Currently empty

**Complete file rewrite:**

```javascript
// Centralized error handler — prevents internal details from leaking
const errorHandler = (err, req, res, next) => {
  // Log for debugging (message only, not full stack in production)
  console.error("Error:", err.message);

  let statusCode = err.statusCode || 500;
  let message = "Server Error";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
```

**Then update [server.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/server.js)** — replace the inline error handler (lines 70–77):

**Vulnerable code:**

```javascript
// Global error handling to prevent info leakage
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server Error",
  });
});
```

**Patched code:**

```javascript
// Global error handling — use centralized handler
const errorHandler = require("./middleware/error");
app.use(errorHandler);
```

---

#### Fix #16 — Uncaught Exception on Logout

**File:** [authController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/authController.js) — Lines 118–121

**Vulnerable code:**

```javascript
exports.logout = async (req, res) => {
  try {
    // Get token from authorization header
    const token = req.headers.authorization.split(" ")[1];
```

**Patched code:**

```javascript
exports.logout = async (req, res) => {
  try {
    // Guard against missing or malformed Authorization header
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "No valid token provided",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
```

---

### GROUP 9 — Cryptography & Secrets Fixes

---

#### Fix #25 — Hardcoded Reset URL

**File:** [authController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/authController.js) — Line 180

**Vulnerable code:**

```javascript
const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
```

**Patched code:**

```javascript
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
```

**New `.env` variable:** `FRONTEND_URL=http://localhost:5173` (change to production URL when deploying)

---

#### Fix #27 — Email Debug Mode Enabled

**File:** [utils/emailService.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/utils/emailService.js) — Line 12

**Vulnerable code:**

```javascript
  debug: true, // This helps see detailed connection information
```

**Patched code:**

```javascript
  debug: process.env.NODE_ENV === "development",
```

---

#### Fix #30 — Variable Scope Bug in `forgotPassword`

**File:** [authController.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/controllers/authController.js) — Lines 152–155

**Vulnerable code:**

```javascript
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let user;
```

**Patched code:**

```javascript
exports.forgotPassword = async (req, res) => {
  let user;
  try {
    const { email } = req.body;
```

**Why:** Moving `let user` before the `try` block ensures it's always in scope for the `catch` block, making the cleanup logic robust rather than relying on hoisting behavior.

---

### GROUP 10 — CORS & Headers Fixes

---

#### Fix #24 — Hardcoded CORS Origin

**File:** [server.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/server.js) — Lines 35–40

**Vulnerable code:**

```javascript
app.use(
  cors({
    origin: "http://localhost:5173", // Vite's default port
    credentials: true,
  }),
);
```

**Patched code:**

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
```

---

#### Fix #26 — Verbose Request Logging

**File:** [server.js](file:///c:/Users/Abdul/OneDrive/Documents/Projects/BSW%20copy/backend/server.js) — Lines 42–45

**Vulnerable code:**

```javascript
app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  next();
});
```

**Patched code:**

```javascript
// Only log requests in development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
  });
}
```

---

#### Fix #29 — User Enumeration via Email (Low — Accepted)

**File:** `bookingController.js` — Line 166

This is an admin/organizer-only endpoint. The message "User with this email not found" is operationally necessary for admins booking on behalf of users. **No code change required.** Mark as accepted risk.

---

#### Fix #17 — User Enumeration on Register

Already handled as part of **Fix #4** (the generic message change). No additional code needed.

---

## Phase 3 — New Files & Shared Utilities

### New File 1: `middleware/rateLimiter.js`

Full contents shown in Group 7 above.

### Rewritten File: `middleware/error.js`

Full contents shown in Group 8 above.

### Rewritten File: `middleware/upload.js`

Full contents shown in Group 6 above.

### No new validator library needed

All validation is done inline with plain JavaScript. No new npm dependency required for validation (avoids adding attack surface).

---

## Phase 4 — Integration Checklist

### Step 1: Install new dependencies

```bash
cd backend
npm install multer
```

> [!NOTE]
> `express-rate-limit` and `helmet` are already installed. No other new packages required.

### Step 2: Add new environment variables

Add the following to your `.env` file:

```
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Change `FRONTEND_URL` to your production URL when deploying. Set `NODE_ENV=production` in production.

### Step 3: Create required directories

```bash
mkdir uploads
```

Add `uploads/` to `.gitignore`.

### Step 4: Create new middleware files

| File                        | Action                                                     |
| --------------------------- | ---------------------------------------------------------- |
| `middleware/rateLimiter.js` | **CREATE** — new file (contents from Group 7)              |
| `middleware/error.js`       | **OVERWRITE** — replace empty file (contents from Group 8) |
| `middleware/upload.js`      | **OVERWRITE** — replace empty file (contents from Group 6) |

### Step 5: Apply patches to controllers (in order)

| File                               | Changes | Fixes                             |
| ---------------------------------- | ------- | --------------------------------- |
| `controllers/authController.js`    | 6 edits | #4, #13, #16, #17, #20, #25, #30  |
| `controllers/eventController.js`   | 9 edits | #1, #6, #7, #8, #9, #10, #14, #15 |
| `controllers/bookingController.js` | 3 edits | #2, #3, #22                       |
| `controllers/userController.js`    | 4 edits | #11, #12, #23                     |
| `controllers/adminController.js`   | 6 edits | #21, #28                          |

### Step 6: Apply patches to routes

| File             | Changes                                                | Fixes             |
| ---------------- | ------------------------------------------------------ | ----------------- |
| `routes/auth.js` | Delete test-email route, add rate limiters, add import | #5, rate limiting |

### Step 7: Apply patches to server.js

| Change                                                            | Fixes |
| ----------------------------------------------------------------- | ----- |
| Replace inline error handler with `require("./middleware/error")` | #18   |
| CORS origin → env variable                                        | #24   |
| Conditional request logging                                       | #26   |

### Step 8: Apply patches to utils

| File                    | Changes                                 | Fixes |
| ----------------------- | --------------------------------------- | ----- |
| `utils/emailService.js` | Change `debug: true` to env-conditional | #27   |

### Step 9: Verification tests for Critical / High fixes

**Fix #1 — Mass Assignment blocked:**

```bash
# Should NOT change status or organizer
curl -X PUT http://localhost:3000/api/events/EVENT_ID \
  -H "Authorization: Bearer <organizer_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved", "organizer": "FAKE_ID", "title": "Legit Update"}'
# Verify: status and organizer unchanged, only title updated
```

**Fix #2 & #3 — Access control works:**

```bash
# Admin CAN view any booking
curl http://localhost:3000/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer <admin_token>"
# Should return 200

# User CAN view own booking
curl http://localhost:3000/api/bookings/OWN_BOOKING_ID \
  -H "Authorization: Bearer <user_token>"
# Should return 200

# User CANNOT view other's booking
curl http://localhost:3000/api/bookings/OTHER_BOOKING_ID \
  -H "Authorization: Bearer <user_token>"
# Should return 403
```

**Fix #4 — Registration validates inputs:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "", "email": "invalid", "password": "short"}'
# Should return 400 with validation error
```

**Fix #5 — Test email blocked:**

```bash
curl -X POST http://localhost:3000/api/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com"}'
# Should return 404 (route removed) or 401 (if gated behind auth)
```

**Fixes #6–10 — ReDoS blocked:**

```bash
curl "http://localhost:3000/api/events/search?title=(a%2B)%2B"
# Should return results (regex is escaped), NOT hang the server
```

**Fixes #11–12 — No password in response:**

```bash
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
# Verify: response does NOT contain "password" field
```

**Fix #13 — Reset password validates:**

```bash
curl -X PUT http://localhost:3000/api/auth/reset-password/SOME_TOKEN \
  -H "Content-Type: application/json" \
  -d '{"password": "ab"}'
# Should return 400 "Password must be at least 8 characters"
```

---

## Phase 5 — Final Security Posture Summary

### Before vs After

| File                   | Before                                                                | After                                                                |
| ---------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `authController.js`    | No input validation, 30-day tokens, user enumeration, crash on logout | Full validation, 1-day tokens, generic messages, safe header parsing |
| `eventController.js`   | Mass assignment, ReDoS (5×), error leakage (2×)                       | Whitelisted fields, escaped regex, generic errors                    |
| `bookingController.js` | Broken `isAdmin` (2×), unbounded query                                | Correct role checks, paginated admin query                           |
| `userController.js`    | Password hash leaked (2×), no password rules                          | Password stripped from responses, 8-char minimum enforced            |
| `adminController.js`   | Unbounded revenue query, verbose logging                              | Aggregation pipeline, message-only logging                           |
| `middleware/auth.js`   | No changes needed                                                     | ✅ Already secure                                                    |
| `middleware/error.js`  | Empty                                                                 | Full centralized error handler                                       |
| `middleware/upload.js` | Empty                                                                 | Full multer config with MIME/ext/size validation                     |
| `routes/auth.js`       | Open email relay, no rate limiting                                    | Route removed, rate limiters on login/register/reset                 |
| `server.js`            | Hardcoded CORS, verbose logging, inline error handler                 | Env-driven CORS, conditional logging, centralized error handler      |

### Residual Risks (Infrastructure-Level)

These cannot be fixed at the code level alone:

1. **HTTPS enforcement** — Not configured in Express. Must be handled by a reverse proxy (nginx, Cloudflare, etc.)
2. **Secrets management** — `.env` file is used for secrets. In production, use a secrets manager (AWS SSM, Vault, etc.)
3. **WAF / DDoS protection** — Rate limiting helps but is IP-based. A CDN/WAF provides better protection
4. **Database access control** — MongoDB connection string should use least-privilege credentials
5. **Log management** — `console.error` goes to stdout. Use a structured logger (winston/pino) with remote transport

### Recommended Follow-Up Hardening

1. **Refresh token rotation** — Implement refresh tokens to allow shorter access token lifetimes
2. **Account lockout** — Lock accounts after N failed login attempts (not just rate limiting by IP)
3. **RBAC audit logging** — Log all admin actions (user role changes, event approvals) to an audit trail
4. **CSP headers** — Configure Content-Security-Policy via Helmet options
5. **Automated security testing** — Add `npm audit` to CI pipeline
6. **Password breach checking** — Check passwords against HaveIBeenPwned API on registration
7. **MongoDB query sanitization** — Add `express-mongo-sanitize` middleware to protect against operator injection
