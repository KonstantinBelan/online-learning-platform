const mongoose = require('mongoose')
const { Schema } = mongoose

const lessonSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    content: {
      type: String, // Здесь может быть текст, HTML, или ссылка на видео/файл
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course', // Ссылка на модель Course (к какому курсу относится урок)
      required: true,
    },
    order: {
      type: Number, // Порядок урока в курсе
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    // Дополнительные поля (например, продолжительность, тип урока и т.д.)
    duration: {
      type: Number, // Продолжительность урока в минутах
      default: 0,
    },
    type: {
      type: String, // Тип урока (например, video, text, quiz)
      default: 'text',
    },
    hasHomework: {
      type: Boolean,
      default: false, // Есть ли у урока домашнее задание
    },
    homeworkDeadline: {
      type: Number, // Срок сдачи домашнего задания (в часах)
      default: 24, // По умолчанию 24 часа
    },
    homework: {
      // Add homework field
      type: Schema.Types.ObjectId,
      ref: 'Homework', // Ссылка на модель Homework
    },
    lessonOrder: {
      type: Number,
      required: true,
      min: 1, // Уроки должны иметь порядковый номер, начиная с 1
    },
    nextLessonUnlockCondition: {
      type: {
        type: String,
        enum: ['immediately', 'homework_approved', 'after_time', 'after_previous_lesson_completed', 'telegram_subscribed', 'instagram_subscribed', 'after_registration_days'],
        default: 'immediately',
      },
      homework_min_grade: {
        type: Number,
        min: 3,
        default: 3,
        required: function () {
          return this.nextLessonUnlockCondition?.type === 'homework_approved'
        },
      },
      unlock_time: {
        type: Date,
        required: function () {
          return this.nextLessonUnlockCondition?.type === 'after_time'
        },
      },
      unlockAfterDays: {
        type: Number,
        required: function () {
          return this.nextLessonUnlockCondition?.type === 'after_registration_days'
        },
        default: 0,
      },
      // Telegram and Instagram
    },
  },
  {
    timestamps: true, // Добавляем поля createdAt и updatedAt
  }
)

const Lesson = mongoose.model('Lesson', lessonSchema)

module.exports = Lesson
