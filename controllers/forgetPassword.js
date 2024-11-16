import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto'; 
import User from '../models/userModel.js'; 
import VerificationCode from '../models/verifyCodeModel.js'; 

dotenv.config();


const generateVerificationCode = () => {
    return crypto.randomInt(100000, 999999).toString(); 
};

// Nodemailer mailtrap setup
const transporter = nodemailer.createTransport({
    host: process.env.E_HOST,
    port: 587,
    auth: {
        user: process.env.E_USER,
        pass: process.env.E_PASSWORD,
    },
});
// request for password reset
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        const verificationCode = generateVerificationCode();

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

        await VerificationCode.findOneAndUpdate(
            { email },
            { code: verificationCode, expiresAt },
            { upsert: true } 
        );

        await transporter.sendMail({
            to: email,
            subject: "Your Verification Code",
            text: `Your verification code is: ${verificationCode}`,
        });

        res.status(200).json({ message: "Verification code sent to your email" });
    } catch (error) {
        res.status(500).json({ message: "Error sending verification code", error: error.message });
        console.error(error);
    }
};

// verify code  
export const verifyCode = async (req, res) => {
    const { email, code } = req.body;

    try {
        const verification = await VerificationCode.findOne({ email });

        if (!verification) {
            return res.status(400).json({ message: "No verification code found for this email" });
        }
        if (new Date().getTime() > verification.expiresAt.getTime()) {
            return res.status(400).json({ message: "Verification code has expired" });
        }

        if (verification.code.toString() === code.toString()) {
            await VerificationCode.deleteOne({ email });

            res.status(200).json({ message: "Verification code verified successfully" });
        } else {
            res.status(400).json({ message: "Invalid verification code" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error verifying the code", error: error.message });
        console.error(error);
    }
};

// Reset new  password
export const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });


        const hashedPassword = await bcrypt.hash(password, 10);
        
      
        user.password = hashedPassword;
        
        user.provider = user.provider || "Local";

        await user.save();
      

        res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password", error: error.message });
    }
};
