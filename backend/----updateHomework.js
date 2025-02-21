const mongoose = require('mongoose')
const Lesson = require('./models/Lesson') // Убедись, что путь к модели Lesson правильный

async function updateLessonHomework(lessonId, homeworkId) {
	try {
		// Преобразуем lessonId и homeworkId в ObjectId
		const lessonObjectId = new mongoose.Types.ObjectId(lessonId)
		const homeworkObjectId = new mongoose.Types.ObjectId(homeworkId)

		const lesson = await Lesson.findById(lessonObjectId)
		if (!lesson) {
			console.log('Урок не найден')
			return
		}

		lesson.homework = homeworkObjectId // Присваиваем homeworkId как ObjectId
		await lesson.save()
		console.log('Домашнее задание успешно добавлено к уроку')
	} catch (error) {
		console.error('Ошибка при добавлении домашнего задания к уроку:', error)
	}
}

// Пример использования
async function main() {
	try {
		// Подключение к MongoDB
		await mongoose.connect(
			'mongodb+srv://kosbelan14:RASCVRchXcZIhW6t@cluster0.afnq3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			}
		)
		console.log('Connected to MongoDB')

		await updateLessonHomework(
			'67ae49ce89972461f5e75828', // lessonId
			'67ae6996e0ff2bdd8adab100' // homeworkId
		)
	} catch (err) {
		console.error('MongoDB connection error:', err)
	} finally {
		mongoose.disconnect() // Закрываем соединение после выполнения
	}
}

main()
