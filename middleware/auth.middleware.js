const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

module.exports = async function authMiddleware(req, res, next) {
	try {
		const header = req.headers.authorization || ''
		const [type, token] = header.split(' ')
		if (type !== 'Bearer' || !token) {
			return res.status(401).json({ message: 'Token kerak: Authorization: Bearer <token>' })
		}

		const payload = jwt.verify(token, process.env.JWT_SECRET)
		const user = await User.findById(payload.id)
		if (!user) {
			return res.status(401).json({ message: 'User topilmadi (token yaroqsiz bo‘lishi mumkin)' })
		}

		req.user = user
		next()
	} catch (err) {
		return res.status(401).json({ message: 'Token yaroqsiz yoki muddati o‘tgan', error: err.message })
	}
}
