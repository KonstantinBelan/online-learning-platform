const Enrollment = require('../models/Enrollment')

// Функция регистрации студента на курс
exports.enrollStudent = async (req, res) => {
	try {
		const { course } = req.body
		const user = req.user._id // Получаем ID пользователя из middleware

		// Проверяем, не записан ли студент уже на этот курс
		const existingEnrollment = await Enrollment.findOne({
			user: user,
			course: course,
		})
		if (existingEnrollment) {
			return res
				.status(400)
				.json({ message: 'Student already enrolled on this course' })
		}

		const newEnrollment = new Enrollment({
			user: user,
			course: course,
		})

		await newEnrollment.save()

		res.status(201).json({
			message: 'Student enrolled on the course',
			enrollment: newEnrollment,
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Функция получения информации о количестве жизней у студента на курсе
exports.getEnrollmentInfo = async (req, res) => {
	try {
		const { courseId } = req.params
		const user = req.user._id // Получаем ID пользователя из middleware

		const enrollment = await Enrollment.findOne({
			user: user,
			course: courseId,
		})

		if (!enrollment) {
			return res.status(404).json({ message: 'Enrollment not found' })
		}

		res
			.status(200)
			.json({ lives: enrollment.lives, progress: enrollment.progress })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}
