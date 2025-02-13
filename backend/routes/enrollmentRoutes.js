const express = require('express')
const router = express.Router()
const enrollmentController = require('../controllers/enrollmentController')
const authMiddleware = require('../middleware/authMiddleware')

// Маршрут для регистрации студента на курс (только для авторизованных пользователей)
router.post('/', authMiddleware, enrollmentController.enrollStudent)

// Маршрут для получения информации о количестве жизней у студента на курсе (только для авторизованных пользователей)
router.get('/:courseId', authMiddleware, enrollmentController.getEnrollmentInfo)

module.exports = router
