const mongoose = require('mongoose')
const { Schema } = mongoose

const courseSchema = new Schema({
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
	imageUrl: {
		type: String, // URL изображения курса
	},
	lessons: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Lesson', // Ссылка на модель Lesson (если уроки будут в отдельной коллекции)
		},
	],
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User', // Ссылка на модель User (кто создал курс)
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	// Дополнительные поля (например, категория, цена и т.д.)
	category: {
		type: String,
		trim: true,
	},
	price: {
		type: Number,
		default: 0,
	},
})

const Course = mongoose.model('Course', courseSchema)

module.exports = Course
