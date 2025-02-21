const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const lessonController = require('../controllers/lessonController')
const { authMiddleware, checkRole } = require('../middleware/authMiddleware')
const Lesson = require('../models/Lesson') // Путь к модели Student

// Маршрут для создания урока (только для авторизованных пользователей)
router.post('/', authMiddleware, lessonController.createLesson)

// Маршрут для получения всех уроков курса (доступен всем)
// router.get('/:courseId', lessonController.getAllLessonsByCourse)

// Маршрут для получения урока по ID (доступен всем)
router.get('/:lessonId', lessonController.getLessonById)

// Маршрут для обновления урока (только для авторизованных пользователей)
router.put('/:lessonId', authMiddleware, lessonController.updateLesson)

// Маршрут для удаления урока (только для авторизованных пользователей)
router.delete('/:lessonId', authMiddleware, lessonController.deleteLesson)

// Маршрут для получения информации об уроке с проверкой сданного ДЗ (для авторизованных)
router.get('/:lessonId/with-homework', authMiddleware, lessonController.getLessonWithHomeworkStatus)

// Маршрут для обновления статуса выполнения домашнего задания (для авторизованных)
// router.put(
// 	'/:lessonId/homework',
// 	authMiddleware,
// 	lessonController.updateHomeworkStatus
// )

// // Маршрут для получения домашнего задания для урока
// router.get(
// 	'/:lessonId/homework',
// 	authMiddleware,
// 	checkRole('admin'),
// 	lessonController.getHomeworkForLesson
// )

// Маршрут для создания нового домашнего задания
router.post('/:lessonId/homework', authMiddleware, lessonController.createHomework)

// Маршрут для отправки решения домашнего задания (для авторизованных)
router.post('/:lessonId/submit-homework', authMiddleware, lessonController.submitHomework)

// Маршрут для оценки решения домашнего задания (только для администраторов)
// router.put(
// 	'/:submissionId/grade',
// 	authMiddleware,
// 	checkRole('admin'),
// 	lessonController.gradeHomework
// )

// Маршрут для получения всех решений домашних заданий (только для администраторов)
// router.get(
// 	'/admin/submissions',
// 	authMiddleware,
// 	checkRole('admin'),
// 	lessonController.getAllSubmissions
// )
// lessonRoutes.js
// router.get('/admin/submissions', lessonController.getAllSubmissions) // Remove authMiddleware and checkRole

// Маршрут для оценки решения домашнего задания (только для администраторов)
router.put('/:submissionId/grade', authMiddleware, checkRole('admin'), lessonController.gradeHomework)

// Завершение урока
router.post('/:lessonId/complete/:courseId', authMiddleware, lessonController.completeLesson)
// Проверка выполнения урока
router.get('/:lessonId/complete', authMiddleware, lessonController.checkLessonCompletion)

router.get('/:lessonId/homework', async (req, res) => {
  try {
    const lessonId = req.params.lessonId

    // Проверка, является ли lessonId валидным ObjectId
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: 'Invalid lessonId' })
    }

    const lesson = await Lesson.findById(lessonId).populate('homework')

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    const homework = lesson.homework

    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' })
    }

    res.json(homework)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

module.exports = router
