// Import dependancies
console.log("Imports");
var  io = require('socket.io').listen(3030)
	,clientHandlers = require('./sockethandlers.js').socketHandlers;

// socket.io injection
clientHandlers.setIO(io);


// configure socket.io
console.log("Set Logging Level");
//io.set('log level', 1);


// Setup socket listeners
console.log("Build Listeners");
io.sockets.on('connection', function (client) {
	client.on('message', function (message) {
		// do a little quick checking to make sure it's all cool...'
		try
		{
			var msgObj = JSON.parse(message);
		}
		catch (e)
		{
			console.log('json parse error on client ' + client.id );
			console.log(e);
			return;
		}
		
		if (clientHandlers[msgObj.type]) {
			clientHandlers[msgObj.type].call(client, msgObj);
		}
		
	});
	client.on('disconnect', function() {
		clientHandlers['disconnect'].call(client);
	});
	setTimeout(function() {
		client.emit('welcome', { next: 'checkin' });
	},300);
});

