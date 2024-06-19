import nodemailer from "nodemailer"
import "colors"

export const sendMail = async (to, subject, body) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })
        const info = await transporter.sendMail({
            from:process.env.MAIL_USER,
            to: to,
            subject,
            html: body
        });
        console.log(info)
    } catch(err) {
        console.log(`Some Error Occured while sending email !!`.bgRed);
        console.error(`ERROR : ${err.message}`);
    }
}