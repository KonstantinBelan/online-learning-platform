const express = require('express')
const router = express.Router()
const User = require('../models/User') // Путь к модели User
const Course = require('../models/Course') // Путь к модели Course
const Enrollment = require('../models/Enrollment')
const { authMiddleware, checkRole } = require('../middleware/authMiddleware') // Путь к authMiddleware

// GET /api/users/me
router.get('/me', authMiddleware, async (req, res) => {
	try {
		// req.user теперь содержит информацию о пользователе, полученную из authMiddleware
		const user = await User.findById(req.user._id).select('-password') // Находим пользователя по ID из JWT, исключаем пароль
		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}
		res.json(user)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})

// GET /api/users/me/courses
router.get('/me/courses', authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.user._id)
		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		// Находим записи в enrollments, связанные с пользователем
		const enrollments = await Enrollment.find({ user: req.user._id }).populate({
			path: 'course',
			match: { status: 'published' },
		}) // Используем поле "user" вместо "student"

		// Извлекаем курсы из enrollments
		const courses = enrollments
			.map(enrollment => enrollment.course)
			.filter(course => course !== null)

		res.json(courses)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})

// Общая функция проверки доступа к курсу/уроку
router.get('/me/courses/:courseId/access', authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.user._id)
		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		const { courseId } = req.params
		const enrollment = await Enrollment.findOne({
			user: req.user._id,
			course: courseId,
		})

		if (!enrollment) {
			return res
				.status(204)
				.json({ message: 'Course not found or no enrollment' }) // Или 403 Forbidden
		}

		res.status(200).json({ hasAccess: true }) // Return success if enrollment exists
	} catch (error) {
		console.error('Error checking course access:', error)
		res.status(500).json({ message: 'Server error' })
	}
})

module.exports = router
