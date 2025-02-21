const express = require('express')
const router = express.Router()
const { authMiddleware, checkRole } = require('../middleware/authMiddleware')
const adminController = require('../controllers/adminController')
const courseController = require('../controllers/courseController')
const lessonController = require('../controllers/lessonController')
const HomeworkSubmission = require('../models/HomeworkSubmission')
const mongoose = require('mongoose')

// --- Курсы ---
// Создание курса (POST /api/admin/courses)
router.post('/courses', authMiddleware, checkRole('admin'), courseController.createCourse)

// Получение всех курсов (GET /api/admin/courses)
router.get('/courses', authMiddleware, checkRole('admin'), courseController.getAllCourses)

// Получение курса по ID (GET /api/admin/courses/:courseId)
router.get('/courses/:courseId', authMiddleware, checkRole('admin'), courseController.getCourseById)

// Обновление курса (PUT /api/admin/courses/:courseId)
router.put('/courses/:courseId', authMiddleware, checkRole('admin'), courseController.updateCourse)

// Удаление курса (DELETE /api/admin/courses/:courseId)
router.delete('/courses/:courseId', authMiddleware, checkRole('admin'), courseController.deleteCourse)

// --- Уроки ---
// Создание урока для курса (POST /api/admin/courses/:courseId/lessons)
router.post('/courses/:courseId/lessons', authMiddleware, checkRole('admin'), lessonController.createLesson)

// Получение уроков для курса (GET /api/admin/courses/:courseId/lessons)
router.get('/courses/:courseId/lessons', authMiddleware, checkRole('admin'), lessonController.getAllLessonsByCourse)

// Получение урока по ID (GET /api/admin/lessons/:lessonId)
router.get('/lessons/:lessonId', authMiddleware, checkRole('admin'), lessonController.getLessonById)

// Обновление урока (PUT /api/admin/lessons/:lessonId)
router.put('/lessons/:lessonId', authMiddleware, checkRole('admin'), lessonController.updateLesson)

// Удаление урока (DELETE /api/admin/lessons/:lessonId)
router.delete('/lessons/:lessonId', authMiddleware, checkRole('admin'), lessonController.deleteLesson)

// Маршрут для получения всех решений домашних заданий (только для администраторов)
router.get('/submissions', authMiddleware, checkRole('admin'), adminController.getAllSubmissions)

// Маршрут для удаления решения домашнего задания
router.delete('/submissions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    // Проверка, является ли id валидным ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Неверный ID' })
    }

    const submission = await HomeworkSubmission.findByIdAndDelete(id)

    if (!submission) {
      return res.status(404).json({ message: 'Задание не найдено' })
    }

    res.json({ message: 'Задание успешно удалено' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// Маршрут для получения домашнего задания для урока
router.get('/lessons/:lessonId/homework', authMiddleware, checkRole('admin'), lessonController.getHomeworkForLesson)

router.post('/lessons/:lessonId/homework', authMiddleware, checkRole('admin'), lessonController.createHomework)

router.put('/homework/:homeworkId', authMiddleware, checkRole('admin'), lessonController.updateHomework)

router.delete('/homework/:homeworkId', authMiddleware, checkRole('admin'), lessonController.deleteHomework)

// Отслеживание всех домашних заданий
router.get('/lesson-completions', authMiddleware, adminController.getLessonCompletions)

// adminRoutes.js
router.get('/enrollments/:userId/:courseId', authMiddleware, checkRole('admin'), adminController.getEnrollment)
router.put('/enrollments/:userId/:courseId/reset-lives', authMiddleware, checkRole('admin'), adminController.resetLives)
router.put('/enrollments/:userId/:courseId/restore-access', authMiddleware, checkRole('admin'), adminController.restoreAccess)
router.get('/enrollments', authMiddleware, checkRole('admin'), adminController.getAllEnrollments) // Добавляем маршрут для получения всех зачислений

module.exports = router
