const express    = require('express')
const router     = express.Router()
const { generateWorkout, getWorkoutHistory, deleteWorkout } = require('../controllers/workoutController')
const { aiLimiter } = require('../middleware/rateLimiter')
const { protect } = require('../middleware/auth')

router.post('/generate', aiLimiter, protect, generateWorkout)
router.get('/history',              protect, getWorkoutHistory)
router.delete('/:id',               protect, deleteWorkout)

module.exports = router
