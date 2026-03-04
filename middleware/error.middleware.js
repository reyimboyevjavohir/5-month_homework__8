const CustomErrorHandler = require("../error/custom.error.hendler")

module.exports = function (error,req,res,next) {
    if (error instanceof CustomErrorHandler ) {
        return res.status(error.status || 400).json({message: error.message},error: error.error)
    }

    return res.status(500).json({ message: error.message || 'Server error' })
}