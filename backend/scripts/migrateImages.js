/**
 * Full migration script: ALL images → Cloudinary
 *
 * Migrates every image across the entire database:
 *   - Event.image       → Cloudinary (folder: eventhub/events)
 *   - User.profilePicture → Cloudinary (folder: eventhub/users)
 *
 * Skips:
 *   - Empty / missing image fields
 *   - Images already hosted on Cloudinary (res.cloudinary.com)
 *
 * Usage:
 *   cd backend
 *   node scripts/migrateImages.js
 *
 * Idempotent — safe to re-run.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load env vars BEFORE importing cloudinary config
dotenv.config();

const cloudinary = require("../config/cloudinary");
const Event = require("../models/Event");
const User = require("../models/User");

/**
 * Upload a single image string to Cloudinary.
 * Accepts base64 data URIs or remote URLs.
 */
async function uploadToCloudinary(imageString, folder) {
  const result = await cloudinary.uploader.upload(imageString, {
    folder: `eventhub/${folder}`,
    resource_type: "image",
    transformation: [
      { width: 1920, height: 1080, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

/**
 * Check if an image string needs migration.
 * Returns false if empty, or already a Cloudinary URL.
 */
function needsMigration(imageString) {
  if (!imageString || imageString.trim() === "") return false;
  if (imageString.includes("res.cloudinary.com")) return false;
  return true;
}

async function migrateImages() {
  console.log("=== Full Image Migration → Cloudinary ===\n");

  // 1. Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }

  let totalSuccess = 0;
  let totalFail = 0;

  // ─── EVENTS ───────────────────────────────────────────
  console.log("─── Migrating Event Images ───\n");

  const allEvents = await Event.find({});
  const eventsToMigrate = allEvents.filter((e) => needsMigration(e.image));

  console.log(`  Total events: ${allEvents.length}`);
  console.log(`  Need migration: ${eventsToMigrate.length}\n`);

  for (const event of eventsToMigrate) {
    const label = `Event "${(event.title || event._id).toString().substring(0, 40)}"`;
    process.stdout.write(`  ${label}... `);
    try {
      const { url, publicId } = await uploadToCloudinary(event.image, "events");
      event.image = url;
      event.imagePublicId = publicId;
      await event.save();
      console.log(`✅ → ${url.substring(0, 60)}...`);
      totalSuccess++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      totalFail++;
    }
  }

  // ─── USERS ────────────────────────────────────────────
  console.log("\n─── Migrating User Profile Pictures ───\n");

  const allUsers = await User.find({});
  const usersToMigrate = allUsers.filter((u) =>
    needsMigration(u.profilePicture),
  );

  console.log(`  Total users: ${allUsers.length}`);
  console.log(`  Need migration: ${usersToMigrate.length}\n`);

  for (const user of usersToMigrate) {
    const label = `User "${(user.name || user._id).toString().substring(0, 40)}"`;
    process.stdout.write(`  ${label}... `);
    try {
      const { url } = await uploadToCloudinary(user.profilePicture, "users");
      user.profilePicture = url;
      await user.save();
      console.log(`✅ → ${url.substring(0, 60)}...`);
      totalSuccess++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      totalFail++;
    }
  }

  // ─── SUMMARY ──────────────────────────────────────────
  console.log("\n=== Migration Complete ===");
  console.log(`  ✅ Success: ${totalSuccess}`);
  console.log(`  ❌ Failed:  ${totalFail}`);
  console.log(
    `  📊 Total processed: ${eventsToMigrate.length + usersToMigrate.length}\n`,
  );

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
  process.exit(totalFail > 0 ? 1 : 0);
}

migrateImages().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
