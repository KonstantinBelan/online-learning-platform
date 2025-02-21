const express = require('express')
const mongoose = require('mongoose')
const Student = require('../models/Student') // Путь к модели Student
const Enrollment = require('../models/Enrollment') // Путь к модели Student

const router = express.Router()

// GET /api/student/:studentId - Получение информации о студенте
router.get('/:studentId', async (req, res) => {
	try {
		const studentId = req.params.studentId

		// Проверка, является ли studentId валидным ObjectId
		if (!mongoose.Types.ObjectId.isValid(studentId)) {
			return res.status(400).json({ message: 'Invalid studentId' })
		}

		const student = await Student.findById(studentId)

		if (!student) {
			return res.status(404).json({ message: 'Student not found' })
		}

		res.json(student)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server Error' })
	}
})

// GET /api/student/:studentId/courses - Получение списка курсов, на которые записан студент
router.get('/:studentId/courses', async (req, res) => {
	try {
		const studentId = req.params.studentId

		// Проверка, является ли studentId валидным ObjectId
		if (!mongoose.Types.ObjectId.isValid(studentId)) {
			return res.status(400).json({ message: 'Invalid studentId' })
		}

		// Находим студента по studentId в коллекции students
		const student = await Student.findById(studentId)

		if (!student) {
			return res.status(404).json({ message: 'Student not found' })
		}

		// Получаем userId студента
		const userId = student.userId

		// Ищем все записи в коллекции enrollments, связанные с данным userId
		const enrollments = await Enrollment.find({ user: userId }).populate(
			'course'
		)

		if (!enrollments || enrollments.length === 0) {
			return res
				.status(404)
				.json({ message: 'No courses found for this student' })
		}

		// Извлекаем курсы из записей enrollments
		const courses = enrollments.map(enrollment => enrollment.course)

		res.json(courses)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server Error' })
	}
})

module.exports = router
