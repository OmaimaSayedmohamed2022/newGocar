import express from 'express'
const router = express.Router();
import {facebookSignIn ,facebookLogout} from '../controllers/passportFacebook.js'
import passport from 'passport'


// Redirect to Facebook for authentication
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

// Handle Facebook callback and sign in
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/facebook/error' }),
  facebookSignIn 
)

// Success and error routes
router.get('/auth/facebook/success', (req, res) => {
  res.status(200).json({ message: 'Login successful!', user: req.user });
});

router.get('/auth/facebook/error', (req, res) => {
  res.status(500).json({ status: 0, error: 'Error logging in via Facebook' });
});

// Logout route
router.delete('/auth/facebook/logout', facebookLogout);

export default router;
