const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '')

		if (!token) {
			return res.status(401).json({ message: 'Not authorized, token missing' })
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		const user = await User.findById(decoded.userId)

		if (!user) {
			return res.status(401).json({ message: 'Not authorized, invalid token' })
		}

		req.user = user

		console.log('req.user:', req.user) // Добавь эту строку для отладки

		next()
	} catch (error) {
		console.error(error)
		res.status(401).json({ message: 'Not authorized, invalid token' })
	}
}

module.exports = authMiddleware
