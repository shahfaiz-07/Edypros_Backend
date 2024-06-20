import mongoose from "mongoose";
import { sendMail } from './../utils/mailSender.js';
import { otpTemplate } from "../utils/mail/templates/emailVerification.js";

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

OTPSchema.pre("save", async function () {
    await sendMail(this.email, "Edypros Verification OTP", 
        otpTemplate(this.otp));
});

export const OTP = mongoose.model("OTP", OTPSchema);
