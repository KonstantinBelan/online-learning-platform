// middleware/checkLives.js
const UserCourseProgress = require('../models/userCourseProgress')
const Enrollment = require('../models/Enrollment')

async function checkLives(req, res, next) {
  console.log('checkLives called') // Добавлено для отладки
  const { courseId } = req.params
  const userId = req.user._id

  try {
    let userProgress = await UserCourseProgress.findOne({ userId: userId, courseId: courseId })

    if (!userProgress) {
      userProgress = new UserCourseProgress({ userId: userId, courseId: courseId, lives: 3 })
    }

    // Упрощенная логика выбора времени для проверки
    const timeToCheck = userProgress.lastLessonCompletedTime || userProgress.lastLessonStartTime

    if (timeToCheck) {
      const now = new Date()
      const timeDiff = now.getTime() - timeToCheck.getTime()
      const hoursPassed = timeDiff / (1000 * 3600)

      console.log(`timeToCheck: ${timeToCheck}, now: ${now}, hoursPassed: ${hoursPassed}`) // Добавлено для отладки

      // if (hoursPassed >= 24) {
      if (hoursPassed >= 1 / 60) {
        // Списываем жизни через 2 минуты (ТОЛЬКО ДЛЯ ОТЛАДКИ!!! ВЕРНИТЕ 24 ПОСЛЕ ТЕСТИРОВАНИЯ)
        if (userProgress.lives > 0) {
          userProgress.lives -= 1
          // Перемещено сюда, чтобы обновлять только при списании жизни
          userProgress.lastLessonStartTime = new Date()
          await userProgress.save()

          // Списываем жизнь и в Enrollment
          const enrollment = await Enrollment.findOne({ user: userId, courseId: courseId })
          if (enrollment) {
            enrollment.lives -= 1
            await enrollment.save()

            console.log(`Life burned for user ${userId} on course ${courseId} in Enrollment. Remaining lives: ${enrollment.lives}`)

            // Проверяем, не закончились ли жизни в Enrollment
            if (enrollment.lives <= 0) {
              console.log(`No lives left for user ${userId} on course ${courseId} in Enrollment. Locking access.`)
              enrollment.isLocked = true
              await enrollment.save()
              console.log(`Access to course ${courseId} locked for user ${userId}.`)
              return res.status(403).json({
                message: 'No lives left. Access to this course is denied.',
                needToBuyLives: true, // Добавляем флаг
              })
            }
          } else {
            console.warn(`Enrollment not found for user ${userId} on course ${courseId}.`)
          }

          req.livesBurned = true
          req.lives = userProgress.lives // Передаем оставшееся количество жизней из userProgress
          console.log(`Life burned for user ${userId} on course ${courseId} in UserCourseProgress. Remaining lives: ${userProgress.lives}`)
        } else {
          console.log(`No lives left for user ${userId} on course ${courseId} in UserCourseProgress.`)
          return res.status(403).json({ message: 'No lives left. Access to this course is denied.' })
        }
        return next()
      }
    }

    req.livesBurned = false
    req.lives = userProgress.lives // Передаем оставшееся количество жизней из userProgress
    //userProgress.lastLessonStartTime = new Date() // Удалено отсюда
    //await userProgress.save() // Удалено отсюда
    next()
  } catch (error) {
    console.error('Error checking lives:', error)
    res.status(500).json({ message: 'Failed to check lives' })
  }
}

module.exports = checkLives
