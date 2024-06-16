import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import "colors"

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connection successfull !!`.bgCyan);
        console.log(`DB host : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`Error while connecting to MongoDB !! : ${error.message}`.bgRed)
    }
    
}