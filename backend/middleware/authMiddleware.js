const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')
    console.log('Authorization header:', authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' })
    }

    const token = authHeader.substring(7)
    console.log('Token:', token)

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log('Decoded token:', decoded)
    } catch (err) {
      console.log('Token verification error:', err)
      return res.status(401).json({ message: 'Token is not valid', expired: true })
    }

    if (!decoded.user || !decoded.user.id) {
      return res.status(401).json({ message: 'Invalid token - no user ID' })
    }

    const userId = decoded.user.id
    console.log('User ID:', userId)

    try {
      const user = await User.findById(userId)
      console.log('User:', user)

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Check user role here
      if (req.originalUrl.startsWith('/api/admin') && user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden - Insufficient privileges' })
      }

      req.user = user
      return next()
    } catch (dbError) {
      console.error('Database error:', dbError)
      return next(dbError)
    }
  } catch (err) {
    console.error('Middleware error:', err)
    return next(err) // Pass the error to the next middleware
  }
}

const checkRole = role => {
  return async (req, res, next) => {
    try {
      // Проверяем наличие req.user
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized - No user' })
      }

      console.log('User ID from token:', req.user.id)
      const user = await User.findById(req.user.id)

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      console.log('User role from database:', user.role)
      if (user.role !== role) {
        return res.status(403).json({ message: 'Forbidden - Insufficient privileges' })
      }

      return next()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Server error' })
    }
  }
}

module.exports = {
  authMiddleware,
  checkRole,
}
