const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const cron = require('node-cron')
const checkHomeworkDeadlines = require('./utils/checkHomeworkDeadlines')
const path = require('path')

const app = express()
const port = process.env.PORT || 3000

const isProduction = process.env.NODE_ENV === 'production'

// Middleware
app.use(cors())
app.use(express.json())

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path, stat) => {
      if (path.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf')
      }
    },
  })
)
// app.get('/uploads/:filename', (req, res) => {
// 	const filename = req.params.filename
// 	const filePath = path.join(__dirname, 'uploads', filename)

// 	res.sendFile(filePath, err => {
// 		if (err) {
// 			console.error(err)
// 			res.status(500).send('Error sending file')
// 		} else {
// 			console.log(`File sent: ${filePath}`)
// 		}
// 	})
// })

// Маршруты API
const authRoutes = require('./routes/authRoutes')
const courseRoutes = require('./routes/courseRoutes')
const lessonRoutes = require('./routes/lessonRoutes')
const enrollmentRoutes = require('./routes/enrollmentRoutes')
const adminRoutes = require('./routes/adminRoutes')
const studentRoutes = require('./routes/studentRoutes')
const userRoutes = require('./routes/userRoutes')
app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/enrollments', enrollmentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/users', userRoutes)

if (isProduction) {
  // // Маршруты для React приложения
  // // Предполагается, что собранный React build находится в папке 'client/build'
  app.use(express.static(path.join(__dirname, 'dist')))

  // // Обработчик для всех остальных запросов, отдающий index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html')) // Изменили 'client/build' на 'dist'
  })
}

// Логирование запросов
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`)
  next()
})

// Запуск cron задачи
// cron.schedule('0 0 * * *', () => {
// 	checkHomeworkDeadlines()
// })
require('./utils/cron') // Запускаем cron job

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
