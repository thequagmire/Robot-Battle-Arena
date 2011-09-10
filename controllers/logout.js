exports.controller = function(req, res) {
	var sess = req.session;
	delete(sess.user);
	res.redirect('/');
};