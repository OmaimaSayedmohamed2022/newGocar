import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

export async function verifyToken(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.KEY_TOKEN);

    const user = await User.findById(decodedToken.userId);

   const userId= decodedToken.userId;

    if(!userId){
      res.send('userId not found')
    }

    if (!user) {
      return res.status(404).json({ status: 0, message: 'User Not Found' });
    }


    req.userId = decodedToken.userId;
    req.user = user;

    next();
  } catch (error) {
    console.error('Error in verifyToken:', error);
    return res.status(403).json({ message: 'Token invalid' });
  }
}




