
import express from 'express';
import passport from 'passport';
import { googleSignIn,googleLogout } from '../controllers/passportGoogle.js';
const router = express.Router();

// Route to initiate Google authentication
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/google/error' }),
  (req, res) => {
    googleSignIn(req, res);
  }
);

// Success and error routes
router.get('/success', (req, res) => res.json({
     status: 1, success: 'Logged in successfully' 
    }));
router.get('/auth/google/error', (req, res) => 
  res.status(500).json({ status: 0, error: 'Error logging in via Google.' })
);

// Google Logout route
router.delete('/logout', googleLogout);

export default router;
