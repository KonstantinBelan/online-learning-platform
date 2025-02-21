// const mongoose = require('mongoose')
const mongoose = global.__MONGOOSE__ || require('mongoose')
const { Schema } = mongoose

const enrollmentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Ссылка на модель User (кто записан на курс)
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course', // Ссылка на модель Course (на какой курс записан)
      required: true,
    },
    lives: {
      type: Number,
      default: 3, // Количество жизней по умолчанию
    },
    completedLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Lesson', // Ссылка на модель Lesson (какие уроки пройдены)
      },
    ],
    lastActivity: {
      type: Date,
      default: Date.now, // Дата последней активности (выполненное задание, просмотр урока и т.д.)
    },
    // Дополнительные поля (например, дата регистрации на курс, прогресс в процентах и т.д.)
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0, // Прогресс в процентах (от 0 до 100)
    },
    lastLessonCompleted: { type: Date },
    isCompleted: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
  },
  {
    timestamps: true, // Добавляем поля createdAt и updatedAt
  }
)

const Enrollment = mongoose.model('Enrollment', enrollmentSchema)

module.exports = Enrollment
