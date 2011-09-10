var mongoose = require('mongoose')
    ,crypto = require('crypto')
	,Schema = mongoose.Schema
	,db = mongoose.connect('mongodb://localhost/multimixmax')
	,UserSchema = new Schema({
		 nickname   : String
		,email      : String
		,twitter    : String
		,password   : String
		,signup     : {
			type: Date,
			default: Date.now
		},lastlogin : {
			type: Date
		}
	})
	,ObjectId = Schema.ObjectId
	,userModel = mongoose.model('users', UserSchema);
	
exports.controller = function(req, res) {
	var sess = req.session;
	if (sess.user) {
		res.redirect('/chat');
		return;
	}
	
	// validate user info
	var errors = {
		 invalidName: false
		,invalidEmail: false
		,invalidPass: false
		,unmatchedPass: false
		,emailInUse: false
		,nameInUse: false
	};
	
	if (req.body.name.trim() == "")
		errors.invalidName = true;
		
	var emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if (!emailFilter.test(req.body.email))
		errors.invalidEmail = true;
	
	if (req.body.password != req.body.password_confirm)
		errors.unmatchedPass = true;
	
	if (req.body.password.trim() == "")
		errors.invalidPass = true;
	
	if (errors.invalidName || errors.invalidEmail || errors.invalidPass || errors.unmatchedPass) {
		res.render('setup',{layout:'layout_out',errors:errors,values:req.body,pagetitle:'Robot Battle: Account Setup'});
		return;
	}
	
	// check for existing user account
	userModel.findOne({email:req.body.email}, function (err, doc) {
		if (doc) {
			errors.emailInUse = true;
		}
		
		userModel.findOne({nickname:req.body.name}, function (err, doc) {
			if (doc) {
				errors.nameInUse = true;
				res.render('setup',{layout:'layout_out',errors:errors,values:req.body,pagetitle:'Robot Battle: Account Setup'});
				return;
			}
			
			if (!errors.emailInUse && !errors.nameInUse) {
				var userObj = new userModel();
				
				userObj.nickname = req.body.name;
				userObj.email = req.body.email;
				userObj.password = crypto.createHash('md5').update(req.body.password).digest("hex");
				userObj.signup = new Date();
				userObj.lastlogin = new Date();
				userObj.save();
				
				sess.user = {
					 nickname: req.body.name
					,email: req.body.email
					,lastlogin: userObj.lastlogin
				};
				res.redirect('/chat');
				
				return;
			}
			
			
			res.render('setup',{layout:'layout_out',errors:errors,values:req.body,pagetitle:'Robot Battle: Account Setup'});
		});
	});
};