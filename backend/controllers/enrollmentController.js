const Enrollment = require('../models/Enrollment')
const Lesson = require('../models/Lesson')
const Course = require('../models/Course')

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
      return res.status(400).json({ message: 'Student already enrolled on this course' })
    }

    // Получаем информацию о курсе, чтобы узнать defaultLives
    const courseData = await Course.findById(course)
    if (!courseData) {
      return res.status(404).json({ message: 'Course not found' })
    }

    const newEnrollment = new Enrollment({
      user: user,
      course: course,
      lives: courseData.defaultLives, // Устанавливаем lives на основе defaultLives из Course
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

    res.status(200).json({ lives: enrollment.lives, progress: enrollment.progress })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Проверка домашних заданий
exports.completeLesson = async (req, res) => {
  try {
    const { lessonId, courseId } = req.params
    const userId = req.user._id

    // Проверяем, что урок существует
    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    // Проверяем, что курс существует
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    // Находим запись о зачислении
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    })

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' })
    }

    // Обновляем lastLessonCompleted
    enrollment.lastLessonCompleted = new Date()
    await enrollment.save()

    res.status(200).json({ message: 'Lesson completed successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}
