exports.controller = function(req, res) {
	var sess = req.session;
	if (sess.user) {
		res.redirect('/chat');
		return;
	}
	
	res.render('setup',{layout:'layout_out',errors:{},pagetitle:'Robot Battle: Account Setup'});
};