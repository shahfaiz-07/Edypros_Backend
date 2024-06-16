import dotenv from "dotenv"
import { connectDB } from "./db/config.js";
import { app } from "./app.js";
import "colors"

dotenv.config({
    path:"./.env"
});

connectDB()
.then( () => {
    app.listen(process.env.PORT, () => {
        console.log(`Server started and running on PORT :${process.env.PORT}`.bgYellow)
    });
})
.catch( (err) => {
    console.log(`Unable to connect to MongoDB !!`.bgRed)
})