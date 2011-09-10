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
		userModel.findOne({
			 email:req.body.email
			,password:crypto.createHash('md5').update(req.body.password).digest("hex")
		}, function (err, doc) {
			if (doc) {
				sess.user = {
					 nickname: doc.nickname
					,email: doc.email
					,lastlogin: doc.lastlogin
				};
				doc.lastlogin = new Date();
				doc.save();
			}
			res.redirect('/');
		});
};