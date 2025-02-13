const express = require('express')
const router = express.Router()
const courseController = require('../controllers/courseController')
const authMiddleware = require('../middleware/authMiddleware') // Защищаем маршруты с помощью middleware

// Маршрут для создания курса (только для авторизованных пользователей)
router.post('/', authMiddleware, courseController.createCourse)

// Маршрут для получения всех курсов (доступен всем)
router.get('/', courseController.getAllCourses)

// Маршрут для получения курса по ID (доступен всем)
router.get('/:id', courseController.getCourseById)

// Маршрут для обновления курса (только для авторизованных пользователей и автора курса)
router.put('/:id', authMiddleware, courseController.updateCourse)

// Маршрут для удаления курса (только для авторизованных пользователей и автора курса)
router.delete('/:id', authMiddleware, courseController.deleteCourse)

module.exports = router
