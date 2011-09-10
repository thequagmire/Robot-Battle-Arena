var AudioBox = AudioBox || {};

(function() {
  
  var audioList = {shoot:'/assets/mp3/shoot.mp3',base_explode:'/assets/mp3/base_explode.mp3'};
  var audiochannels = [];

  function initAudio() {
    for(var i in audioList) {
      $('body').append('<audio id="multiaudio_'+i+'" src="'+audioList[i]+'" preload="auto"></audio>');
    }

	var channel_max = 10;
	for (a=0;a<channel_max;a++) {
		audiochannels[a] = new Array();
		audiochannels[a]['channel'] = new Audio();
		audiochannels[a]['finished'] = -1;
	}
  }
  AudioBox.play = function(soundName) {
    for (a=0;a<audiochannels.length;a++) {
      thistime = new Date();
      if (audiochannels[a]['finished'] < thistime.getTime()) {
        audiochannels[a]['finished'] = thistime.getTime() + 2000;
        audiochannels[a]['channel'].src = audioList[soundName];
        audiochannels[a]['channel'].load();
        audiochannels[a]['channel'].play();
        break;
      }
    }
  }
  $('document').ready(function(){
    
    initAudio();
    
  });
})();



