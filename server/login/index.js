
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const database = require('../database')
const asyncWrap = require('../utils/async-wrap')
const router = express.Router()

router.post('/', asyncWrap(async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const adminUser = process.env.ADMIN_USER
  const adminPass = process.env.ADMIN_PASS
  const jwtSecret = process.env.JWT_SECRET

  const genToken = (type) => jwt.sign({ username, type }, jwtSecret, {
    expiresIn: '24h'
  })

  if (username === adminUser && password === adminPass) {
    return res.json({
      success: true,
      message: '',
      token: genToken('admin')
    })
  }

  const users = await database.query('SELECT * FROM accounts WHERE username=? OR studentid=?', [username, username])
  if (users.length === 0) {
    return res.json({
      success: false,
      message: 'No account found',
      token: null
    })
  }

  const user = users[0]
  const match = await bcrypt.compare(password, user.password)
  if (match) {
    res.json({
      success: true,
      message: '',
      token: genToken('user')
    })
  } else {
    res.json({
      success: false,
      message: 'Invalid password'
    })
  }
}))

module.exports = router
