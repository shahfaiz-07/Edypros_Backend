import mongoose from "mongoose"

const profileSchema = new mongoose.Schema({
    gender : {
        type: String,
    },
    dob : {
        type: String,
    },
    about : {
        type: String,
        trim: true,
    },
    contactNumber: {
        type: String,
        trim: true,
    }
}, {timestamps : true});

export const Profile = mongoose.model("Profile", profileSchema)