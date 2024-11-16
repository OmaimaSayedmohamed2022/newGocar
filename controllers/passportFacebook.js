import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email'],
  },
  async function (accessToken, refreshToken, profile, cb) {
    try {
      let user = await User.findOne({ facebookId: profile.id });

      if (!user) {
        // Handle case if profile.emails is undefined
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';

        user = new User({
          facebookId: profile.id,
          displayName: profile.displayName,
          email: email,
        });

        await user.save();
      }
      
      cb(null, user);
    } catch (err) {
      cb(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user)).catch(err => done(err));
});

export const facebookSignIn = async (req, res) => {
  try {
    if (!req.user) {
      console.log("Facebook User:", req.user);
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const facebookId = req.user.id;
    let user = await User.findOneAndUpdate(
      { facebookId },
      {
        $setOnInsert: {
          facebookId,
          email: req.user.emails ? req.user.emails[0].value : undefined,
          userName: req.user.displayName,
          provider: 'facebook',
        },
      },
      { new: true, upsert: true }
    );

    // Generate token and check token limit
    const token = jwt.sign({ userId: user._id, provider: 'facebook' }, process.env.KEY_TOKEN);
    user.token = user.token || [];  // Ensure token is an array

    if (user.token.length >= parseInt(process.env.COUNT_TOKEN, 10)) {
      return res.status(500).json({ message: `Cannot have more than ${process.env.COUNT_TOKEN} devices` });
    }

    user.token.push(token);
    await user.save();

    return res.status(201).json({ status: 1, success: 'Logged Successfully', token, provider: 'facebook' });
  } catch (error) {
    return res.status(500).json({ status: 0, message: 'Internal Server Error', error: error.message });
  }
};

export const facebookLogout = async (req, res) => {
  const { _id, token } = req.body;
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ status: 0, message: 'User not found' });
    }

    // Remove specific token from the user's token array
    user.token = user.token.filter(userToken => userToken !== token);
    await user.save();

    return res.status(200).json({ status: 1, success: 'Logout Successfully' });
  } catch (err) {
    return res.status(400).json({ message: 'Failed to sign out facebook user' });
  }
};
