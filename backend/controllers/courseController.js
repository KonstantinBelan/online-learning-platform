const Course = require('../models/Course')

// Функция создания курса
exports.createCourse = async (req, res) => {
	try {
		const { title, description, imageUrl, category, price } = req.body
		const author = req.user._id // Получаем ID пользователя из middleware (req.user)

		const newCourse = new Course({
			title,
			description,
			imageUrl,
			category,
			price,
			author,
		})

		await newCourse.save()

		res.status(201).json({ message: 'Course created', course: newCourse })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Функция получения всех курсов
exports.getAllCourses = async (req, res) => {
	try {
		const courses = await Course.find().populate('author', 'username email') // Получаем все курсы и подгружаем информацию об авторе

		res.status(200).json({ courses })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Функция получения курса по ID
exports.getCourseById = async (req, res) => {
	try {
		const course = await Course.findById(req.params.id).populate(
			'author',
			'username email'
		) // Получаем курс по ID и подгружаем информацию об авторе

		if (!course) {
			return res.status(404).json({ message: 'Course not found' })
		}

		res.status(200).json({ course })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Функция обновления курса
exports.updateCourse = async (req, res) => {
	try {
		const { title, description, imageUrl, category, price } = req.body
		const course = await Course.findByIdAndUpdate(
			req.params.id,
			{
				title,
				description,
				imageUrl,
				category,
				price,
				updatedAt: Date.now(),
			},
			{ new: true }
		) // Обновляем курс и получаем обновленный курс

		if (!course) {
			return res.status(404).json({ message: 'Course not found' })
		}

		res.status(200).json({ message: 'Course updated', course })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Функция удаления курса
exports.deleteCourse = async (req, res) => {
	try {
		const course = await Course.findByIdAndDelete(req.params.id) // Удаляем курс по ID

		if (!course) {
			return res.status(404).json({ message: 'Course not found' })
		}

		res.status(200).json({ message: 'Course deleted' })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}
