const fs = require('fs').promises
const jsonreader = (filePath, callback) => {
  fs.readFile(filePath, { encoding: 'utf8' })
    .then((data) => {
      callback(JSON.parse(data))
    })
    .catch((err) => {
      console.log(err)
      callback(undefined)
    })
}
module.exports = jsonreader
