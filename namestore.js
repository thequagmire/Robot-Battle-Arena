

exports.namelist = {};
exports.addOne = function(key, data) {
	this.namelist[key] = {
		 id: key
		,name: data.name
		,email: data.email
		,room: data.room
		,clone: function() {
			return {
				 id: this.id
				,name: this.name
				,email: this.email
				,room: this.room
			};
		}
	}
}

exports.getByRoom = function(room) {
	var persons = [];
	for(var i in this.namelist) {
		if (this.namelist[i].room == room) {
			persons[persons.length] = this.namelist[i].clone();
		}
	}
	persons.sort(function(a,b){
		if (a.name.toLowerCase() < b.name.toLowerCase())
			return -1;
		if (a.name.toLowerCase() > b.name.toLowerCase())
			return 1
		return 0
	});
	return persons;
}
exports.getRoom = function(key) {
	if (!this.namelist[key])
		return '';
	return this.namelist[key].room;
}
exports.getName = function(key) {
	if (!this.namelist[key])
		return '';
	return this.namelist[key].name;
}
exports.getEmail = function(key) {
	if (!this.namelist[key])
		return '';
	return this.namelist[key].email;
}
exports.getByName = function(name) {
	for(var i in this.namelist) {
		if (this.namelist[i].name == name) {
			return this.namelist[i];
		}
	}
	return false;
}
exports.deleteOne = function(key) {
	if (!this.namelist[key])
		return false;
	delete(this.namelist[key]);
	return true;
}