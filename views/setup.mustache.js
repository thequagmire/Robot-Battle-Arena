module.exports = {
  errorlist: function() {
	var errors = {
		 invalidName: 'Invalid Name<br />'
		,invalidEmail: 'Invalid Email<br />'
		,invalidPass: 'Invalid Password<br />'
		,unmatchedPass: 'Password Failed Confirmation<br />'
		,emailInUse: 'Email Address In Use<br />'
		,nameInUse: 'Name In Use<br />'
	};
	var errorlist = "";
	
  	for (var key in this.errors) {
  		if (this.errors[key])
	  		errorlist += errors[key];
  	}
    return errorlist;
  },
  nameError: function() {
  	return (this.errors['invalidName']);
  },
  emailError: function() {
  	return (this.errors['invalidEmail'] || this.errors['emailInUse']);
  },
  passwordError: function() {
  	return (this.errors['invalidPass']);
  },
  confirmError: function() {
  	return (this.errors['unmatchedPass']);
  }
};