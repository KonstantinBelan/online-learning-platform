const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcrypt') // Import bcrypt

const userSchema = new Schema({
  name: { type: String, required: true },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
})

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
  } catch (err) {
    return next(err)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password)
  } catch (err) {
    return false
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User
