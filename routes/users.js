const users = require('express').Router()
const jsonReader = require('../modules/jsonreader')
const path = require('path')

const sendUserInformation = (req, res) => {
  const getUser = data => {
    if (data !== undefined) {
      for (let i = 0; i < data.length; i++) {
        if (data[i]._id === req.params.id) {
          res.send(data[i])
          return
        }
      }
      res.status(404).send({ message: 'User not found' })
    } else {
      res.send({ message: 'Can not read .json file' })
    }
  }
  jsonReader(path.join(__dirname, '../data/users.json'), getUser)
}

const readUsersList = (req, res) => {
  const getObject = data => {
    if (data !== undefined) {
      res.send(data)
    } else {
      res.send({ message: 'Can not read .json file' })
    }
  }
  jsonReader(path.join(__dirname, '../data/users.json'), getObject)
}

users.get('/', readUsersList)
users.get('/:id', sendUserInformation)

module.exports = users