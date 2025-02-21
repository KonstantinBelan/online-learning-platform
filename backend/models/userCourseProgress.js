// userCourseProgress.model.js
const mongoose = require('mongoose')
// const mongoose = global.__MONGOOSE__ || require('mongoose')

const userCourseProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lastLessonStartTime: { type: Date },
  lastLessonCompletedTime: { type: Date },
  lives: { type: Number, default: 3 },
})

const UserCourseProgress = mongoose.model('UserCourseProgress', userCourseProgressSchema)

module.exports = UserCourseProgress
