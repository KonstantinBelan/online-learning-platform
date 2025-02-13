const express = require('express')
const router = express.Router()
const lessonController = require('../controllers/lessonController')
const authMiddleware = require('../middleware/authMiddleware')

// Маршрут для создания урока (только для авторизованных пользователей)
router.post('/', authMiddleware, lessonController.createLesson)

// Маршрут для получения всех уроков курса (доступен всем)
router.get('/:courseId', lessonController.getAllLessonsByCourse)

// Маршрут для получения урока по ID (доступен всем)
router.get('/:id', lessonController.getLessonById)

// Маршрут для обновления урока (только для авторизованных пользователей)
router.put('/:id', authMiddleware, lessonController.updateLesson)

// Маршрут для удаления урока (только для авторизованных пользователей)
router.delete('/:id', authMiddleware, lessonController.deleteLesson)

module.exports = router
