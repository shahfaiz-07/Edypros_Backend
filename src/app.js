import cookieParser from "cookie-parser";
import express from "express"
import cors from "cors"

const app = express()

app.use(cors({
    origin: "*",
    credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from './routes/user.routes.js'
import profileRouter from './routes/profile.routes.js'
import categoryRouter from './routes/category.routes.js'
import courseRouter from './routes/course.routes.js'
import sectionRouter from './routes/section.routes.js'
import videoRouter from './routes/video.routes.js'
import ratingAndReviewRouter from './routes/ratingAndReview.routes.js'
import paymentRouter from "./routes/payment.routes.js"
import courseProgressRouter from "./routes/courseProgress.routes.js"

app.use('/api/v1/users', userRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/section', sectionRouter);
app.use('/api/v1/video', videoRouter);
app.use('/api/v1/ratings-and-reviews', ratingAndReviewRouter);
app.use("/api/v1/payments", paymentRouter)
app.use("/api/v1/course-progress", courseProgressRouter);

export { app }