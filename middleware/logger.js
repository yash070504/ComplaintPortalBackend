//this pacakge used in giving date and time
// savae the who is logging the website
const {format} = require('data-fns');
const {v4 : uuid} = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (message, logFileName) => {

  const logItem = `\t${uuid()}\t${message}\n`

  try {
      if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
          await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
      }
      await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
  } catch (err) {
      console.log(err)
  }
}

const logger = (req, res, next) => {
  //this is above Function
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
  console.log(`${req.method} ${req.path}`)
  next();
}

module.exports = { logEvents, logger }