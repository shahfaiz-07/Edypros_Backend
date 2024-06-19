import mongoose from "mongoose";
import { sendMail } from './../utils/mailSender.js';

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
        `<h3>Dear User</h3>
        <p>Your one time password for email verfication is <b>${this.otp}</b>. It will automatically expire is 5 minutes !!</p>
        <p>Regards, <br/>Team Edypros.</p>`);
})

export const OTP = mongoose.model("OTP", OTPSchema);
