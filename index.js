import express from 'express';
import dotenv from 'dotenv';
import userRouter from './routers/userRouter.js';
import { connectDB } from './dbConnection/mongoose.js';
import session from 'express-session';
import passport from 'passport';
import passportFacebook from './routers/passportFacebookRouter.js';
import passportGoogle from './routers/passportGoogleRouter.js';
import User from './models/userModel.js';
import cors from 'cors'


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

connectDB();

// Configure Express Session
app.use(session({
  secret: process.env.KEY_TOKEN || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Initialize Passport and Passport Session Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(cors())

// Passport Serialization
passport.serializeUser((user, done) => done(null, user.id)); // Serialize only the user ID

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});


app.get('/', (req, res) => {
  res.send('hello world!');
});
// Middleware for JSON parsing
app.use(express.json());

// Route handlers
app.use('/user', userRouter);
app.use('/', passportGoogle);
app.use('/auth/facebook', passportFacebook);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
