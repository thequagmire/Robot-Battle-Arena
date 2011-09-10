exports.controller = function(req, res) {
	var sess = req.session;
	if (!sess.user) {
		res.redirect('/');
		return;
	}
	res.render('chat',{
		 layout:'layout_in'
		,email:sess.user.email
		,name:sess.user.nickname
		,room:'lobby'
		,pagetitle:'Robot Battle: Lobby'
	});
};