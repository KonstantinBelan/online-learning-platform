// const mongoose = require('mongoose')

// const homeworkSchema = new mongoose.Schema({
// 	lesson: {
// 		type: mongoose.Schema.Types.ObjectId,
// 		ref: 'Lesson',
// 		required: true,
// 	},
// 	question: {
// 		//Вопрос к ДЗ
// 		type: String,
// 		required: true,
// 	},
// 	files: [
// 		{
// 			//Список файлов для сдачи
// 			type: String,
// 		},
// 	],
// })

// module.exports = mongoose.model('Homework', homeworkSchema)

// // const mongoose = require('mongoose')

// // const homeworkSchema = new mongoose.Schema({
// // 	lesson: {
// // 		type: mongoose.Schema.Types.ObjectId,
// // 		ref: 'Lesson',
// // 		required: true,
// // 	},
// // 	title: {
// // 		type: String,
// // 		required: true,
// // 	},
// // 	description: {
// // 		type: String,
// // 	},
// // 	deadline: {
// // 		type: Date,
// // 		required: true,
// // 	},
// // })

// // module.exports = mongoose.model('Homework', homeworkSchema)

const mongoose = require('mongoose')

const homeworkSchema = new mongoose.Schema(
	{
		lesson: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Lesson',
			required: true,
		},
		title: {
			//Заголовок ДЗ
			type: String,
			required: true,
		},
		description: {
			//Описание ДЗ
			type: String,
			required: true,
		},
		deadline: {
			// Срок сдачи домашнего задания
			type: Date,
			default: Date.now,
		},
		files: [
			{
				//Список файлов для сдачи
				type: String,
			},
		],
	},
	{
		timestamps: true, // Добавляем поля createdAt и updatedAt
	}
)

module.exports = mongoose.model('Homework', homeworkSchema)
