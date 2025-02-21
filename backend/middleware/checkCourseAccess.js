const Enrollment = require('../models/Enrollment')

const checkCourseAccess = async (req, res, next) => {
  const userId = req.user._id // Получаем ID пользователя из req.user
  const courseId = req.params.id || req.params.courseId // Получаем ID курса из параметров запроса

  console.log('Checking course access for userId:', userId, 'and courseId:', courseId)

  try {
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId })

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' })
    }

    if (enrollment.isLocked) {
      // Используем isLocked
      return res.status(403).json({ message: 'Access to this course is denied' }) // Forbidden
    }

    return next() // Доступ разрешен, переходим к следующему middleware или контроллеру
  } catch (error) {
    console.error('Error checking course access:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = checkCourseAccess
