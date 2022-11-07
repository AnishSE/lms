"use strict"
const mongoose  = require('mongoose'),
      Schema    = mongoose.Schema;
let UserSchema = new Schema({
    first_name           : {type: String,  required: true},
    last_name            : {type: String, required: true},
    email                : {type: String, required: true },
    gender               : {type: String, required: true,                             
      enum: {
        values: ['Male', 'Female', 'Others'],
        message: 'Only Male, Female and Others is accepted.'
      } 
    },
    password             : {type: String, required: true},
    socialMediaId        : {type: String, required: false},
    socialMedia          : {type: String, required: false},
    role_id              : {type: Number, required: true},
    dateOfBrth           : {type: String, required: false},
    dateOfAnni           : {type: String, required: false},
    status               : {type: Boolean, required: true, default: 1},  
    active               : {type: Number, required: true, default: true},
    verified             : {type: Boolean, required: false, default: false},
    resetPasswordToken   : {type: String, required: false},
    resetPasswordExpires : {type: String, required: false},
},{ timestamps : true });

// UserSchema.path('email').validate(async (email) => {
//     if(email){
//       const nameCount = await mongoose.models.User.countDocuments({ email:email })
//       return !nameCount
//     }else{
//       return true
//     }
//   }, 'email already exists')

// Export the model
module.exports = mongoose.model('User', UserSchema);

