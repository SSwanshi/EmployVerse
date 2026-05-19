const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true, enum: ["male", "female", "other"] },
  password: { type: String, required: true },
  profileImage: {
    data: Buffer,
    contentType: String,
  },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  twoFactorEnabled: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("RecruiterUser", UserSchema);

