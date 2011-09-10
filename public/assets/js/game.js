$(document).ready( function() {
	jaws.assets.add("/assets/images/robot_blue_1.png");
	jaws.assets.add("/assets/images/robot_red_1.png");
});

var thisPlayerMove = false;
var thatPlayerMove = false;



function drawLine(context, startx, starty, endx, endy) {
  context.beginPath();
  context.moveTo(startx, starty);
  context.lineTo(endx, endy);
  context.closePath();
  context.stroke();
}


$(document).ready( function() {
	var playState = false;
	
	var thisRobots = [];
	var thatRobots = [];
	
	var thisDeployedBots = [];
	var thatDeployedBots = [];
	
	var allRobots = [];
	
	var thisBase = new base('red');
	var thatBase = new base('blue');
	
	var animate_blue = false;
	var animate_red  = false;
	
	
	
	var state = "setupTurn";
	
	
	
	
	$("body").append("<div id='programmie'></div>");
	$("#programmie").css({
		position:'absolute',
		display:'none',
		width:200,
		height:200,
		border: '1px solid #fff',
		background: '#666'
	});
	
	$("body").append("<div id='draggie'></div>");
	$("#draggie").css({
		position:'absolute',
		display:'none'
	});
	
	$("#robotInventory").bind("mousedown",function(evt) {
		if (state != "setupTurn")
			return;
		
		var curDrag = false;
		var curHover = false;
		
		if (evt.target.className == 'dragbot_'+myColor) {
			$("#draggie").addClass(evt.target.className);
			$("#draggie").css({display:'block', top:evt.pageY - 15,left:evt.pageX - 15});
			
			curDrag = $(evt.target);
			curDrag.css({
				opacity: .25
			});
			
			function move(evt) {
				if (
					!thisDeployedBots[0] &&
					evt.pageY-15 > $("#depot1").position().top &&
					evt.pageY-15 < $("#depot1").position().top + 50 &&
					evt.pageX > $("#depot1").position().left &&
					evt.pageX < $("#depot1").position().left + 30
				) {
					$("#depot1").css({border:"1px solid #fff"});
					curHover = 1;
				} else {
					$("#depot1").css({border:""});
					curHover = false;
				}
				if (!curHover) {
					if (
						!thisDeployedBots[1] &&
						evt.pageY-15 > $("#depot2").position().top &&
						evt.pageY-15 < $("#depot2").position().top + 50 &&
						evt.pageX > $("#depot2").position().left &&
						evt.pageX < $("#depot2").position().left + 30
					) {
						$("#depot2").css({border:"1px solid #fff"});
						curHover = 2;
					} else {
						$("#depot2").css({border:""});
						curHover = false;
					}
				}
				if (!curHover) {
					if (
						!thisDeployedBots[2] &&
						evt.pageY-15 > $("#depot3").position().top &&
						evt.pageY-15 < $("#depot3").position().top + 50 &&
						evt.pageX > $("#depot3").position().left &&
						evt.pageX < $("#depot3").position().left + 30
					) {
						$("#depot3").css({border:"1px solid #fff"});
						curHover = 3;
					} else {
						$("#depot3").css({border:""});
						curHover = false;
					}
				}
				
				
				$("#draggie").css({top:evt.pageY - 15,left:evt.pageX - 15});
			}
			function up(evt) {
				$("#draggie").css({display:"none"});
				curDrag.css({opacity:1});
				
				$("body").unbind("mousemove",move);
				$("body").unbind("mouseup",up);
				if (curHover) {
					curDrag.css({
						margin: "6px 0 0 1px",
						cursor: "auto"
					});
					$("#depot"+curHover).css({border:""});
					$("#depot"+curHover).append(curDrag);
					var robo = allRobots[curDrag.attr('idx')];
					robo.deploy(curHover-1);
					curDrag.bind("click",function(evt) {robo.program();});
					robo.program();
				}
			}
			
			$("body").bind("mousemove",move);
			$("body").bind("mouseup",up);
			
			
		}
		return false;
	});
	
	
	var robotIdx = 0;
	function robot(color) {
		this.id = robotIdx++;
		this.deployed = false;
		this.sprite = false;
		this.health = 50;
		this.moveQueue = {};
		this.color = color;
		this.pendingActions = [];
		this.maxMoves = 5;
		
		if (color == myColor) {
			$("#robotInventory").append("<div id='robot_"+color+"_"+this.id+"' class='dragbot_"+color+"'></div>");
			$("#robot_"+color+"_"+this.id).attr('idx',this.id);
			this.element = $("#robot_"+color+"_"+this.id);
		}
		allRobots[this.id] = this;
	}
	
	robot.prototype.addAction = function(whichAction) {
		if (this.pendingActions.length >= this.maxMoves) {
			return false;
		}
		this.pendingActions[this.pendingActions.length] = whichAction;
		this.program();
	}
	
	
	
	robot.prototype.program = function() {
		if (state != "setupTurn")
			return;
			
		var that = this;
		
		$("#programmie").html("");
		$("#programmie").css({
			display:'block',
			top: this.element.position().top - 200,
			left: this.element.position().left
		});
		$("#programmie").html("<div style='width:100%;height:20px;'><input id='up' type='button' value='up' /><input id='right' type='button' value='right' /><input id='down' type='button' value='down' /><input id='left' type='button' value='left' /><input id='shoot' type='button' value='shoot' /></div><br /><br />");
		
		function handleAddAction(whichAction) {
			that.addAction(whichAction);
		}
		
		$("#up").click(function(evt) {handleAddAction('up');});
		$("#right").click(function(evt) {handleAddAction('right');});
		$("#down").click(function(evt) {handleAddAction('down');});
		$("#left").click(function(evt) {handleAddAction('left');});
		$("#shoot").click(function(evt) {handleAddAction('shoot')});
		
		for(var i in this.pendingActions) {
			$("#programmie").append("<a href=''>"+this.pendingActions[i]+"</a><br />");
		}
		
		$("#programmie").append("<br /><input type='button' value='done' id='donebutton' />");
		$("#donebutton").click(hideProgramming);
	}
	
	robot.prototype.deploy = function(slot) {
		this.sprite = new jaws.Sprite({x:20, y:20, scale: 1, anchor: "center"});
		
		var x = (this.color == 'red')?100-10:840+10;
		var angle = (this.color == 'red')?90:270;
		
		switch(slot) {
			case 0:
				this.sprite.x = x;
				this.sprite.y = 80-10;
				break;
			case 1:
				this.sprite.x = x;
				this.sprite.y = 240-10;
				break;
			case 2:
				this.sprite.x = x;
				this.sprite.y = 380-10;
				break;
		}
		this.sprite.angle = angle;
		this.animate();
		
		
		
		if (myColor == this.color) {
			thisDeployedBots[slot] = this;
		} else {
			thatDeployedBots[slot] = this;
		}
	}
	
	robot.prototype.animate = function() {
		switch(this.color) {
			case 'red':
				this.sprite.setImage( animate_red.next() );
				break;
			case 'blue':
				this.sprite.setImage( animate_blue.next() );
				break;
		}
	}
	
	robot.prototype.draw = function() {
		this.animate();
		this.sprite.draw();
	}
	
	robot.prototype.doAction = function(action) {
		console.log(action);
	}
	
	
	$("body").bind("data_in",function(evt,data) {
		console.log('1');
		console.log(data);
		if (!data)
			return;
		
		if (data.from == name) {
			thisPlayerMove = data;
		} else if (data.from) {
			thatPlayerMove = data;
		}
		
	});
	
	function hideProgramming() {
		$("#programmie").css({display:'none'});
	}
	
	
	function base(color) {
		this.health = 255;
		this.color = color;
	}
	
	base.prototype.draw = function(context) {
		
		switch(this.color) {
			case 'red':
				jaws.context.fillStyle = 'rgb('+this.health+',0,0)';
				jaws.context.fillRect(0,140,40,120);
				break;
			case 'blue':
				jaws.context.fillStyle = 'rgb(0,0,'+this.health+')';
				jaws.context.fillRect(900,140,40,120);
				break;
		}
	}
	
	var inited = false;
	
	var currentPlayStep = 0;
	
	var workingState = {
		setup: function() {
			animate_red  = new jaws.Animation({sprite_sheet: "/assets/images/robot_red_1.png", frame_size: [20,20], frame_duration: 100});
			animate_blue = new jaws.Animation({sprite_sheet: "/assets/images/robot_blue_1.png", frame_size: [20,20], frame_duration: 100});
			
			
			for(var i = 0; i<20; i++) {
				thisRobots[i] = new robot('red');
				thatRobots[i] = new robot('blue');
			}
			
			
			$("#makemove").click(function(){
				var data = {
					from: name,
					bots: {
						0:(thisDeployedBots[0])?thisDeployedBots[0].pendingActions:false,
						1:(thisDeployedBots[1])?thisDeployedBots[1].pendingActions:false,
						2:(thisDeployedBots[2])?thisDeployedBots[2].pendingActions:false
					}
				};
				socketAPI.sendData(data);
				thisPlayerMove = data;
				state = "moveSentWaiting";
				hideProgramming();
			});
		},
		update: function() {
			console.log(thisPlayerMove+' && '+thatPlayerMove);
			if (thisPlayerMove && thatPlayerMove) {
				state = "Playback";
				currentPlayStep = 0;
			}
			
			if (state == "Playback") {
				for (var i = 0; i < 3; i++) {
					if (thisPlayerMove.bots[i]) {
						if (thisPlayerMove.bots[i][currentPlayStep]) {
							thisDeployedBots[i].doAction(thisPlayerMove.bots[i][currentPlayStep]);
						}
					}
//					if (thatPlayerMove.bots[i]) {
//						if (thatPlayerMove.bots[i][currentPlayStep]) {
//							thatDeployedBots[i].doAction(thatPlayerMove.bots[i][currentPlayStep]);
//						}
//					}
				}
			}
			
		},
		draw: function() {
			jaws.clear();
			
			jaws.context.strokeStyle = 'rgb(0,0,0)';
			jaws.context.globalAlpha = 0.25;
			for(var x = 0;x<950; x+=20) {
				drawLine(jaws.context, x, 0, x, 500);
			}
			for(var y = 0;y<450; y+=20) {
				drawLine(jaws.context, 0, y, 950, y);
			}
			jaws.context.globalAlpha = 1;
			
			
			for(var i in thisDeployedBots) {
				thisDeployedBots[i].draw();
			}
			for(var i in thatDeployedBots) {
				thatDeployedBots[i].draw();
			}
			
			thisBase.draw(jaws.context);
			thatBase.draw(jaws.context);
			if (!inited) {
				$("#arena").animate({opacity:1},2);
				$("#controlSection").animate({opacity:1},2);
			}
		}
	};
	
	jaws.start(workingState, {fps: 1});
	
});



