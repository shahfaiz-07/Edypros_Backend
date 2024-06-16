import otpGenerator from "otp-generator";

export const generateOTP = () => {
    return otpGenerator.generate(6, {specialChars: false, lowerCaseAlphabets: false, upperCaseAlphabets: false});
}