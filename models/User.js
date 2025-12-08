import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
});

let User;

try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', UserSchema);
}

export default User;
