
const express = require('express')
const jwt = require('jsonwebtoken')

const database = require('../database')
const asyncWrap = require('../utils/async-wrap')
const router = express.Router()

router.get('/', asyncWrap(async (req, res) => {
  const jwtSecret = process.env.JWT_SECRET
  const auth = req.get('Authorization')

  try {
    if (!auth.match(/^(Bearer ([\w-]*\.[\w-]*\.[\w-]*))$/i)) throw new Error('Invalid token')

    const token = auth.split(' ')[1]
    jwt.verify(token, jwtSecret)
  } catch (error) {
    return res.json({
      success: false,
      message: 'Invalid token'
    })
  }

  const events = await database.query('SELECT * FROM calendar')
  res.json({
    success: true,
    message: '',
    events: events.map(event => ({
      id: event.id,
      title: event.name,
      description: event.description,
      start: event.start,
      end: event.end
    }))
  })
}))

router.post('/', asyncWrap(async (req, res) => {
  const name = req.body.name
  const description = req.body.description
  const dateStart = req.body.dateStart
  const dateEnd = req.body.dateEnd
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

  await database.query('INSERT INTO calendar (name, description, start, end) VALUES (?, ?, ?, ?)', [name, description, dateStart, dateEnd])
  res.json({
    success: true,
    message: ''
  })
}))

router.post('/:id', asyncWrap(async (req, res) => {
  const id = req.params.id
  const name = req.body.name
  const description = req.body.description
  const dateStart = req.body.dateStart
  const dateEnd = req.body.dateEnd
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

  await database.query('UPDATE calendar SET name=?, description=?, start=?, end=? WHERE id=?', [name, description, dateStart, dateEnd, id])
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

  await database.query('DELETE FROM calendar WHERE id=?', [id])
  res.json({
    success: true,
    message: ''
  })
}))

module.exports = router
