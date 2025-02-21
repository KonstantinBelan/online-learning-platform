const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
	userId: {
		// Ссылка на пользователя в системе аутентификации
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User', // 'User' - имя модели пользователя (предполагается, что у тебя есть модель User)
		required: true,
	},
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true, // Уникальный email для каждого студента
	},
	// Дополнительные поля студента (по желанию)
	dateOfBirth: {
		type: Date,
	},
	profilePicture: {
		type: String, // URL изображения профиля
	},
	// ...
})

module.exports = mongoose.model('Student', studentSchema)
