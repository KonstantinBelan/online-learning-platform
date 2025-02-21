// backend/models/LessonCompletion.js
const mongoose = require('mongoose')

const lessonCompletionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  completionDate: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
})

const LessonCompletion = mongoose.model('LessonCompletion', lessonCompletionSchema)

module.exports = LessonCompletion
