const mongoose = require('mongoose')
const { Schema } = mongoose

const lessonSchema = new Schema({
	title: {
		type: String,
		required: true,
		trim: true,
		minlength: 3,
	},
	description: {
		type: String,
		required: true,
		trim: true,
		minlength: 10,
	},
	content: {
		type: String, // Здесь может быть текст, HTML, или ссылка на видео/файл
		required: true,
	},
	course: {
		type: Schema.Types.ObjectId,
		ref: 'Course', // Ссылка на модель Course (к какому курсу относится урок)
		required: true,
	},
	order: {
		type: Number, // Порядок урока в курсе
		default: 0,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	// Дополнительные поля (например, продолжительность, тип урока и т.д.)
	duration: {
		type: Number, // Продолжительность урока в минутах
		default: 0,
	},
	type: {
		type: String, // Тип урока (например, video, text, quiz)
		default: 'text',
	},
})

const Lesson = mongoose.model('Lesson', lessonSchema)

module.exports = Lesson
