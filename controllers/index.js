exports.controller = function(req, res) {
	var sess = req.session;
	
	if (sess.user) {
		res.redirect('/chat');
		return;
	}
	
	res.render('index',{layout:'layout_out',pagetitle:'Robot Battle: Home'});
};