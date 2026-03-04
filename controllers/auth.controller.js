const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

function signToken(user) {
	return jwt.sign(
		{ id: user._id.toString(), role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
	)
}

// POST /api/auth/register
exports.register = async (req, res, next) => {
	try {
		const { firstName, lastName, phone, avatarUrl, email, password, role } = req.body
		if (!email || !password) {
			return res.status(400).json({ message: 'email va password majburiy' })
		}

		const exists = await User.findOne({ email: String(email).toLowerCase() })
		if (exists) return res.status(409).json({ message: 'Bu email bilan user bor' })

		const hash = await bcrypt.hash(String(password), 10)
		const user = await User.create({
			firstName: firstName || '',
			lastName: lastName || '',
			phone: phone || '',
			avatarUrl: avatarUrl || '',
			email: String(email).toLowerCase(),
			password: hash,
			role: role === 'admin' ? 'admin' : 'user',
		})

		const accessToken = signToken(user)
		return res.status(201).json({
			message: 'Registered',
			accessToken,
			user: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				phone: user.phone,
				email: user.email,
				role: user.role,
			},
		})
	} catch (e) {
		next(e)
	}
}

// POST /api/auth/login
exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body
		if (!email || !password) {
			return res.status(400).json({ message: 'email va password majburiy' })
		}

		const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password')
		if (!user) return res.status(401).json({ message: 'Email yoki parol xato' })

		const ok = await bcrypt.compare(String(password), user.password)
		if (!ok) return res.status(401).json({ message: 'Email yoki parol xato' })

		const accessToken = signToken(user)
		return res.json({
			message: 'Logged in',
			accessToken,
			user: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				phone: user.phone,
				email: user.email,
				role: user.role,
			},
		})
	} catch (e) {
		next(e)
	}
}
