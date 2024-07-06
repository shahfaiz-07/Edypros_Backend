import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Razorpay from "razorpay";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { CourseProgress } from './../models/courseProgress.model.js';
import { sendMail } from './../utils/mailSender.js';
import { courseEnrollmentEmail } from './../utils/mail/templates/courseEnrollment.js';
import { paymentSuccess } from "../utils/mail/templates/paymentConfirmation.js";
import crypto from "crypto"

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

const capturePayment = asyncHandler(async (req, res) => {
  console.log("CAPTURE PAYMENT CONTROLLER")
  const { courses } = req.body;
  const userId = req.user?._id;

  if (courses.length === 0) {
    throw new ApiError(400, "Provide atleast 1 course ID");
  }

  let totalAmount = 0;

  for (const courseId of courses) {
    let course;
    try {
      if (!isValidObjectId(courseId)) {
        throw new ApiError(404, "Invalid Course ID !!");
      }

      course = await Course.findById(courseId);
      if (!course) {
        throw new ApiError(404, "Course not found !!");
      }

      if (course.studentsEnrolled.includes(userId)) {
        throw new ApiError(400, "Student is already enrolled !!");
      }

      totalAmount += course.price;
    } catch (error) {
      console.log(error);
    }
  }

  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  };

  try {
    const paymentResponse = await instance.orders.create(options);

    return res.status(200).json(new ApiResponse(200, paymentResponse));
  } catch (error) {
    console.log(error);
  }
});

const verifySignature = asyncHandler(async (req, res) => {
  console.log("VERIFY SIGNATURE CONTROLLER")
  console.log(req.body)
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;
  const { courses } = req.body;
  const userId = req.user._id;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    throw new ApiError(400, "All fields are required !!")
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id;

  const enrolleStudent = async (courses, userId) => {
    if (!courses || !userId) {
      throw new ApiError(400, "Course and userId are required !!")
    }
    try {
      //update the course
      for (const course_id of courses) {
        console.log("verify courses=", course_id);
        const course = await Course.findByIdAndUpdate(
          course_id,
          { $push: { studentsEnrolled: userId } },
          { new: true }
        );
        //update the user
        const user = await User.findByIdAndUpdate(
          userId,
          { $push: { registeredCourses: course_id } },
          { new: true }
        );
        // if item was on wishlist remove it
        if(user.wishlist.includes(course_id)) {
          console.log(`UPDATING WISHLIST FOR COURSE ID : ${course_id}`.bgCyan)
          user.wishlist = user.wishlist.filter( (courseID) => courseID.toString() !== course_id.toString() )
        }

        await user.save()
        //set course progress
        const newCourseProgress = new CourseProgress({
          userId: userId,
          courseId: course_id,
        });
        await newCourseProgress.save();

        //add new course progress to user
        await User.findByIdAndUpdate(
          userId,
          {
            $push: { courseProgress: newCourseProgress._id },
          },
          { new: true }
        );
        //send email
        const recipient = await User.findById(userId);
        console.log("recipient=>", course);
        const courseName = course.name;
        const courseDescription = course.description;
        const thumbnail = course.thumbnail;
        const userEmail = recipient.email;
        const userName = recipient.firstName + " " + recipient.lastName;
        const emailTemplate = courseEnrollmentEmail(
          courseName,
          userName,
          courseDescription,
          thumbnail
        );
        await sendMail(
          userEmail,
          `You have successfully enrolled for ${courseName}`,
          emailTemplate
        );
      }
      return res.status(200).json(
        new ApiResponse(200, {}, "Payment Successfull !!")
      );
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  try {
    //verify the signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");
    if (generatedSignature === razorpay_signature) {
      await enrolleStudent(courses, userId);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const sendPaymentSuccessEmail = asyncHandler(async (req, res) => {
  console.log("PAYMENT SUCCESS EMAIL")
  const {orderId, paymentId, amount} = req.body;
  const userId = req.user?._id;
  console.log(req.body)
  try {
    if(!orderId || !paymentId || !amount || !userId) {
      throw new ApiError(400, "All Fields are required !!")
    }
  } catch (error) {
    console.log(`${error.message}`.bgRed)
    return res.status(error.statusCode).json(
      new ApiResponse(error.statusCode, null, error.message)
    )
  }

  try {
    const enrolledStudent = await User.findById(userId);
    await sendMail(
      enrolledStudent.email,
      `Payment Successfull to Edypros`,
      paymentSuccess(amount/100, paymentId, orderId, enrolledStudent.firstName, enrolledStudent.lastName)
    )

    return res.status(200).json(
      new ApiResponse(200, {}, "Payment Confirmation Email Sent Successfully !!")
    )

  } catch (error) {
    console.log("Error in sending Email !!");
    return res.status(500).json(
      new ApiResponse(500, {} , error.message)
    )
  }
})


export {capturePayment, verifySignature, sendPaymentSuccessEmail}