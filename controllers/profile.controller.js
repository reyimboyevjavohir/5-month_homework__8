const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const User = require('../models/user.model')



exports.getMyProfile = async (req, res, next) => {
	try {
		const u = req.user
		return res.json({
			id: u._id,
			firstName: u.firstName,
			lastName: u.lastName,
			phone: u.phone,
			email: u.email,
			avatarUrl: u.avatarUrl,
			role: u.role,
			createdAt: u.createdAt,
			updatedAt: u.updatedAt,
		})
	} catch (e) {
		next(e)
	}
}

exports.updateMyProfile = async (req, res, next) => {
	try {
		const { firstName, lastName, phone, email, avatarUrl } = req.body

		if (email && String(email).toLowerCase() !== req.user.email) {
			const exists = await User.findOne({ email: String(email).toLowerCase() })
			if (exists) return res.status(409).json({ message: 'Bu email boshqa userda bor' })
			req.user.email = String(email).toLowerCase()
		}

		if (firstName !== undefined) req.user.firstName = firstName
		if (lastName !== undefined) req.user.lastName = lastName
		if (phone !== undefined) req.user.phone = phone
		if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl

		await req.user.save()
		return res.json({ message: 'Profile updated' })
	} catch (e) {
		next(e)
	}
}

exports.deleteMyProfile = async (req, res, next) => {
	try {
		await User.deleteOne({ _id: req.user._id })
		return res.json({ message: 'Account deleted' })
	} catch (e) {
		next(e)
	}
}

exports.changePassword = async (req, res, next) => {
	try {
		const { currentPassword, newPassword, confirmPassword } = req.body
		if (!currentPassword || !newPassword || !confirmPassword) {
			return res.status(400).json({ message: 'currentPassword, newPassword, confirmPassword majburiy' })
		}
		if (newPassword !== confirmPassword) {
			return res.status(400).json({ message: 'confirmPassword mos emas' })
		}

		const user = await User.findById(req.user._id).select('+password')
		const ok = await bcrypt.compare(String(currentPassword), user.password)
		if (!ok) return res.status(401).json({ message: 'Current password xato' })

		user.password = await bcrypt.hash(String(newPassword), 10)
		await user.save()
		return res.json({ message: 'Password changed' })
	} catch (e) {
		next(e)
	}
}

exports.recoverStart = async (req, res, next) => {
	try {
		const { email } = req.body
		if (!email) return res.status(400).json({ message: 'email majburiy' })

		const user = await User.findOne({ email: String(email).toLowerCase() }).select('+passwordReset.otpHash +passwordReset.expiresAt')
		if (!user) return res.status(404).json({ message: 'User topilmadi' })

		const otp = String(Math.floor(100000 + Math.random() * 900000))
		const otpHash = crypto.createHash('sha256').update(otp).digest('hex')

		user.passwordReset.otpHash = otpHash
		user.passwordReset.expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minut
		await user.save()

		return res.json({ message: 'OTP generated (demo)', demoOtp: otp, expiresInSeconds: 600 })
	} catch (e) {
		next(e)
	}
}

// POST /api/profile/password/recover/finish
exports.recoverFinish = async (req, res, next) => {
	try {
		const { email, otp, newPassword, confirmPassword } = req.body
		if (!email || !otp || !newPassword || !confirmPassword) {
			return res.status(400).json({ message: 'email, otp, newPassword, confirmPassword majburiy' })
		}
		if (newPassword !== confirmPassword) {
			return res.status(400).json({ message: 'confirmPassword mos emas' })
		}

		const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password +passwordReset.otpHash +passwordReset.expiresAt')
		if (!user) return res.status(404).json({ message: 'User topilmadi' })

		if (!user.passwordReset.otpHash || !user.passwordReset.expiresAt) {
			return res.status(400).json({ message: 'OTP so‘ralmagan' })
		}
		if (user.passwordReset.expiresAt.getTime() < Date.now()) {
			return res.status(400).json({ message: 'OTP muddati o‘tgan' })
		}

		const otpHash = crypto.createHash('sha256').update(String(otp)).digest('hex')
		if (otpHash !== user.passwordReset.otpHash) {
			return res.status(400).json({ message: 'OTP xato' })
		}

		user.password = await bcrypt.hash(String(newPassword), 10)
		user.passwordReset.otpHash = null
		user.passwordReset.expiresAt = null
		await user.save()

		return res.json({ message: 'Password recovered' })
	} catch (e) {
		next(e)
	}
}
