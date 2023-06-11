
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const database = require('../database')
const asyncWrap = require('../utils/async-wrap')
const router = express.Router()

router.get('/', asyncWrap(async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')
  let payload = null

  try {
    if (!auth.match(/^(Bearer ([\w-]*\.[\w-]*\.[\w-]*))$/i)) throw new Error('Invalid token')

    const token = auth.split(' ')[1]
    payload = jwt.verify(token, jwtSecret)
  } catch (error) {
    return res.json({
      success: false,
      message: 'Invalid token'
    })
  }

  const users = await database.query('SELECT * FROM accounts WHERE username=?', [payload.username])
  if (users.length === 0) {
    return res.json({
      success: false,
      message: 'No user found'
    })
  }

  const user = users[0]
  res.json({
    success: true,
    message: '',
    user: {
      id: user.id,
      name: user.name,
      studentid: user.studentid,
      username: user.username
    }
  })
}))

router.post('/', asyncWrap(async (req, res) => {
  const currentPassword = req.body.currentPassword
  const newPassword = req.body.newPassword
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')
  let payload = null

  try {
    if (!auth.match(/^(Bearer ([\w-]*\.[\w-]*\.[\w-]*))$/i)) throw new Error('Invalid token')

    const token = auth.split(' ')[1]
    payload = jwt.verify(token, jwtSecret)
  } catch (error) {
    return res.json({
      success: false,
      message: 'Invalid token'
    })
  }

  const users = await database.query('SELECT * FROM accounts WHERE username=?', [payload.username])
  if (users.length === 0) {
    return res.json({
      success: false,
      message: 'No user found'
    })
  }

  const user = users[0]
  const match = await bcrypt.compare(currentPassword, user.password)
  if (match) {
    const hash = await bcrypt.hash(newPassword, 10)
    await database.query('UPDATE accounts SET password=? WHERE username=?', [hash, payload.username])
    res.json({
      success: true,
      message: ''
    })
  } else {
    res.json({
      success: false,
      message: 'Current password does not match'
    })
  }
}))

module.exports = router
