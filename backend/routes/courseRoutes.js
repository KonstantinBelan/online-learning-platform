const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const courseController = require('../controllers/courseController')
const lessonController = require('../controllers/lessonController')
const enrollmentController = require('../controllers/enrollmentController')
const { authMiddleware, checkRole } = require('../middleware/authMiddleware')
const Course = require('../models/Course')
const checkLives = require('../middleware/checkLives')
const checkCourseAccess = require('../middleware/checkCourseAccess')

// Маршрут для получения курса по ID (доступен всем)
router.get('/:id', authMiddleware, checkCourseAccess, courseController.getCourseById)

// Маршрут для обновления курса (только для авторизованных пользователей и автора курса)
router.put('/:id', authMiddleware, courseController.updateCourse)

// Маршрут для удаления курса (только для авторизованных пользователей и автора курса)
router.delete('/:id', authMiddleware, courseController.deleteCourse)

// Маршрут для создания курса (только для авторизованных пользователей)
router.post('/', authMiddleware, courseController.createCourse)

// Маршрут для получения всех курсов (доступен всем)
router.get('/', courseController.getAllCourses)

// GET /api/courses/:courseId/lessons - Получение списка уроков в курсе
router.get('/:courseId/lessons', async (req, res) => {
  try {
    const courseId = req.params.courseId

    // Проверка, является ли courseId валидным ObjectId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid courseId' })
    }

    const course = await Course.findById(courseId).populate('lessons') // Находим курс и заполняем уроки

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    const lessons = course.lessons // Получаем список уроков

    res.json(lessons) // Отправляем список уроков
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

router.post('/:courseId/lessons/:lessonId/homework', authMiddleware, lessonController.submitHomework)

router.put(
  '/:courseId/lessons/:lessonId/homework/:submissionId/status',
  authMiddleware,
  // checkRole('admin'),
  lessonController.updateHomeworkStatus
)

router.get('/:courseId/lessons/:lessonId/homework/:homeworkId/submission', authMiddleware, lessonController.getHomeworkSubmissionForStudent)

router.get('/:courseId/lessons/:lessonId/availability', authMiddleware, lessonController.getLessonAvailability)

// enrollmentRoutes.js
router.post('/:courseId/lessons/:lessonId/complete', authMiddleware, enrollmentController.completeLesson)

// GET /api/courses/:courseId/lessons/:lessonId
router.get('/:courseId/lessons/:lessonId', authMiddleware, checkCourseAccess, lessonController.getLessonLives)
// router.get('/:courseId/lessons/:lessonId', authMiddleware, checkCourseAccess, checkLives, lessonController.getLessonLives)

module.exports = router
