const { Schema, model } = require('mongoose')

const userSchema = new Schema(
	{
		firstName: { type: String, trim: true, default: '' },
		lastName: { type: String, trim: true, default: '' },
		phone: { type: String, trim: true, default: '' },
		avatarUrl: { type: String, trim: true, default: '' },

		email: {
			type: String,
			required: [true, 'Email kiritilishi shart'],
			trim: true,
			lowercase: true,
			unique: true,
		},
		password: {
			type: String,
			required: [true, 'Parol kiritilishi shart'],
			select: false,
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},

		// Password recovery (OTP demo)
		passwordReset: {
			otpHash: { type: String, default: null, select: false },
			expiresAt: { type: Date, default: null, select: false },
		},
	},
	{ timestamps: true },
)

module.exports = model('User', userSchema)
