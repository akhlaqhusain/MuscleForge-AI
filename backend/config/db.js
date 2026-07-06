const mongoose = require('mongoose')
const dns = require('dns');

dns.setServers(['8.8.8.8'])

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`✅  MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌  MongoDB error:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
