const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Функция регистрации пользователя
exports.register = async (req, res) => {
	try {
		const { username, email, password } = req.body

		const existingUser = await User.findOne({ $or: [{ username }, { email }] })
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' })
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		const newUser = new User({
			username,
			email,
			password: hashedPassword,
		})

		await newUser.save()

		// Обновляем создание токена
		const token = jwt.sign(
			{
				user: {
					id: newUser._id,
					role: newUser.role,
				},
			},
			process.env.JWT_SECRET,
			{
				expiresIn: '1h',
			}
		)

		// Возвращаем информацию о пользователе вместе с токеном
		res.status(201).json({
			message: 'User registered',
			token: token,
			userId: newUser._id,
			username: newUser.username,
			email: newUser.email,
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Функция входа пользователя
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body

		//  Находим пользователя по email
		const user = await User.findOne({ email })

		if (!user) {
			return res.status(400).json({ message: 'Invalid credentials' })
		}

		//  Проверяем пароль
		const isMatch = await user.comparePassword(password)

		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' })
		}

		//  Создаем JWT
		const payload = {
			user: {
				id: user._id, //  Используем _id вместо id
				role: user.role,
				username: user.username, // Add username
			},
		}

		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: '7d', // Increase this!
		})

		console.log('Created token:', token) // Add this line

		res.json({ token, username: user.username }) // Return username
	} catch (err) {
		console.error(err.message)
		//  Отправляем JSON-ответ с информацией об ошибке
		res.status(500).json({ message: 'Server error', error: err.message })
	}
}

// Функция получения информации о текущем пользователе
exports.me = async (req, res) => {
	try {
		// Теперь мы можем получить ID пользователя из req.user.id
		const user = await User.findById(req.user.id).select('-password')

		console.log(user)
		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}
		console.log('me: ' + user)
		res.status(200).json(user)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}
