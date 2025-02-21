// cron.js
const cron = require('node-cron')
const Enrollment = require('../models/Enrollment')
const Lesson = require('../models/Lesson')

cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date()
    const enrollments = await Enrollment.find({ isLocked: false, lastLessonCompleted: { $ne: null } }) // Ищем активные зачисления с завершенными уроками

    for (const enrollment of enrollments) {
      const courseId = enrollment.course
      const userId = enrollment.user

      // Получаем последний завершенный урок
      const lesson = await Lesson.findOne({ course: courseId }).sort({ _id: -1 }) // Получаем последний урок в курсе
      if (!lesson) continue

      const homeworkDeadline = lesson.homeworkDeadline || 24 // Получаем срок выполнения домашнего задания
      const deadline = new Date(enrollment.lastLessonCompleted.getTime() + homeworkDeadline * 60 * 60 * 1000) // Вычисляем срок

      if (now > deadline) {
        // Проверяем, выполнено ли домашнее задание (нужно реализовать эту функцию)
        const isHomeworkDone = await isHomeworkCompleted(userId, lesson._id) // Предполагаем, что у тебя есть функция isHomeworkCompleted

        if (!isHomeworkDone) {
          // Уменьшаем количество жизней
          enrollment.lives -= 1

          if (enrollment.lives <= 0) {
            enrollment.lives = 0
            enrollment.isLocked = true // Блокируем доступ к курсу
          }

          await enrollment.save()
          console.log(`Lives reduced for user ${userId} on course ${courseId}. Remaining lives: ${enrollment.lives}`)
        }
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error)
  }
})

// Функция для проверки, выполнено ли домашнее задание (нужно реализовать)
async function isHomeworkCompleted(userId, lessonId) {
  // Здесь нужно реализовать логику проверки, выполнено ли домашнее задание для урока
  // Например, проверить наличие записи о выполнении домашнего задания в базе данных
  return false // Вернуть true, если домашнее задание выполнено, и false, если нет
}
