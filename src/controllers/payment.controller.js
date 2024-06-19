import { isValidObjectId } from 'mongoose';
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import Razorpay from "razorpay";
import { Course } from '../models/course.model';


const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});

const capturePayment = asyncHandler(async (req, res) => {
    const {courseId} =  req.body;
    if(!courseId || !isValidObjectId) {
        throw new ApiError(400, "Invalid course ID !!");
    }

    const course = await Course.findById(courseId);

    if(!course) {
        throw new ApiError(404, "Course not found !!");
    }

    if(course.studentsEnrolled.includes(req.user?._id)) {
        throw new ApiError(400, "Student already enrolled !!")
    }

    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount*100,
        currency,
        receipt: Date.now().toString(),
        notes: {
            courseId,
            userId: req.user?._id,
        }
    }

    try {
        const paymentInstance = await instance.orders.create(options);
        console.log(paymentInstance);
        
        res.status(200).json(
            new ApiResponse(200, {
                courseId,
                courseName: course.name,
                courseDescription: course.description,
                orderId: paymentInstance.id,
                amount
            }, "Order created successfully")
        )
    } catch (error) {
        console.log(error.message);
        res.status(500).json(
            new ApiResponse(500, {}, "Could not initiate order !!")
        )
    }

})

const verifySignature = asyncHandler (async (req, res) => {
    const webhookSecret = "12345678";

    const signature = req.headers["x-razorpay-signature"];

    const shasum =  crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest) {
        console.log("Payment is Authorised");

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
                //fulfil the action

                //find the course and enroll the student in it
                const enrolledCourse = await Course.findOneAndUpdate(
                                                {_id: courseId},
                                                {$push:{studentsEnrolled: userId}},
                                                {new:true},
                );

                if(!enrolledCourse) {
                    return res.status(500).json({
                        success:false,
                        message:'Course not Found',
                    });
                }

                console.log(enrolledCourse);

                //find the student andadd the course to their list enrolled courses me 
                const enrolledStudent = await User.findOneAndUpdate(
                                                {_id:userId},
                                                {$push:{courses:courseId}},
                                                {new:true},
                );

                console.log(enrolledStudent);

                //mail send krdo confirmation wala 
                const emailResponse = await mailSender(
                                        enrolledStudent.email,
                                        "Congratulations from CodeHelp",
                                        "Congratulations, you are onboarded into new CodeHelp Course",
                );

                console.log(emailResponse);
                return res.status(200).json({
                    success:true,
                    message:"Signature Verified and COurse Added",
                });


        }       
        catch(error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }
    else {
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        });
    }
})