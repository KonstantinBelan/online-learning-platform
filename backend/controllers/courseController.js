const Course = require('../models/Course')
const { authMiddleware, checkRole } = require('../middleware/authMiddleware')

// Функция создания курса
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      category,
      price,
      status = 'draft',
      defaultLives = 3, // Добавляем defaultLives с дефолтным значением 3
    } = req.body // Добавляем status с дефолтным значением 'draft'
    const author = req.user._id

    if (!title) {
      return res.status(400).json({ message: 'Title is required' })
    }

    // Валидация статуса (опционально, если нужно строгое соответствие значениям)
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус курса.' })
    }

    const newCourse = new Course({
      title,
      description,
      imageUrl,
      category,
      price,
      author,
      status, // Добавляем status
      defaultLives, // Добавляем defaultLives
    })

    await newCourse
      .save()
      .then(course => {
        res.status(201).json(course)
      })
      .catch(err => {
        console.error('Error saving course:', err)
        res.status(500).json({ message: 'Failed to save course', error: err.message })
      })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Функция получения всех курсов
exports.getAllCourses = async (req, res) => {
  try {
    let query = {} // Базовый запрос

    //Если пользователь не админ, показываем только опубликованные курсы
    if (!checkRole('admin')) {
      query = { status: 'published' }
    }

    // Добавляем сортировку и статус
    const courses = await Course.find(query).populate('author', 'username email').sort({ createdAt: -1 }) // Сортируем по дате создания (новые сверху)

    res.status(200).json(courses) // Возвращаем только массив курсов
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Функция получения курса по ID
exports.getCourseById = async (req, res) => {
  console.log('Запрос получен:', req.params.id) // Добавляем логирование
  try {
    const course = await Course.findById(req.params.id) // Используем req.params.id
      .populate('author', 'username email')
      .populate('lessons') // Заполняем уроки

    if (!course) {
      console.log('Курс не найден') // Добавляем логирование
      return res.status(404).json({ message: 'Course not found' })
    }

    // Проверяем статус курса
    if (course.status !== 'published' && !req.user.isAdmin) {
      console.log('Доступ запрещен: курс не опубликован') // Добавляем логирование
      return res.status(403).json({ message: 'Access denied. Course is not published.' })
    }

    console.log('Курс найден:', course) // Добавляем логирование
    res.status(200).json(course) // Возвращаем курс
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error) // Добавляем логирование
    res.status(500).json({ message: 'Server error' })
  }
}

// Функция обновления курса
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, imageUrl, category, price, status, defaultLives } = req.body // Добавляем status и defaultLives
    const course = await Course.findByIdAndUpdate(
      req.params.courseId, // Используем courseId
      {
        title,
        description,
        imageUrl,
        category,
        price,
        status, // Добавляем status
        defaultLives, // Добавляем defaultLives
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true } // Добавляем runValidators
    )

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    res.status(200).json(course) // Возвращаем только обновленный курс
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Функция удаления курса
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.courseId) // Используем courseId

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    res.status(204).send() // 204 No Content - успешное удаление
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}
