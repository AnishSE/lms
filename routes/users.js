var express = require("express");
var router = express.Router();
const multer = require("multer");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const HTTPStatus = require("http-status");
const mongoose                    = require('mongoose');
const storage = multer.diskStorage({
  limits: { fileSize: 10000 },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
module.exports = (app, wagner) => {
  /* GET users listing. */

  let authMiddleware = wagner.get("auth");
  router.get("/", function (req, res, next) {
    res.send("respond with a resource");
  });

  /* Register User */
  router.post('/register', [
    check('first_name').matches(/^[a-zA-Z']*$/).bail().withMessage('Invalid first name value').custom(value => {
        let min = 3, max = 20;
        if(value.length < min)
            throw new Error(`Field must be minimum ${min} characters`)
        else if(value.length > max)
            throw new Error(`Field must be maximum ${max} characters`)
        else return true
    }),
    check('last_name').matches(/^[a-zA-Z']*$/).bail().withMessage('Invalid last name value').custom(value => {
        let min = 3, max = 20;
        if(value.length < min)
            throw new Error(`Field must be minimum ${min} characters`)
        else if(value.length > max)
            throw new Error(`Field must be maximum ${max} characters`)
        else return true
    }), 
    check('email').isEmail().matches(/^[a-zA-Z0-9@.]*$/).withMessage("Incorrect Email."),

    check('role_id').not().isEmpty().withMessage("Role field is required").bail().isInt(),
    check('gender').not().isEmpty().withMessage("Gender field is required"),
    check('password').matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]{8,}$/).withMessage('Password must be atleast 8 characters and should contain at least one letter, one number and one special character')
  ], async (req, res, next) => {
    try{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
          console.log(errors);
          let lasterr = errors.array().pop();
          lasterr.message = lasterr.msg + ": " + lasterr.param.replace("_"," ");
          return res.status(405).json({ success: '0', message: "failure", data: lasterr });
      }

      let conds = { email : req.body.email };
      let userData = await wagner.get('user_manager').find(conds);

      if(userData){
        res.status(409).json({ success: '1', message: "Email already exists.", data: '' });
      }else{
        req.body.password = await bcrypt.hashSync(req.body.password, salt);
        let insert = await wagner.get('user_manager').insert(req.body);
        req.user_id = insert._id
        let token = await wagner.get('auth')["generateShortAccessToken"](req,res);
        //let sendMail = await wagner.get('user_manager').sendMailEmailVerification(req.body.email, token);
        res.status(HTTPStatus.OK).json({ success: '1', message: "User Added.", data: '' });
      }  
    }catch(e){
      console.log(e)
      res.status(500).json({ success: '0', message: "failure", data: e });
    }
  });

  router.post('/login', [      
    check('email').isEmail().matches(/^[a-zA-Z0-9@.]*$/).withMessage("Incorrect Email."),
    check('password').not().isEmpty().withMessage("Password is required").bail(),
  ], async (req, res, next) => {
    try{
      let errors = validationResult(req);
      if(!errors.isEmpty()){
          console.log(errors);
          let lasterr = errors.array().pop();
          lasterr.message = lasterr.msg + ": " + lasterr.param.replace("_"," ");
          return res.status(405).json({ success: '0', message: "failure", data: lasterr });
      }
      let conds = { email : req.body.email, role_id : 2 };
      let userData = await wagner.get('user_manager').find(conds);
      if(userData){
        if( (bcrypt.compareSync( req.body.password, userData.password ) ) ){
          let jsonData = {
            '_id': userData._id,
            'first_name': userData.first_name,
            'last_name': userData.last_name,
            'email': userData.email,
            'role_id': userData.role_id,              
          }
          let token = await wagner.get('auth')["generateAccessToken"](jsonData,res);
          res.status(HTTPStatus.OK).json({ success: '1', message: "User Data", data: token}); 
            
        }else{
          res.status(401).json({ success: '1', message: "In-correct email or password.", data: '' });  
        }
      }else{
        res.status(400).json({ success: '1', message: "No user found.", data: '' });  
      }        
    }catch(e){
      console.log(e)
      res.status(500).json({ success: '0', message: "failure", data: e });
    }
  });  

  return router;
};
