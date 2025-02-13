const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config() // Загрузка переменных окружения из .env
const cron = require('node-cron') // Импортируем node-cron
const checkHomeworkDeadlines = require('./utils/checkHomeworkDeadlines') // Импортируем функцию для проверки дедлайнов

const app = express()
const port = process.env.PORT || 3000 // Используем порт из .env или 3000 по умолчанию

const authRoutes = require('./routes/authRoutes')
const courseRoutes = require('./routes/courseRoutes')
const lessonRoutes = require('./routes/lessonRoutes')
const enrollmentRoutes = require('./routes/enrollmentRoutes')

// Middleware
app.use(cors())
app.use(express.json()) // Для обработки JSON-данных в теле запроса

// Подключение к MongoDB
mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log('MongoDB connected'))
	.catch(err => console.log(err))

// Routes (Здесь будут наши маршруты)
app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/enrollments', enrollmentRoutes)

// Запускаем функцию checkHomeworkDeadlines каждый день в 00:00
cron.schedule('0 0 * * *', () => {
	checkHomeworkDeadlines()
})

// Start server
app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})
