import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '5m'
    }
});

export const OTP = mongoose.model("OTP", OTPSchema);
