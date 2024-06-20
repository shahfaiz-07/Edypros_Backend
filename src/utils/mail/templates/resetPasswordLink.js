export const resetPasswordLink = (url) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
        .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
            }
    </style>
</head>
<body>
    <div class="container">
        <a href="http://localhost:3000"><img class="logo" src="https://res.cloudinary.com/cloudjerry07/image/upload/v1718883581/Edypros/logos/vo34zouqrmxod7r738ir.png"
                alt="Edypros Logo"></a>
        <div class="message">Password Reset Link</div>
        <div class="body">
            <p>Dear User,</p>
            <p>Below is you password reset link for your Edypros Account :</p>
            <a href="${url}">${url}</a>
            <p>This link is valid for only 5 minutes. Do not share it with anyone. If you did not request this link, please disregard this email.</p>
        </div>
        <div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a
                href="mailto:edypros.owner@gmail.com">edypros.owner@gmail.com</a>. We are here to help!</div>
    </div>
</body>
</html>`
}