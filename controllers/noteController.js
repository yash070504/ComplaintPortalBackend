const Note = require("../models/Note")
const User = require("../models/User");
const asyncHandler = require('express-async-handler');

const getAllNotes = asyncHandler(async(req,res) => { 
    
  const note = await Note.find().lean();

  if(!note?.length) {
      return res.status(400).json({message : 'No Notes found'});
  }

  //Add username with notes 

  const noteWithName = await Promise.all(note.map(async(note) => {
     const user = await User.findById(note.user).lean().exec();
     return {...note , username : user.username}
  }))
   res.json(noteWithName);

})

const createNewNote = asyncHandler(async(req,res) => {
       const {user ,title ,text} = req.body ;
       if(!user || !title || !text){
         res.status(400).json({meassage : 'All Fields are required'});
       }

       //Duplite title
        
       const duplicate = await Note.findOne({title }).lean().exec();

       if(duplicate){
         res.status(409).json({message : 'Duplicate Title is Found'})
       }

       const note = await Note.create({
         user ,
         title,
         text
       })

       if(note){
         res.status(201).json({message : 'New Note Created'});
       }else{
        return res.status(400).json({ message: 'Invalid note data received' })
       }


})

const updateNote = asyncHandler(async(req,res) => { 
    const {id,user,title ,text ,completed } = req.body ;

    if(!id || !user || !title || !text || typeof completed !== 'boolean'){
      return res.status(400).json({ message: 'All fields are required' })
    } 

    
    // Confirm note exists to update
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }
    const duplicate = await Note.findOne({ title }).lean().exec()

    // Allow renaming of the original note 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' updated`)


})

// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body

  // Confirm data
  if (!id) {
      return res.status(400).json({ message: 'Note ID required' })
  }

  // Confirm note exists to delete 
  const note = await Note.findById(id).exec()

  if (!note) {
      return res.status(400).json({ message: 'Note not found' })
  }

  const result = await note.deleteOne()

  const reply = `Note '${result.title}' with ID ${result._id} deleted`

  res.json(reply)
})

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote
}