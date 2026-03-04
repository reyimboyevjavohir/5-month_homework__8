const { Router } = require('express')
const auth = require('../middleware/auth.middleware')
const {
	getMyProfile,
	updateMyProfile,
	deleteMyProfile,
	changePassword,
	recoverStart,
	recoverFinish,
} = require('../controllers/profile.controller')

const profileRouter = Router()

profileRouter.post('/password/recover/start', recoverStart)
profileRouter.post('/password/recover/finish', recoverFinish)

profileRouter.get('/', auth, getMyProfile)
profileRouter.put('/', auth, updateMyProfile)
profileRouter.delete('/', auth, deleteMyProfile)

profileRouter.put('/password', auth, changePassword)

module.exports = profileRouter
