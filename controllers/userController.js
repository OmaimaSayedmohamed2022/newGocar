import User from'../models/userModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


export const register = async (req, res) => {
    try {
        const { userName, email, password, confirmPassword, phone, role } = req.body;
        
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ userName, email, phone, role, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: 'User registered successfully', newUser });
    } catch (error) {
        console.log("new user register error", error);
        res.status(404).json({ message: "new user register error", error: error.message });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }


        const token = jwt.sign({ userId: user._id }, process.env.KEY_TOKEN, { expiresIn: '1h' });
        
        res.status(200).json({ message: 'User login successfully', token });
    } catch (error) {
        console.log('Error in login:', error);
        return res.status(500).send({ message: 'Error in login', error: error.message });
    }
};