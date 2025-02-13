const mongoose = require('mongoose')
const { Schema } = mongoose

const homeworkSubmissionSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User', // Ссылка на модель User (кто выполнил задание)
		required: true,
	},
	lesson: {
		type: Schema.Types.ObjectId,
		ref: 'Lesson', // Ссылка на модель Lesson (какое задание выполнено)
		required: true,
	},
	submissionDate: {
		type: Date,
		default: Date.now, // Дата отправки задания
	},
	grade: {
		type: Number, // Оценка за задание (от 1 до 5)
		min: 1,
		max: 5,
	},
	// Дополнительные поля (например, текст ответа, ссылка на файл/изображение и т.д.)
	answerText: {
		type: String,
	},
	answerFile: {
		type: String, // Ссылка на файл/изображение
	},
})

const HomeworkSubmission = mongoose.model(
	'HomeworkSubmission',
	homeworkSubmissionSchema
)

module.exports = HomeworkSubmission
