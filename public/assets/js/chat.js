var chatCommands = chatCommands || {};

$('document').ready(function() {
	chatCommands.challenge = function(param) {
		if (room == 'lobby') {
			if (param == name) {
				$('#chat_conversation_display').append("You can't challenge yourself.<br />");
				$('#message').val('');
				return false;
			}
			var inRoom = false;
			
			$('#users_list_display a').each(function(idx,item) {
				if (item.innerHTML == param) {
					$(item).trigger("click");
					inRoom = true;
				}
			});
			
			if (!inRoom) {
				$('#chat_conversation_display').append(param+' is not in the room.<br />');
			}
		}
	}
	chatCommands.clear = function() {
		$('#chat_conversation_display').html('');
		$('#game_chat_conversation_display').html('');
		$('#message').val('');
		$('#game_message').val('');
	}
});
	
	
	
$('document').ready(function() {
	var socketAPI = socketAPI || {};
	
	// Setup socketAPI
	(function() {
		var socket = io.connect('http://localhost:3030');
		
		socket.on('welcome', function (data) {
			if (data.next == 'checkin') {
				var msg = {
					 type : 'checkin'
					,room : room
					,name : name
					,email: email
				};
				
				socket.send(JSON.stringify(msg));
			}
		});
		
		socket.on('roomlist',function(data) {
			$('#users_list_display').html('');
			for (var i in data) {
				if (data[i].name != name) {
					if (room == 'lobby')
						$('#users_list_display').append('<a href="javascript:;" id="id_'+data[i].id+'">'+data[i].name+'</a><br />');
					else
						$('#users_list_display').append(data[i].name+'<br />');
				} else {
					$('#users_list_display').append('<span class="user_list_self">'+data[i].name+'</span><br />');
				}
			}
		});
		
		socket.on('chat',function(data) {
			var who = (data.from == name)?'self':'other';
			
			if ($('#chat_conversation_display')[0]) {
				$('#chat_conversation_display').append('<em class="'+who+'">'+data.from+':</em> '+data.value+'<br />');
				$('#chat_conversation_display')[0].scrollTop = $('#chat_conversation_display')[0].scrollHeight - $('#chat_conversation_display').outerHeight();
			}
			
			if ($('#game_chat_conversation_display')[0]) {
				$('#game_chat_conversation_display').append('<em class="'+who+'">'+data.from+':</em> '+data.value+'<br />');
				$('#game_chat_conversation_display')[0].scrollTop = $('#game_chat_conversation_display')[0].scrollHeight - $('#game_chat_conversation_display').outerHeight();
			}
		});
		
		socket.on('data',function(data) {
			delete(data.type);
			$('body').trigger('data_in',data);
		});
		
		
		socket.on('left',function(data) {
			if (data.name != name) {
				$('#chat_conversation_display').append(data.name+' left the room.<br />');
			}
			$('body').trigger('left',data);
		});
		
		socket.on('join',function(data) {
			if (data.name != name) {
				$('#chat_conversation_display').append(data.name+' joined the room.<br />');
			}
			$('body').trigger('join',data);
		});
		
		
		socketAPI.sendData = function(data) {
			data.type = data.type || 'data';
			socket.send(JSON.stringify(data));
		}
	})();
	
	
	
	
	
	
	
	
	// This needs to be modularized
	$('body').bind('data_in',function(evt, data) {
		if (room == 'lobby') {
			if (data.challengee == name && data.response) {
				return;
			}
			if (data.response == 'yes') {
				$("#challenge_popin").bPopup().close();
				setTimeout(function() {
					top.location.href = "/room/"+data.roomName+"/blue";
				},500);
				
			} else if (data.response == 'no') {
				$("#challenge_details").html('');
				$("#challenge_actions").html('');
				var challenge_message = '<br /><br />'+data.challengee+' declined your challenge!<br/><br /><br />';
				$("#challenge_details").append(challenge_message);
				$("#challenge_actions").append('<br /><br /><button id="ok_challenge">Ok</button>');
				
				// cancelling/declining the challenge
				$("#ok_challenge").bind('click', function(evt){
					$("#challenge_popin").bPopup().close();
					$("#challenge_details").html('');
					$("#challenge_actions").html('');
				});
			} else if (data.challengee == name) {
				$("#challenge_details").html('');
				$("#challenge_actions").html('');
				var challenge_message = '<br /><br />'+data.challenger+' would like to challenge you. Accept?<br/><br /><br />';
				$("#challenge_details").append(challenge_message);
				$("#challenge_actions").append('<br /><br /><button id="accept_challenge">Accept</button><button id="cancel">Decline</button>');
				
				$("#challenge_popin").bPopup({modalClose:false});
				
				// cancelling/declining the challenge
				$("#cancel").bind('click', function(evt){
					$("#challenge_popin").bPopup().close();
					$("#challenge_details").html('');
					$("#challenge_actions").html('');
					data.response = 'no';
					socketAPI.sendData(data);
				});
				
				$("#accept_challenge").bind('click', function(){
					$("#challenge_popin").bPopup().close();
					$("#challenge_details").html('');
					$("#challenge_actions").html('');
					data.response = 'yes';
					socketAPI.sendData(data);
					setTimeout(function() {
						top.location.href = "/room/"+data.roomName+"/red";
					},500);
				});
			}
		} else { // non lobby actions
			
		}
	});
	
	
	$('#users_list_display').delegate('a','click',function(evt) {
		var otherName = $(evt.target).html();
		$("#challenge_details").html('');
		$("#challenge_actions").html('');
		var challenge_message = '<br /><br />Would you like to challenge <br/>'+$(evt.target).html()+'?<br /><br />';
		$("#challenge_details").append(challenge_message);
		$("#challenge_actions").append('<br /><br /><button id="accept_challenge">Yes</button><button id="cancel">No</button>');
      	
		$("#challenge_popin").bPopup({modalClose:false});
		
		// cancelling/declining the challenge
		$("#cancel").bind('click', function(evt){
			$("#challenge_popin").bPopup().close();
			$("#challenge_details").html('');
			$("#challenge_actions").html('');
		});
		
		$("#accept_challenge").bind('click', function(){
			$("#challenge_actions").html('');
			$("#challenge_actions").append('<br /><br />waiting for response...');
			socketAPI.sendData({
				challenger:name,
				challengee:otherName,
				response:false
			});
		});
	});
	
	
	
	$('#chat_form').bind("submit",function() {
		var val = $('#message').val();
		if (!val)
			val = $('#game_message').val();
		
		
		$('#message').val('');
		
		// parse chat command
		if (val.substr(0,1) == '/') {
			val += ' ';
			var cmd = val.substr(1,val.search(/\s/)-1);
			if (chatCommands[cmd]) {
				var param = val.substr(val.search(/\s/)+1).trim();
				var shouldContinue = chatCommands[cmd](param);
				return;
			} else {
				$('#chat_conversation_display').append('Invalid command "/'+cmd+'"<br />');
				return;
			}
		}
		
		
		var msg = {
			 type : 'chat'
			,from : name
			,value: val
		};
		socketAPI.sendData(msg);
		$('#message').val('');
		$('#game_message').val('');
		return false;
	});
});
