const mongoose = require('mongoose')
const Lesson = require('./models/Lesson') // Путь к вашей модели Lesson

// Строка подключения к вашей базе данных MongoDB
const dbURI =
	'mongodb+srv://kosbelan14:RASCVRchXcZIhW6t@cluster0.afnq3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose
	.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB')

		// Обновление всех уроков, у которых нет lessonOrder
		Lesson.updateMany(
			{ lessonOrder: { $exists: false } },
			{ $set: { lessonOrder: 1 } } // Установите значение по умолчанию (например, 1)
		)
			.then(result => {
				console.log('Updated', result.modifiedCount, 'lessons')
				mongoose.connection.close()
			})
			.catch(err => {
				console.error('Error updating lessons:', err)
				mongoose.connection.close()
			})
	})
	.catch(err => console.error('MongoDB connection error:', err))
