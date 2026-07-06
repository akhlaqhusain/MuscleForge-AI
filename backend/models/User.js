const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, required: true, trim: true, maxlength: 80,
    },
    email: {
      type: String, required: true, unique: true,
      lowercase: true, trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.'],
    },
    password: {
      type: String, required: true, minlength: 6, select: false,
    },
    role: {
      type: String, enum: ['user', 'admin'], default: 'user',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

/* Hash password before save */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

/* Compare plain password to hash */
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

/* Strip sensitive fields from JSON output */
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', userSchema)
