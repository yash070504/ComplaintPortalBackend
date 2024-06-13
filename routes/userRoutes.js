const express  = require('express');
const userController = require('../controllers/userControlller') ;
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/')
.get(userController.getAllUser)
.put(userController.createNewUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)
                


module.exports = router;