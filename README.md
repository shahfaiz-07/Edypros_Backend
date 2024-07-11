## Overview
Edypros is a fully functional ed-tech platform that enables users to create, consume, and rate educational content. The backend is built using Node.js and Express.js, providing scalable and robust server-side functionalities.

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt
- Cloudinary
- Razorpay

## Features
- **User Authentication**: Secure login and registration.
- **Course Management**: APIs for creating, updating, deleting, and fetching courses.
- **User Management**: APIs for fetching and updating user details.
- **Wishlist**: APIs for managing user wishlists.
- **Payment Integration**: Razorpay payment gateway for handling transactions, currently in test mode.

## Getting Started
### Prerequisites
- Node.js
- npm (or yarn)
- MongoDB

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/shahfaiz-07/Edypros_Backend.git
   cd Edypros_Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:
   ```env
   PORT=8080
   FRONTEND_URI=your_frontend_uri
   CORS_ORIGIN=your_cors_origin
   MONGODB_URI=your_mongodb_uri
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=your_access_token_expiry
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry
   MAIL_HOST=smtp.gmail.com
   MAIL_USER=your_mail_user
   MAIL_PASS=your_mail_pass
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   RAZORPAY_KEY=your_razorpay_key
   RAZORPAY_SECRET=your_razorpay_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The backend server will start on `http://localhost:8080`.

## Deployment
The backend is deployed on Render.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.