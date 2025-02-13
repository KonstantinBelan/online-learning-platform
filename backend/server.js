const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config() // Загрузка переменных окружения из .env

const app = express()
const port = process.env.PORT || 3000 // Используем порт из .env или 3000 по умолчанию

const authRoutes = require('./routes/authRoutes')
const courseRoutes = require('./routes/courseRoutes')

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

// Start server
app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})
