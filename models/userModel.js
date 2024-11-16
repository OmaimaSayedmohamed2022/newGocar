import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: function () {
      return this.provider === undefined;
    },
  },
  password: {
    type: String,
    required: function () {
      return this.provider === undefined;
    },
  },
  email: {
    type: String,
    required: function () {
      return this.provider === undefined;
    },
  },
  facebookId: String,
  googleId: String,
  provider: {
    type: String,
    enum: ['facebook', 'google', 'local'],
    default: 'local'
  },
  token: {
    type: [String],
    default: []
  }
});

const User = mongoose.model('User', userSchema);
export default User;
