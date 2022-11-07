const bcrypt          = require('bcryptjs');
const config          = require('config');
let jwt         = require('jsonwebtoken');
const token_config  = config.get('JWT');
//const account_confirmation = require("../email_templates/account-confirmation.html")

class user_manager {

    constructor(wagner) {
    	this.User = wagner.get("User")
    }

	find(req){
	    return new Promise(async (resolve, reject)=>{
	      	try{
		        let user  = await this.User.findOne(req);
		        resolve(user)
	      	} catch(error){
	        	reject(error);
	        }
	    })
	}

	insert(req){
	    return new Promise(async (resolve, reject)=>{
	      	try{
				console.log(req)
		        let user  = await this.User.create(req);
		        resolve(user)
	      	} catch(error){
	      		reject(error);
	        }
	    })
	}

}

module.exports  = user_manager;