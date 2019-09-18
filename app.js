const express = require('express')
const path = require('path')
const usersRoute = require('./routes/users')
const cardsRoute = require('./routes/cards')

const { PORT = 3000 } = process.env
const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use('/users', usersRoute)
app.use('/cards', cardsRoute)
app.get('*', (req, res) => {
  res.status(404).send({ message: 'Page not found' })
})

app.listen(PORT, () => {
  console.log('App is listening to port ', PORT)
})
