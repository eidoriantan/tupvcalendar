
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const database = require('../database')
const asyncWrap = require('../utils/async-wrap')
const router = express.Router()

router.get('/', asyncWrap(async (req, res) => {
  const adminUser = process.env.ADMIN_USER
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')

  try {
    if (!auth.match(/^(Bearer ([\w-]*\.[\w-]*\.[\w-]*))$/i)) throw new Error('Invalid token')

    const token = auth.split(' ')[1]
    const payload = jwt.verify(token, jwtSecret)
    if (payload.type !== 'admin' || payload.username !== adminUser) throw new Error('Invalid token')
  } catch (error) {
    return res.json({
      success: false,
      message: 'Invalid token'
    })
  }

  const users = await database.query('SELECT * FROM accounts')
  res.json({
    success: true,
    message: '',
    users: users.map(user => ({
      id: user.id,
      name: user.name,
      studentId: user.studentid,
      username: user.username,
      added: user.added
    }))
  })
}))

router.post('/', asyncWrap(async (req, res) => {
  const name = req.body.name
  const studentId = req.body.studentId
  const username = req.body.username
  const password = req.body.password
  const adminUser = process.env.ADMIN_USER
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')

  try {
    if (!auth.match(/^(Bearer ([\w-]*\.[\w-]*\.[\w-]*))$/i)) throw new Error('Invalid token')

    const token = auth.split(' ')[1]
    const payload = jwt.verify(token, jwtSecret)
    if (payload.type !== 'admin' || payload.username !== adminUser) throw new Error('Invalid token')
  } catch (error) {
    return res.json({
      success: false,
      message: 'Invalid token'
    })
  }

  const users = await database.query('SELECT * FROM accounts WHERE username=? OR studentid=?', [username, studentId])
  if (users.length > 0) {
    return res.json({
      success: false,
      message: 'Username or student ID was already taken'
    })
  }

  const hash = await bcrypt.hash(password, 10)
  await database.query('INSERT INTO accounts (name, studentid, username, password) VALUES (?, ?, ?, ?)', [name, studentId, username, hash])
  res.json({
    success: true,
    message: ''
  })
}))

router.delete('/:id', asyncWrap(async (req, res) => {
  const id = req.params.id
  const adminUser = process.env.ADMIN_USER
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')

  try {
    if (!auth.match(/^(Bearer ([\w-]*\.[\w-]*\.[\w-]*))$/i)) throw new Error('Invalid token')

    const token = auth.split(' ')[1]
    const payload = jwt.verify(token, jwtSecret)
    if (payload.type !== 'admin' || payload.username !== adminUser) throw new Error('Invalid token')
  } catch (error) {
    return res.json({
      success: false,
      message: 'Invalid token'
    })
  }

  await database.query('DELETE FROM accounts WHERE id=?', [id])
  res.json({
    success: true,
    message: ''
  })
}))

module.exports = router
