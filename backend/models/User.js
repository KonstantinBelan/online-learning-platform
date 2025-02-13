const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		minlength: 3,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
	},
	// Дополнительные поля (например, роль, дата регистрации и т.д.)
	role: {
		type: String,
		enum: ['student', 'admin'],
		default: 'student',
	},
	registrationDate: {
		type: Date,
		default: Date.now,
	},
})

const User = mongoose.model('User', userSchema)

module.exports = User
