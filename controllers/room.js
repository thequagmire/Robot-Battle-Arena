exports.controller = function(req, res) {
	var sess = req.session;
	if (!sess.user) {
		res.redirect('/');
		return;
	}
	res.render('room',{
		 layout:'layout_in'
		,email:sess.user.email
		,name:sess.user.nickname
		,room:req.params.roomid
		,color:req.params.color
		,pagetitle:'Robot Battle: '+req.params.roomid
	});
};