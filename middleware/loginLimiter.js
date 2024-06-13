const rateLimit = require('express-rate-limit')
const {logEvents} = require('./logger')

const loginLimit = rateLimit({
   windowMs : 60 * 1000 , //1 min
   max : 5 , //Limit each IP to 5 login per "windows"

message : {
   message : 'Too many Login Attempts from this IP , please try again after a  60 sec'
},
//What happen is Limit is Reached
handler:(req,res,next,options) => {
  logEvents(`Too Many Requests : ${options.message.message}\t${req.method}\t${req.url}\t${req.header.orgin}`,'errLog.log')
  res.status(options.statusCode).send(options.message)
},
standardHeader : true , //Return rate Limit info in the 'rateLimit
legacyHeader : false


})

module.exports = loginLimit ;