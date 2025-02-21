const HomeworkSubmission = require('../models/HomeworkSubmission')
const LessonCompletion = require('../models/LessonCompletion')
const Enrollment = require('../models/Enrollment')
const Course = require('../models/Course')
const UserCourseProgress = require('../models/userCourseProgress')
// const Homework = require('../models/Homework')

// Функция для получения всех решений домашних заданий (только для администраторов)
exports.getAllSubmissions = async (req, res) => {
  try {
    console.log('Starting getAllSubmissions...')

    const submissions = await HomeworkSubmission.find()
      .populate({
        path: 'user',
        select: 'username email',
      })
      .populate({
        path: 'homework', // Changed from 'lesson' to 'homework'
        select: 'title description',
      })
      .sort({ submissionDate: -1 })
      .exec()

    console.log('Submissions:', submissions)

    res.status(200).json(submissions)
  } catch (error) {
    console.error('Error in getAllSubmissions:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Отслеживание всех домашних заданий
exports.getLessonCompletions = async (req, res) => {
  try {
    const lessonCompletions = await LessonCompletion.find().populate('user', 'name email').populate('lesson', 'title').populate('course', 'title')

    res.status(200).json(lessonCompletions)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getEnrollment = async (req, res) => {
  try {
    const { userId, courseId } = req.params
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId }).populate('user', 'name email').populate('course', 'title')

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' })
    }

    res.status(200).json(enrollment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.resetLives = async (req, res) => {
  try {
    const { userId, courseId } = req.params
    const { lives } = req.body // Получаем значение lives из тела запроса

    if (lives === undefined || lives === null) {
      return res.status(400).json({ message: 'Lives value is required' })
    }

    const parsedLives = parseInt(lives, 10) // Преобразуем в число

    if (isNaN(parsedLives) || parsedLives < 0 || parsedLives > 100) {
      // Пример ограничения
      return res.status(400).json({ message: 'Invalid lives value. Must be a number between 0 and 100.' })
    }

    // Сброс жизней в коллекции Enrollments
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId })

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' })
    }

    enrollment.lives = parsedLives
    await enrollment.save()

    // Сброс жизней в коллекции UserCourseProgress
    const userCourseProgress = await UserCourseProgress.findOne({ userId: userId, courseId: courseId })

    if (userCourseProgress) {
      userCourseProgress.lives = parsedLives
      await userCourseProgress.save()
    }

    res.status(200).json({ message: 'Lives reset successfully', enrollment })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.restoreAccess = async (req, res) => {
  try {
    const { userId, courseId } = req.params
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId })

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' })
    }

    enrollment.isLocked = false
    await enrollment.save()

    res.status(200).json({ message: 'Access restored successfully', enrollment })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Получение всех зачислений
exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('user', 'name email') // Загружаем информацию о пользователе (имя, email)
      .populate('course', 'title') // Загружаем информацию о курсе (название)

    res.status(200).json(enrollments)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}
