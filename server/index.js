
const path = require('path')
const express = require('express')
const cors = require('cors')

const envPath = path.resolve(__dirname, '..', '.env')
require('dotenv').config({ path: envPath })

const login = require('./login')
const user = require('./user')
const users = require('./users')
const calendar = require('./calendar')

const app = express()
const port = process.env.PORT || 3001
const appBuild = path.resolve(__dirname, '../build')

app.use(cors())
app.use(express.static(appBuild))
app.use(express.json())

app.use('/login', login)
app.use('/user', user)
app.use('/users', users)
app.use('/calendar', calendar)

app.use((err, req, res, next) => {
  console.error(err)
  res.json({
    success: false,
    message: err.message
  })
})

app.use('*', (req, res) => {
  const indexPath = path.resolve(__dirname, '../build/index.html')
  res.sendFile(indexPath)
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})
