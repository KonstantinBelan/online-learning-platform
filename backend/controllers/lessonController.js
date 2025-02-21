const Lesson = require('../models/Lesson')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const User = require('../models/User')
const HomeworkSubmission = require('../models/HomeworkSubmission')
const Homework = require('../models/Homework')
const multer = require('multer')
const path = require('path')
const LessonCompletion = require('../models/LessonCompletion')
const UserCourseProgress = require('../models/userCourseProgress')

const checkLives = require('../middleware/checkLives')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Store files in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

// Функция проверки доступа к уроку
async function isLessonAccessible(lesson, user, nextLessonUnlockCondition) {
  if (!lesson) {
    return false // Если урок не найден, доступ запрещен
  }

  if (!nextLessonUnlockCondition) {
    return true // Если нет условий для разблокировки, доступ разрешен
  }

  if (nextLessonUnlockCondition.type === 'immediately') {
    return true // Доступ сразу
  }

  if (nextLessonUnlockCondition.type === 'homework_approved') {
    // Логика для homework_approved
    if (!lesson.homework) {
      return false // Если нет домашнего задания, доступ запрещен
    }
    const submission = await HomeworkSubmission.findOne({
      user: user._id,
      homework: lesson.homework,
      // grade: { $gte: 70 }, // Предполагаем, что оценка должна быть >= 70 (или используй `lesson.homework_min_grade`)
      grade: { $gte: lesson.homework_min_grade },
    })
    return !!submission
  }

  if (nextLessonUnlockCondition.type === 'after_time') {
    // Логика для after_time (предполагаем, что есть поле unlock_time)
    if (!nextLessonUnlockCondition.unlock_time) {
      return false // Если нет времени разблокировки, доступ запрещен
    }
    return new Date() >= new Date(nextLessonUnlockCondition.unlock_time)
  }

  if (nextLessonUnlockCondition.type === 'after_previous_lesson_completed') {
    // Проверка, завершил ли пользователь предыдущий урок
    const previousLesson = await Lesson.findOne({
      course: lesson.course,
      lessonOrder: lesson.lessonOrder - 1,
    }) // Предполагается, что есть поле lessonOrder
    if (!previousLesson) {
      return true // Если это первый урок, доступ разрешен
    }
    // Предполагаем, что есть модель, хранящая информацию о завершенных уроках
    const completed = await LessonCompletion.findOne({
      user: user._id,
      lesson: previousLesson._id,
    })
    return !!completed
  }

  if (nextLessonUnlockCondition?.type === 'after_registration_days') {
    console.log('Условие разблокировки: after_registration_days')

    // Проверка доступа по дате регистрации
    const enrollment = await Enrollment.findOne({
      user: user._id,
      course: lesson.course,
    })
    if (!enrollment) {
      console.log('Пользователь не зарегистрирован на курс')
      return false // Пользователь не зарегистрирован на курс
    }
    const registrationDate = enrollment.enrollmentDate // Дата регистрации

    console.log('Дата регистрации:', registrationDate)

    // Check if registrationDate is valid before calling getDate()
    if (!registrationDate) {
      console.log('Дата регистрации не найдена')
      return false // Дата регистрации не найдена
    }

    const unlockDate = new Date(registrationDate)
    unlockDate.setDate(registrationDate.getDate() + (nextLessonUnlockCondition.unlockAfterDays || 0)) // Добавляем дни

    console.log('Дата разблокировки:', unlockDate)
    console.log('Текущая дата:', new Date())

    const isAvailable = new Date() >= unlockDate // Сравниваем текущую дату с датой разблокировки

    console.log('Доступен:', isAvailable)

    return isAvailable
  }

  return false // По умолчанию доступ запрещен
}

exports.createLesson = async (req, res) => {
  try {
    const { courseId } = req.params
    const {
      title,
      description,
      content,
      duration,
      type,
      hasHomework,
      homeworkDeadline = 24,
      nextLessonUnlockCondition, // Получаем условие открытия следующего урока из запроса
    } = req.body

    // Проверяем, существует ли курс
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    // Найти последний урок в курсе, чтобы определить lessonOrder
    const lastLesson = await Lesson.findOne({ course: courseId }).sort({
      lessonOrder: -1,
    })
    const lessonOrder = lastLesson ? lastLesson.lessonOrder + 1 : 1

    let homeworkId = null // Variable to store homework ID

    //Создаем Homework, если hasHomework === true
    if (hasHomework) {
      const newHomework = new Homework({
        lesson: lessonOrder, // use lessonOrder instead of savedLesson._id
        question: 'Enter question here',
      })
      const savedHomework = await newHomework.save()
      homeworkId = savedHomework._id // Save the homework ID
    }

    const newLesson = new Lesson({
      title,
      description,
      content,
      course: courseId,
      lessonOrder: lessonOrder, // set lessonOrder
      duration,
      type,
      hasHomework,
      homeworkDeadline,
      homework: homeworkId, // Assign the homework ID to the lesson
      nextLessonUnlockCondition: {
        type: nextLessonUnlockCondition?.type || 'immediately',
        homework_min_grade: nextLessonUnlockCondition?.homework_min_grade,
        unlock_time: nextLessonUnlockCondition?.unlock_time,
        unlockAfterDays: nextLessonUnlockCondition?.type === 'after_registration_days' ? nextLessonUnlockCondition?.unlockAfterDays : 0, // Устанавливаем unlockAfterDays только если тип after_registration_days
      },
    })

    const savedLesson = await newLesson.save()

    course.lessons.push(savedLesson._id)
    await course.save()

    res.status(201).json(savedLesson) // Упрощенный ответ
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Функция получения всех уроков курса
exports.getAllLessonsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId
    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 }).populate('homework') // Подгружаем домашние задания

    res.status(200).json(lessons) // Упрощенный ответ
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Функция получения урока по ID
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId)
      .populate('homework') // Подгружаем домашнее задание
      .populate({
        path: 'course', // Заполняем информацию о курсе
        select: 'status', // Указываем, что нам нужно только поле status
      })

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    // Проверяем статус курса, к которому принадлежит урок
    if (lesson.course.status !== 'published' && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Course is not published.' })
    }

    console.log('Lesson with populated homework:', lesson)

    res.status(200).json(lesson) // Упрощенный ответ
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Функция обновления урока
exports.updateLesson = async (req, res) => {
  try {
    const { title, description, content, duration, type, hasHomework, homeworkDeadline, nextLessonUnlockCondition, lessonOrder } = req.body
    const lessonId = req.params.lessonId

    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    // Update Homework if hasHomework changed
    if (lesson.hasHomework !== hasHomework) {
      if (!hasHomework) {
        // Find the homework associated with the lesson
        const homeworkToDelete = await Homework.findOne({ lesson: lessonId })
        if (homeworkToDelete) {
          await Homework.deleteOne({ _id: homeworkToDelete._id }) // Delete using the ObjectId of the homework
        }
        lesson.homework = null
      } else {
        const newHomework = new Homework({
          lesson: lessonId, // Use the ObjectId of the lesson
          question: 'Enter question here',
        })
        try {
          const savedHomework = await newHomework.save()
          lesson.homework = savedHomework._id // Save the homework id to the lesson
        } catch (homeworkError) {
          console.error('Error creating homework:', homeworkError)
          return res.status(500).json({ message: 'Failed to create homework' })
        }
      }
    }

    // Обновляем поля урока. Используем один вызов updateMany для большей эффективности
    await Lesson.updateOne(
      { _id: lessonId },
      {
        $set: {
          title: title !== undefined ? title : lesson.title,
          description: description !== undefined ? description : lesson.description,
          content: content !== undefined ? content : lesson.content,
          duration: duration !== undefined ? duration : lesson.duration,
          type: type !== undefined ? type : lesson.type,
          hasHomework: hasHomework !== undefined ? hasHomework : lesson.hasHomework,
          homeworkDeadline: homeworkDeadline !== undefined ? homeworkDeadline : lesson.homeworkDeadline,
          lessonOrder: lessonOrder !== undefined ? lessonOrder : lesson.lessonOrder,
          // Обновляем вложенный объект nextLessonUnlockCondition
          'nextLessonUnlockCondition.type': nextLessonUnlockCondition?.type !== undefined ? nextLessonUnlockCondition.type : lesson.nextLessonUnlockCondition.type,
          'nextLessonUnlockCondition.homework_min_grade': nextLessonUnlockCondition?.homework_min_grade !== undefined ? nextLessonUnlockCondition.homework_min_grade : lesson.nextLessonUnlockCondition.homework_min_grade,
          'nextLessonUnlockCondition.unlock_time': nextLessonUnlockCondition?.unlock_time !== undefined ? nextLessonUnlockCondition.unlock_time : lesson.nextLessonUnlockCondition.unlock_time,
          'nextLessonUnlockCondition.unlockAfterDays': nextLessonUnlockCondition?.unlockAfterDays !== undefined ? nextLessonUnlockCondition.unlockAfterDays : lesson.nextLessonUnlockCondition.unlockAfterDays,
        },
      }
    )

    // После обновления, снова получаем урок из базы данных, чтобы вернуть актуальную версию
    const updatedLesson = await Lesson.findById(lessonId)

    res.status(200).json(updatedLesson)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Функция удаления урока
exports.deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.lessonId

    const lesson = await Lesson.findByIdAndDelete(lessonId)

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    //Удаляем Homework
    await Homework.deleteOne({ lesson: lessonId })

    const courseObj = await Course.findById(lesson.course)
    if (courseObj) {
      courseObj.lessons.pull(lesson._id)
      await courseObj.save()
    }

    res.status(204).send() // Упрощенный ответ
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Функция получения информации об уроке с проверкой сданного ДЗ
exports.getLessonWithHomeworkStatus = async (req, res) => {
  try {
    const lessonId = req.params.lessonId
    const userId = req.user._id // Assuming you have user info in req.user

    // Find the lesson by its ID
    const lesson = await Lesson.findById(lessonId)

    console.log(lesson)

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    // Find the homework for this lesson
    const homework = await Homework.findOne({ lesson: lessonId })

    // Check if the user has submitted the homework
    const submission = await HomeworkSubmission.findOne({
      user: userId,
      lesson: lessonId,
    })
    const isCompleted = !!submission // Convert submission to boolean

    // Return the lesson data with homework info
    res.status(200).json({
      lesson,
      homework: homework || null, // Return null if homework doesn't exist
      isCompleted,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Функция обновления статуса выполнения домашнего задания
// exports.updateHomeworkStatus = async (req, res) => {
// 	try {
// 		const lessonId = req.params.lessonId
// 		const userId = req.user._id
// 		const { isCompleted } = req.body

// 		// 1. Проверяем, существует ли submission для данного пользователя и урока
// 		let submission = await HomeworkSubmission.findOne({
// 			user: userId,
// 			lesson: lessonId,
// 		})

// 		if (isCompleted) {
// 			// 2. Если isCompleted === true, создаем submission, если его еще нет
// 			if (!submission) {
// 				submission = new HomeworkSubmission({ user: userId, lesson: lessonId })
// 				await submission.save()
// 			}
// 		} else {
// 			// 3. Если isCompleted === false, удаляем submission, если он существует
// 			if (submission) {
// 				await HomeworkSubmission.deleteOne({ user: userId, lesson: lessonId })
// 			}
// 		}

// 		res.status(200).json({ message: 'Homework status updated successfully' })
// 	} catch (error) {
// 		console.error(error)
// 		res.status(500).json({ message: 'Server error' })
// 	}
// }

// Функция обновления статуса выполнения домашнего задания
exports.updateHomeworkStatus = async (req, res) => {
  try {
    const { courseId, lessonId, submissionId } = req.params
    const { status, grade, comment } = req.body // Get the comment from the request body

    // Validate status and grade
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    if (grade !== undefined && (isNaN(grade) || grade < 1 || grade > 5)) {
      return res.status(400).json({ message: 'Invalid grade value' })
    }

    // Find the homework submission
    const submission = await HomeworkSubmission.findById(submissionId)
    if (!submission) {
      return res.status(404).json({ message: 'Homework submission not found' })
    }

    // Update the submission
    submission.status = status
    if (grade !== undefined) {
      submission.grade = grade
    }
    submission.comment = comment // Set the comment

    await submission.save()

    res.status(200).json({ message: 'Homework submission updated successfully', submission })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Функции проверки выполнения домашнего задания для студента
exports.getHomeworkSubmissionForStudent = async (req, res) => {
  try {
    const { courseId, lessonId, homeworkId } = req.params
    const userId = req.user._id

    // Find the latest homework submission for the specific user and homework
    const submission = await HomeworkSubmission.findOne({
      user: userId,
      homework: homeworkId,
    })
      .sort({ submissionDate: -1 }) // Sort by submissionDate in descending order
      .populate('homework') // Populate the homework field

    if (!submission) {
      return res.status(204).json() // No Content
    }

    res.status(200).json(submission)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Функция создания нового домашнего задания
exports.createHomework = [
  upload.array('files'), // 'files' is the name of the file field in the form
  async (req, res) => {
    try {
      const lessonId = req.params.lessonId
      const { title, description, deadline } = req.body

      // Get the filenames of the uploaded files
      const files = req.files.map(file => file.filename)

      const newHomework = new Homework({
        lesson: lessonId,
        title,
        description,
        deadline,
        files: files, // Store the file names in the homework
      })

      const savedHomework = await newHomework.save()

      // Update the lesson to store the homework id
      const lesson = await Lesson.findByIdAndUpdate(
        lessonId,
        { homework: savedHomework._id }, // Set the homework field to the ObjectId of the new homework
        { new: true } // Return the updated lesson
      )

      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' })
      }

      res.status(201).json(savedHomework) // Respond with the saved homework
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Server error' })
    }
  },
]

// Функция для отправки решения домашнего задания
// exports.submitHomework = async (req, res) => {
// 	try {
// 		const lessonId = req.params.lessonId
// 		const userId = req.user._id
// 		const { answer } = req.body

// 		// Проверяем, существует ли урок с данным ID
// 		const lesson = await Lesson.findById(lessonId)
// 		if (!lesson) {
// 			return res.status(404).json({ message: 'Lesson not found' })
// 		}

// 		// Создаем новую запись о решении домашнего задания
// 		const newSubmission = new HomeworkSubmission({
// 			user: userId,
// 			lesson: lessonId,
// 			answer: answer,
// 			status: 'pending', // Устанавливаем статус "ожидает проверки"
// 		})

// 		await newSubmission.save()

// 		res.status(201).json({ message: 'Homework submitted successfully' })
// 	} catch (error) {
// 		console.error(error)
// 		res.status(500).json({ message: 'Server error' })
// 	}
// }

// Функция для отправки решения домашнего задания
exports.submitHomework = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params
    const userId = req.user._id
    const { answer } = req.body

    // Проверяем, существует ли урок с данным ID
    const lesson = await Lesson.findById(lessonId).populate('homework')
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    // Проверяем, принадлежит ли урок данному курсу (опционально)
    if (lesson.course.toString() !== courseId) {
      return res.status(400).json({ message: 'Lesson does not belong to this course' })
    }

    // Проверяем, есть ли у урока домашнее задание
    if (!lesson.homework) {
      return res.status(400).json({ message: 'This lesson does not have homework' })
    }

    // Создаем новую запись о решении домашнего задания
    const newSubmission = new HomeworkSubmission({
      user: userId,
      homework: lesson.homework._id, // Use the homework ID from the lesson
      answer: answer,
      // submissionDate: Date.now(), // No need to set this, it defaults to now
      // status: 'pending' // No need to set this, it defaults to 'pending'
    })

    await newSubmission.save()

    res.status(201).json({ message: 'Homework submitted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Функция для оценки решения домашнего задания (только для администраторов)
exports.gradeHomework = async (req, res) => {
  try {
    const submissionId = req.params.submissionId
    const { grade } = req.body

    // Проверяем, существует ли решение домашнего задания с данным ID
    const submission = await HomeworkSubmission.findById(submissionId)
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Проверяем, что оценка находится в диапазоне от 1 до 5
    if (grade < 1 || grade > 5) {
      return res.status(400).json({ message: 'Invalid grade. Grade must be between 1 and 5.' })
    }

    // Обновляем оценку и статус решения домашнего задания
    submission.grade = grade
    submission.status = grade > 3 ? 'approved' : 'rejected' //Если оценка больше 3 - одобряем, иначе - отклоняем
    await submission.save()

    res.status(200).json({ message: 'Homework graded successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Функция для оценки решения домашнего задания (только для администраторов)
// exports.gradeHomework = async (req, res) => {
// 	try {
// 		const submissionId = req.params.submissionId
// 		const { grade } = req.body

// 		// Проверяем, существует ли решение домашнего задания с данным ID
// 		const submission = await HomeworkSubmission.findById(submissionId)
// 		if (!submission) {
// 			return res.status(404).json({ message: 'Submission not found' })
// 		}

// 		// Проверяем, что оценка находится в диапазоне от 1 до 5
// 		if (grade < 1 || grade > 5) {
// 			return res
// 				.status(400)
// 				.json({ message: 'Invalid grade. Grade must be between 1 and 5.' })
// 		}

// 		// Обновляем оценку и статус решения домашнего задания
// 		submission.grade = grade
// 		submission.status = grade > 3 ? 'approved' : 'rejected' //Если оценка больше 3 - одобряем, иначе - отклоняем
// 		await submission.save()

// 		res.status(200).json({ message: 'Homework graded successfully' })
// 	} catch (error) {
// 		console.error(error)
// 		res.status(500).json({ message: 'Server error' })
// 	}
// }

// Функция для получения домашнего задания для урока
// GET /api/admin/lessons/:lessonId/homework
exports.getHomeworkForLesson = async (req, res) => {
  try {
    const lessonId = req.params.lessonId
    const homework = await Homework.findOne({ lesson: lessonId })

    if (!homework) {
      return res.status(204).send() // No Content
    }

    res.json(homework)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/admin/lessons/:lessonId/homework
// exports.createHomework = async (req, res) => {
// 	try {
// 		const lessonId = req.params.lessonId
// 		const { title, description, deadline } = req.body

// 		const newHomework = new Homework({
// 			lesson: lessonId,
// 			title,
// 			description,
// 			deadline,
// 		})

// 		const savedHomework = await newHomework.save()
// 		res.status(201).json(savedHomework)
// 	} catch (error) {
// 		console.error(error)
// 		res.status(500).json({ message: 'Server error' })
// 	}
// }

// PUT /api/admin/homework/:homeworkId
exports.updateHomework = [
  upload.array('files'),
  async (req, res) => {
    try {
      const homeworkId = req.params.homeworkId
      const { title, description, deadline } = req.body

      const updateData = {
        title,
        description,
        deadline,
      }

      // Handle file uploads
      if (req.files && req.files.length > 0) {
        const newFiles = req.files.map(file => file.filename)
        updateData.$addToSet = { files: { $each: newFiles } } // Use $addToSet to add new files
      }

      // Handle file deletions
      let filesToDelete = req.body.filesToDelete

      if (filesToDelete) {
        // Ensure filesToDelete is an array
        if (!Array.isArray(filesToDelete)) {
          filesToDelete = [filesToDelete]
        }
        updateData.$pull = { files: { $in: filesToDelete } } // Use $pull to remove files from the array
      }

      const updatedHomework = await Homework.findByIdAndUpdate(homeworkId, updateData, { new: true, runValidators: true })

      if (!updatedHomework) {
        return res.status(404).json({ message: 'Homework not found' })
      }

      res.json(updatedHomework)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Server error' })
    }
  },
]

// DELETE /api/admin/homework/:homeworkId
exports.deleteHomework = async (req, res) => {
  try {
    const homeworkId = req.params.homeworkId

    const homework = await Homework.findByIdAndDelete(homeworkId)

    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Получение информации о доступности урока (GET /courses/:courseId/lessons/:lessonId/availability)
exports.getLessonAvailability = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params
    const userId = req.user._id

    const currentLesson = await Lesson.findById(lessonId)
    if (!currentLesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    // Получаем статус курса, к которому принадлежит урок
    const course = await Course.findById(courseId) // Предполагаем, что есть модель Course
    if (!course || (course.status !== 'published' && !req.user.isAdmin)) {
      return res.status(403).json({ message: 'Access denied. Course is not published.' })
    }

    // Find the previous lesson
    const previousLesson = await Lesson.findOne({
      course: courseId,
      lessonOrder: currentLesson.lessonOrder - 1,
    })

    let nextLessonUnlockCondition = null
    if (previousLesson) {
      nextLessonUnlockCondition = previousLesson.nextLessonUnlockCondition
    }

    // Проверяем доступ к уроку
    // We're checking the current lesson availability based on the
    // nextLessonUnlockCondition (from the previous lesson)
    const isAvailable = await isLessonAccessible(
      currentLesson, // Pass the current lesson
      req.user,
      nextLessonUnlockCondition
    )

    res.status(200).json({
      lesson: currentLesson,
      isAvailable,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Завершение урока
exports.completeLesson = async (req, res) => {
  console.log('completeLesson called') // ADDED

  try {
    const { lessonId, courseId } = req.params
    const userId = req.user._id

    console.log({ lessonId, courseId }) // ADDED

    const lesson = await Lesson.findById(lessonId)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    const existingCompletion = await LessonCompletion.findOne({
      user: userId,
      lesson: lessonId,
      course: courseId,
    })
    if (existingCompletion) {
      return res.status(400).json({ message: 'Lesson already completed' })
    }

    const completion = new LessonCompletion({
      user: userId,
      lesson: lessonId,
      course: courseId,
      completionDate: new Date(),
    })

    await completion.save()

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId })
    console.log({ enrollment }) // ADDED

    if (enrollment) {
      console.log(lessonId) // ADDED
      console.log(Array.isArray(enrollment.completedLessons)) // ADDED
      enrollment.completedLessons.push(lessonId)
      enrollment.lastLessonCompleted = new Date()
      await enrollment.save()
    }

    //  Обновляем lastLessonCompletedTime в UserCourseProgress
    let userProgress = await UserCourseProgress.findOne({ userId: userId, courseId: courseId })

    if (!userProgress) {
      userProgress = new UserCourseProgress({
        userId: userId,
        courseId: courseId,
        lives: 3, // Устанавливаем lives по умолчанию
      })
    }

    userProgress.lastLessonCompletedTime = new Date() // Записываем время завершения урока
    await userProgress.save()

    res.status(201).json({ message: 'Lesson completed successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Проверка прохождения урока
exports.checkLessonCompletion = async (req, res) => {
  try {
    const { lessonId } = req.params
    const userId = req.user._id

    console.log('lessonId: ' + lessonId)
    console.log('userId: ' + userId)

    // Проверяем, есть ли запись о завершении урока для данного пользователя и урока
    const existingCompletion = await LessonCompletion.findOne({
      user: userId,
      lesson: lessonId,
    })

    if (existingCompletion) {
      // Если запись существует, возвращаем 200 OK
      return res.status(200).json({ message: 'Lesson completed' })
    } else {
      // Если запись не существует, возвращаем 404 Not Found
      return res.status(404).json({ message: 'Lesson not completed' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// // Работа с жизнями
// exports.getLessonLives = [
//   // Use an array to apply multiple middleware
//   checkLives, // Проверяем жизни перед получением урока
//   async (req, res) => {
//     const { lessonId } = req.params
//     const userId = req.user._id // Предполагаем, что ID пользователя доступен через req.user
//     const courseId = req.params.courseId

//     console.log('getLessonLives:' + checkLives)

//     try {
//       const lesson = await Lesson.findById(lessonId)

//       if (!lesson) {
//         return res.status(404).json({ message: 'Lesson not found' })
//       }
//       let userProgress = await UserCourseProgress.findOne({ userId: userId, courseId: courseId })

//       if (!userProgress) {
//         userProgress = new UserCourseProgress({ userId: userId, courseId: courseId })
//       }
//       // Записываем время начала урока, если это первый запрос к уроку
//       if (!userProgress.lastLessonStartTime) {
//         userProgress.lastLessonStartTime = new Date()
//         await userProgress.save()
//       }

//       // Проверяем, была ли списана жизнь
//       if (req.livesBurned) {
//         console.log('Life burned for user:', userId)
//         // Здесь можно отправить уведомление пользователю
//       }

//       res.status(200).json({ lesson, lives: req.lives }) // Возвращаем данные урока и количество жизней
//     } catch (error) {
//       console.error(error)
//       res.status(500).json({ message: 'Server error' })
//     }
//   },
// ]
// Работа с жизнями
exports.getLessonLives = [
  checkLives, // Проверяем жизни перед получением урока
  async (req, res) => {
    const { lessonId } = req.params
    const userId = req.user._id
    const courseId = req.params.courseId

    try {
      const lesson = await Lesson.findById(lessonId)

      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' })
      }

      // Проверяем, была ли списана жизнь
      if (req.livesBurned) {
        console.log('Life burned for user:', userId)
        // Здесь можно отправить уведомление пользователю
      }

      res.status(200).json({ lesson, lives: req.lives }) // Возвращаем данные урока и количество жизней
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Server error' })
    }
  },
]
