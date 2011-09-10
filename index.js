// Import dependancies
console.log("Imports");
var  express = require("express")
    ,mustachio = require("mustachio")
    ,app = express.createServer()
    ,mongoose = require('mongoose')
    ,MongoStore = require('connect-mongo');;



// Setup globals
console.log("Globals");
var  portnum = parseInt(process.argv[2],10) || 3000;



// Configure the app
console.log("Configuration");
app.configure(function() {
	app.use(express.bodyParser());
	app.set('views', __dirname + '/views');
	app.use(express.static(__dirname + '/public'));
	app.register('.mustache', mustachio);
	app.set('view engine', 'mustache');
	app.use(express.cookieParser());
    app.use(
    	express.session({
    		secret: "sadfjhaknviahrsit", store: new MongoStore({
				db:'multimixmax',
				host: 'localhost',
				clear_interval: 60*60 // 1 hour timeout
    		})
    	})
    );
});



// Setup routes
console.log("Get Routes");
app.get("/",require('./controllers/index.js').controller);
app.get("/setup",require('./controllers/setup.js').controller);
app.get("/logout",require('./controllers/logout.js').controller);
app.get("/chat",require('./controllers/chat.js').controller);
app.get("/room/:roomid/:color",require('./controllers/room.js').controller);

console.log("Post Routes");
app.post("/newacct",require('./controllers/newacct.js').controller);
app.post("/login",require('./controllers/login.js').controller);



// Start listening
app.listen(portnum);
console.log("HTTP Server Started on "+portnum);