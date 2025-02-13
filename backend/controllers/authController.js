const User = require('../models/User')
const bcrypt = require('bcrypt') // Для хеширования паролей
const jwt = require('jsonwebtoken') // Для создания токенов аутентификации

// Функция регистрации пользователя
exports.register = async (req, res) => {
	try {
		// Получаем данные из тела запроса
		const { username, email, password } = req.body

		// Проверяем, не существует ли пользователь с таким именем пользователя или email
		const existingUser = await User.findOne({ $or: [{ username }, { email }] })
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' })
		}

		// Хешируем пароль
		const hashedPassword = await bcrypt.hash(password, 10)

		// Создаем нового пользователя
		const newUser = new User({
			username,
			email,
			password: hashedPassword,
		})

		// Сохраняем пользователя в базе данных
		await newUser.save()

		// Создаем токен аутентификации
		const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		})

		// Отправляем ответ с токеном
		res.status(201).json({ message: 'User created', token })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Функция входа пользователя
exports.login = async (req, res) => {
	try {
		// Получаем данные из тела запроса (email и пароль)
		const { email, password } = req.body

		// Ищем пользователя в базе данных по email
		const user = await User.findOne({ email })

		// Если пользователь не найден
		if (!user) {
			return res.status(400).json({ message: 'Invalid credentials' })
		}

		// Сравниваем введенный пароль с хешированным паролем из базы данных
		const isPasswordValid = await bcrypt.compare(password, user.password)

		// Если пароль не совпадает
		if (!isPasswordValid) {
			return res.status(400).json({ message: 'Invalid credentials' })
		}

		// Создаем токен аутентификации
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		})

		// Отправляем ответ с токеном
		res.status(200).json({ message: 'Logged in', token })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: 'Server error' })
	}
}
