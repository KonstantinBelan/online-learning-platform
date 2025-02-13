const Lesson = require('../models/Lesson')
const Course = require('../models/Course')

// Функция создания урока
exports.createLesson = async (req, res) => {
	try {
		const { title, description, content, course, order, duration, type } =
			req.body

		const newLesson = new Lesson({
			title,
			description,
			content,
			course,
			order,
			duration,
			type,
		})

		await newLesson.save()

		// Добавляем ссылку на урок в массив уроков курса
		const courseObj = await Course.findById(course)
		if (!courseObj) {
			return res.status(404).json({ message: 'Course not found' })
		}

		courseObj.lessons.push(newLesson._id)
		await courseObj.save()

		res.status(201).json({ message: 'Lesson created', lesson: newLesson })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Функция получения всех уроков курса
exports.getAllLessonsByCourse = async (req, res) => {
	try {
		const courseId = req.params.courseId
		const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 }) // Получаем все уроки курса и сортируем по порядку

		res.status(200).json({ lessons })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Функция получения урока по ID
exports.getLessonById = async (req, res) => {
	try {
		const lesson = await Lesson.findById(req.params.id)

		if (!lesson) {
			return res.status(404).json({ message: 'Lesson not found' })
		}

		res.status(200).json({ lesson })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Функция обновления урока
exports.updateLesson = async (req, res) => {
	try {
		const { title, description, content, order, duration, type } = req.body

		const lesson = await Lesson.findByIdAndUpdate(
			req.params.id,
			{
				title,
				description,
				content,
				order,
				duration,
				type,
				updatedAt: Date.now(),
			},
			{ new: true }
		)

		if (!lesson) {
			return res.status(404).json({ message: 'Lesson not found' })
		}

		res.status(200).json({ message: 'Lesson updated', lesson })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Функция удаления урока
exports.deleteLesson = async (req, res) => {
	try {
		const lesson = await Lesson.findByIdAndDelete(req.params.id)

		if (!lesson) {
			return res.status(404).json({ message: 'Lesson not found' })
		}

		// Удаляем ссылку на урок из массива уроков курса
		const courseObj = await Course.findById(lesson.course)
		if (courseObj) {
			courseObj.lessons.pull(lesson._id)
			await courseObj.save()
		}

		res.status(200).json({ message: 'Lesson deleted' })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}
