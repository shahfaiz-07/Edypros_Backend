import cookieParser from "cookie-parser";
import express from "express"
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
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

app.use('/api/v1/users', userRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/course', courseRouter);
app.use('/api/v1/section', sectionRouter);
app.use('/api/v1/video', videoRouter);
export { app }