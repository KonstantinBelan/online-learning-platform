const mongoose = require('mongoose')
const { Schema } = mongoose

const homeworkSubmissionSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User', // Ссылка на модель User (кто выполнил задание)
			required: true,
		},
		// lesson: {
		// 	type: Schema.Types.ObjectId,
		// 	ref: 'Lesson', //Д Ссылка на модель Lesson (какое задание выполнено)
		// 	required: true,
		// },
		homework: {
			// Изменено: ссылка на Homework
			type: Schema.Types.ObjectId,
			ref: 'Homework', // Ссылка на модель Homework (какое задание выполнено)
			required: true,
			index: true, // Добавляем индекс для поля homework
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
		answer: {
			type: String, // Текст ответа
		},
		files: [
			{
				// Массив URL файлов
				type: String,
			},
		],
		status: {
			type: String,
			enum: ['pending', 'approved', 'rejected'],
			default: 'pending',
		},
		comment: {
			// Add the comment field
			type: String,
		},
	},
	{
		timestamps: true, // Добавляем поля createdAt и updatedAt
	}
)

const HomeworkSubmission = mongoose.model(
	'HomeworkSubmission',
	homeworkSubmissionSchema
)

module.exports = HomeworkSubmission
