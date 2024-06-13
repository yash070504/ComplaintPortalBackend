require("dotenv").config();
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3500 ;
const router = require('./routes/root');
const errorHandler = require('./middleware/errorHandler');
const cookiePraser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConnect')
const mongoose = require('mongoose')
const  { logger, logEvents } = require('./middleware/logger') ;
const userRouter = require('./routes/userRoutes');
const noteRouter = require('./routes/notesRoute');
const authRouter = require('./routes/authRoute')



//we can acess the envinronment variable llike this 
console.log(process.env.NODE_ENV);

connectDB();

app.use(logger);

//That make API to public ,this corsOption function a array where we want that this websites can acess the data 
app.use(cors(corsOptions));

app.use(cookiePraser());




//StaTIC fILE ARE FILE that are not acess by route(like html css)
//We used middleware to use static file for public folder 
//like in 404.html page to link css we only give address like "css/style.css" not like "/public/css/style.css"
app.use('/',express.static(path.join(__dirname,'public')));


//Ability to use JSON file
app.use(express.json());


app.use('/',router) ;
app.use('/auth',authRouter);
app.use('/users',userRouter);
app.use('/notes',noteRouter);


//This is error page
app.all('*',(req,res) => {
      res.status(404);
      if(req.accepts('html')){
        res.sendFile(path.join(__dirname,'views/404.html'));
      }else if(req.accepts('json')){
        res.json({message : '404 Not Found'});
      }else{
         res.type('txt').send('404 is Found');
      }
      
})

app.use(errorHandler);

mongoose.connection.once('open',() => { 
    console.log('MongoBd is connected');
   
})

app.listen(PORT,() => {
  console.log( "Server is started at",PORT)})

mongoose.connection.on('error' , err=> {
     console.log(err) ;
     logEvents(`${err.no}\t${err.code}\t${err.hostname}`, 'mongoErrLog.log')

})