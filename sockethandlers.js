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

var nameStore = require('./namestore.js')
var io = null;
var fluxList = {};
exports.socketHandlers = {
	setIO: function(injection) {
		io = injection;
	},
	checkin: function(data) {
		nameStore.addOne(this.id, {
			 room: data.room
			,name: data.name
			,email:data.email
			,id:this.id
		});
		this.join(data.room);
		exports.socketHandlers.sendRoomList(data.room);
		if (fluxList[data.name] != data.room) {
			io.sockets.in(data.room).emit("join",{name:data.name});
			delete(fluxList[data.name]);
		}
	},
	sendRoomList: function(room) {
		var inRoom = nameStore.getByRoom(room);
		io.sockets.in(room).emit("roomlist",inRoom);
	},
	chat: function(data) {
		var room = nameStore.getRoom(this.id);
		data.value = data.value.escapeHtml();
		io.sockets.in(room).emit("chat",data);
	},
	data: function(data) {
		var room = nameStore.getRoom(this.id);
		if (room == 'lobby' && !data.response) {
			data.roomName = crypto.createHash('md5').update((new Date()).getTime()+' '+data.challenger+' '+data.challengee).digest("hex");
		}
		io.sockets.in(room).emit("data",data);
	},
	disconnect: function() {
		var oldRoom = nameStore.getRoom(this.id);
		var oldName = nameStore.getName(this.id);
		if (oldRoom) {
			nameStore.deleteOne(this.id);
			this.leave(oldRoom);
		
			fluxList[oldName] = oldRoom;
			
			setTimeout(function() {
//				if (!fluxList[oldName] != oldRoom)
//					return;
				exports.socketHandlers.sendRoomList(oldRoom);
				var backInUser = nameStore.getByName(oldName);
				var newRoom = '';
				if (backInUser)
					newRoom = backInUser.room;
				
				if (oldRoom != newRoom) {
					io.sockets.in(oldRoom).emit("left",{name:oldName});
				}
				delete(fluxList[oldName]);
			},1000);
		}
	}
};




String.prototype.escapeHtml = function() {
  return this
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}