const transporter = require("../config/mailConfig");
const otpVerifyModel = require('../model/otpModel');

const sendEmailVerificationOTP = async (req, user) => {
    // Generate a random 4-digit number
    const otp = Math.floor(1000 + Math.random() * 9000);

    const gg = await new otpVerifyModel({ userId: user._id, otp: otp }).save();

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "🔐 OTP Verification - Verify Your Account",
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .otp-container {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 25px 0;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #e83e8c;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #dee2e6;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            margin: 10px 0;
        }
        .highlight {
            color: #e83e8c;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Email Verification Required</h1>
        </div>
        
        <div class="content">
            <p>Dear <strong>${user.name}</strong>,</p>
            
            <p>Thank you for signing up with our website! To complete your registration and secure your account, please verify your email address using the One-Time Password (OTP) below:</p>
            
            <div class="otp-container">
                <p style="margin: 0 0 10px 0; color: #6c757d;">Your verification code:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 14px;">Valid for <span class="highlight">15 minutes</span></p>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> 
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Do not share this OTP with anyone</li>
                    <li>Our team will never ask for your OTP</li>
                    <li>This code expires in 15 minutes</li>
                </ul>
            </div>
            
            <p>Enter this code on the verification page to complete your registration process.</p>
            
            <p>If you didn't request this verification code, please ignore this email or contact our support team immediately.</p>
            
            <p>Best regards,<br><strong>The Website Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
        `
    });

    return otp;
};

module.exports = sendEmailVerificationOTP;