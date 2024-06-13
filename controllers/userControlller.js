const User = require('../models/User');
const Note = require('../models/Note');

//this is used the hash the password like convert the password to encrypted password 
const bcrypt = require('bcrypt');

//async-handler is Simple middleware for handling exceptions inside of async express routes and passing them to your express error handlers
const asyncHandler = require('express-async-handler');

const getAllUser = asyncHandler(async (req,res) => {
   const user = await User.find({}).select('-password').lean();
   if(!user?.length){
     return res.status(400).json({message : 'No user'})
   }
   res.json(user);
} ) ;

const  createNewUser = asyncHandler(async (req,res) => { 

   console.log(req.body);

   const {username ,password , roles} = req.body ;
   //confrim data ;
   if(!username || !password || !Array.isArray(roles) || !roles.length){
    return res.status(400).json({message : 'All fields are required'})
   }
   //check for duplicate 
   const duplicate = await User.findOne({username}).lean().exec()
   
   if(duplicate) {
     return res.status(409).json({message : 'Duplicate Username'});
   }
   
   //hashing password
   const hashedPwd = await bcrypt.hash(password,10) //salt rounds ;

   const userObject = {
      username ,
      "password" : hashedPwd ,
      roles
   }

   const newUser = await User.create(userObject) ;

   if(newUser) {
      // created
     return  res.status(201).json({message : `New User ${username} created`}) ;
   }else{
      return  res.status(400).json({ message : 'Invaild user data recieved'}) ;
   }

} ) ;

const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body

  // Confirm data 
  if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
      return res.status(400).json({ message: 'All fields except password are required' })
  }

  // Does the user exist to update?
  const user = await User.findById(id).exec()

  if (!user) {
      return res.status(400).json({ message: 'User not found' })
  }

  // Check for duplicate 
  const duplicate = await User.findOne({ username }).lean().exec()

  // Allow updates to the original user 
  if (duplicate && duplicate?._id.toString() !== id) {
      return res.status(409).json({ message: 'Duplicate username' })
  }

  user.username = username
  user.roles = roles
  user.active = active

  if (password) {
      // Hash password 
      user.password = await bcrypt.hash(password, 10) // salt rounds 
  }

  const updatedUser = await user.save()

  res.json({ message: `${updatedUser.username} updated` })
})
const deleteUser = asyncHandler(async (req,res) => {
   const {id} = req.body ;
   if(!id){
    return  res.status(400).json({message : 'User Id Is required'})
   }

   const note = await Note.findOne({user : id}).lean().exec();

   if(note){
     return res.status(400).json({message : 'User has asssigned notes'});  
   }
   const user = await User.findById(id).exec();

   if(!user){
      return res.status(400).json({message : 'User is not found'});

   }

   const result = await user.deleteOne() ;

   const reply = `Username ${result.username} with ID ${result._id}`;

   res.json(reply);

} ) ;


module.exports = {
   getAllUser,
   createNewUser,
   updateUser,
   deleteUser
};
