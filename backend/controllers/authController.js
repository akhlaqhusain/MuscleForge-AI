const dns = require('dns').promises
const User               = require('../models/User')
const { sendTokenResponse } = require('../utils/jwt')

// The signup email needs to look like a real, reachable address — not just
// any string. RFC 2606 reserves these domains for documentation/examples —
// they can never receive real mail — plus a few common throwaway domains.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const BLOCKED_EMAIL_DOMAINS = new Set([
  'example.com', 'example.net', 'example.org', 'example.edu',
  'test.com', 'mailinator.com', 'yopmail.com', 'guerrillamail.com',
  '10minutemail.com', 'tempmail.com', 'throwawaymail.com', 'fakeinbox.com',
  'trashmail.com'
])

function validateEmail(email) {
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address.'
  }
  const domain = email.split('@')[1].toLowerCase()
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return "That email address can't be used — please enter a real, reachable email."
  }
  return null
}

// Checks that the email's domain actually has mail servers configured
// (an MX record), which catches typos and made-up domains like
// "you@hello.com" when hello.com isn't set up to receive email at all.
// This only proves the DOMAIN can receive mail — it can't confirm the
// specific address exists or belongs to this person (that needs a real
// verification email, which is a separate upgrade).
async function domainAcceptsMail(domain) {
  const TIMEOUT_MS = 3000
  const timeout = new Promise((resolve) => setTimeout(() => resolve('timeout'), TIMEOUT_MS))

  try {
    const result = await Promise.race([dns.resolveMx(domain), timeout])

    if (result === 'timeout') {
      // DNS was slow/unreachable — don't block a real signup over our own
      // infra hiccup, just let it through unchecked this one time.
      console.warn(`MX lookup for "${domain}" timed out — allowing signup anyway.`)
      return true
    }

    return Array.isArray(result) && result.length > 0
  } catch (err) {
    // ENOTFOUND / ENODATA = domain doesn't exist or has no mail servers.
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return false
    }
    // Any other DNS error (resolver down, etc.) — fail open, same reasoning
    // as the timeout case above.
    console.warn(`MX lookup for "${domain}" failed (${err.code}) — allowing signup anyway.`)
    return true
  }
}

/**
 * POST /api/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' })
    }

    const trimmedEmail = email.trim()
    const emailError = validateEmail(trimmedEmail)
    if (emailError) {
      return res.status(400).json({ success: false, message: emailError })
    }

    const domain = trimmedEmail.split('@')[1]
    if (!(await domainAcceptsMail(domain))) {
      return res.status(400).json({
        success: false,
        message: `"${domain}" doesn't appear to accept email — check for a typo or use a different address.`,
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
    }

    const user = await User.create({ name, email, password })
    sendTokenResponse(user, 201, res)
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been disabled.' })
    }

    sendTokenResponse(user, 200, res)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/auth/me  (protected)
 */
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user })
}

module.exports = { signup, login, getMe }