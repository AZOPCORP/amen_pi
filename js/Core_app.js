window.onload = init;


var context = null;
var isPlaying = false;
var isRecording = false;
var isFilter = false;
var isCrusher = false;
var startTime;
var currentStep;
var tempo = 180.0;
var lookahead = 25.0;
var scheduleAheadTime = 0.1;
var nextNoteTime = 0.0;
var noteResolution = 0;
var noteLength = 0.05;
var intervalID = 0;
var notesInQueue = [];
var volumeNode;
var volumeVal = 0.50;
var myString;
var myArray;
var SampleName;
var samplerate;
var bit = 8;
var reduction = 0.5;
var Presentstatus;
var meter = null;
var canvasContext = null;
var WIDTH = 50;
var HEIGHT = 500;
var rafID = null;
var startTime;
var truc;
var bitcrusher;
var analyser;
var recorder;
var filter;
var PresentPosition = 0;
var amenPitch = 1.0;
var timerID;
var scope;
var rec_i=0; 


var kit = ["0","3","9","0","2","1","7","9","1","2"];

var sounds = {
    _00: {
        src: './amen/00.wav'
    },
    _01: {
        src: './amen/01.wav'
    },
    _02: {
        src: './amen/02.wav'
    },
    _03: {
        src: './amen/03.wav'
    },
    _04: {
        src: './amen/04.wav'
    },
    _05: {
        src: './amen/05.wav'
    },
    _06: {
        src: './amen/06.wav'
    },
    _07: {
        src: './amen/07.wav'
    },
    _08: {
        src: './amen/08.wav'
    },
    _09: {
        src: './amen/09.wav'
    },
};



function setTempo(val) {

    tempo = val;
    $("#tempostatus").html(val + "BPM");

}

function setSampleRate(val) {

    samplerate = val;
    $("#Sratestatus").html(val);

}

function setVolume(value) {
    num = parseFloat(value);
    volumeVal = num.toFixed(2);
    $("#volumestatus").html(volumeVal);
}

function setPitch(val) {
    amenPitch = val;
    $("#pitchstatus").html(val);
}

function setBits(val){
    bitcrusher.bits = val;
$("#bitsstatus").html(val.toFixed(1));
}
function setReduction(val){

    bitcrusher.reduction = val;
    $("#reductionstatus").html(val.toFixed(1));

}
function setCutoff(val){
filter.frequency.value = val;
 $("#cutoffstatus").html(val + " Hz"); 
}


function setQ(val){
    filter.Q.value = val;
     $("#Qstatus").html(val);

}
function setBoost(val){
    filter.gain.value = val;
    $("#booststatus").html(val + "DB");
}

function selectFilter(val){


$("#Filtertypestatus").html(val);
   switch(val){
    case 1:
        $("#Filtertypestatus").html("lowpass");
        filter.type = "lowpass";
        break;
    case 2:
        $("#Filtertypestatus").html("highpass");
         filter.type = "highpass";
        break;
    case 3:
        $("#Filtertypestatus").html("bandpass");
         filter.type = "bandpass";
        break;
    case 4:
        $("#Filtertypestatus").html("lowshelf");
         filter.type = "lowshelf";
        break;
    case 5:
        $("#Filtertypestatus").html("highshelf");
         filter.type = 4;
        break;
    case 6:
        $("#Filtertypestatus").html("peaking");
         filter.type = "highshelf";
        break;
    case 7:
        $("#Filtertypestatus").html("notch");
         filter.type = "notch";
        break;
    case 8:
        $("#Filtertypestatus").html("allpass");
         filter.type = "allpass";
        break;
    default:
    $("#Filtertypestatus").html("lowpass");
     filter.type = 0;
       break;

    }


}

function filterSwitch(){
isFilter = !isFilter;

 if (isFilter) {
        PreGain.disconnect();
        PreGain.connect(filter);
        filter.connect(volumeNode);
        $("#filter_switch").html('OFF');
        $("#filter_led").html('<span class="on">x</span>');
     

        return "f_off";
    } else {
     
        $("#filter_switch").html('ON');
        $("#filter_led").html('<span class="off">x</span>');
        PreGain.disconnect();
        filter.disconnect();
        PreGain.connect(volumeNode);
        return "f_on";
    }

}

function crusherSwitch(){
isCrusher = !isCrusher;

 if (isCrusher) {
        volumeNode.disconnect();
        volumeNode.connect(bitcrusher.input);
        bitcrusher.connect(compressor);
        $("#crusher_switch").html('OFF');
        $("#bitcrusher_led").html('<span class="on">x</span>');
     

        return "c_off";
    } else {
     
        $("#crusher_switch").html('ON');
        $("#bitcrusher_led").html('<span class="off">x</span>');
        volumeNode.disconnect();
        bitcrusher.disconnect();
        volumeNode.connect(compressor);
        return "c_on";
    }

}



function nextStep() {
    
    var secondsPerBeat = 60.0 / tempo; 
   
    nextNoteTime += 0.25 * secondsPerBeat; 

    current16thNote++; 
    if (current16thNote == 16) {
        current16thNote = 0;
    }
}

function scheduleStep(beatNumber, time) {
    notesInQueue.push({
        note: beatNumber,
        time: time
    });

    if ((noteResolution == 1) && (beatNumber % 2))
        return;
    if ((noteResolution == 2) && (beatNumber % 4))
        return;

    trigger();
}

function scheduler() {
    while (nextNoteTime < context.currentTime + scheduleAheadTime) {
        scheduleStep(current16thNote, nextNoteTime);
        nextStep();
    }
    timerID = window.setTimeout(scheduler, lookahead);
}

function play() {
 
    isPlaying = !isPlaying;



    if (isPlaying) {
        current16thNote = 0;
        nextNoteTime = context.currentTime;
        scheduler();
        $("#Play_amen").html('PAUSE');
        $("#play_led").html('<span class="on">x</span>');

        return "stop";
    } else {
        window.clearTimeout(timerID);
        $("#Play_amen").html('PLAY');
         $("#play_led").html('<span class="off">x</span>');
        return "play";
    }
}





function init() {
    

  
    fillplaylist();
     vu = document.createElement('canvas');
    canvasContext = vu.getContext("2d");
    canvasContext2 = document.getElementById("vizu").getContext("2d");

   scope = document.createElement('canvas');
   scopeCtx = scope.getContext('2d');

    window.AudioContext = window.AudioContext ||
        window.webkitAudioContext;
    context = new AudioContext();

  
    volumeNode = context.createGain();
    PreGain = context.createGain();
    PreGain.connect(volumeNode);

    filter = context.createBiquadFilter();
    compressor = context.createDynamicsCompressor();
    bitcrusher = new Crusher(context,bit,reduction);

    compressor.connect(context.destination);
    volumeNode.connect(compressor);
  
    meter = createAudioMeter(context);

    recorder = new Recorder(compressor);

    analyser = context.createAnalyser();
    analyser.fftSize = 512;
    compressor.connect(meter);
    compressor.connect(analyser);
    
    drawLoop();
 

    loadSounds(sounds);
 

   
     
}




function fillplaylist() {
    myString = $("#Pi_Pattern").text();

    myArray = [];
    for (var i = 0; i < myString.length; i++) {
        myArray.push(myString[i]);
    }

}




function loadSoundObj(obj) {
    var request = new XMLHttpRequest();
    request.open('GET', obj.src, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            obj.buffer = buffer;
        }, function(err) {
            throw new Error(err);
            console.log('error loading sample');
        });
    }

    request.send();
}


function loadSounds(obj) {
    var len = obj.length,
        i;
    for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            loadSoundObj(obj[i]);
        }
    }
}


function playSound(buffer, time) {


    volumeNode.gain.value = volumeVal;
    var source = context.createBufferSource();
    source.buffer = buffer.buffer;
    source.playbackRate.value = amenPitch;

    source.connect(PreGain);
    source.start(time);
}


function drawLoop(time) {

    
    canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
    drawvu();
    drawScope(analyser, scopeCtx);
    drawtoCanvas();

     
   
   
    rafID = window.requestAnimationFrame(drawLoop);
}

function drawtoCanvas(){

var x = 55 ;
var y = 160 ;
var txtsize = (meter.volume * HEIGHT * 1.4);

    canvasContext2.clearRect(0, 0, 250, 250);
  
   canvasContext2.fillStyle = "#0F0";
   canvasContext2.font= txtsize+'px "Press Start 2P"';
   canvasContext2.globalCompositeOperation = "destination-over";
   canvasContext2.lineWidth = 1;
   canvasContext2.strokeStyle = '#0f0';

   canvasContext2.strokeText(myArray[PresentPosition],x,y);
   canvasContext2.font="10pt 'Press Start 2P'";
   canvasContext2.drawImage(scope,51,0);
   canvasContext2.fillText("chop:"+Presentstatus,51,180);
   canvasContext2.globalCompositeOperation = "lighter";
   canvasContext2.font="10pt 'Press Start 2P'";
   canvasContext2.fillText("beat:"+PresentPosition,51,190);
   canvasContext2.drawImage(vu,0,50) ;
    
}
function drawvu(){

     if (meter.checkClipping())
       canvasContext.fillStyle = "#0F0";
    else
        canvasContext.fillStyle = "#050";
    canvasContext.fillRect(0, 250, WIDTH, -(meter.volume * HEIGHT * 1.6));
}


function drawScope(analyser, ctx) {
  var width = ctx.canvas.width;
  var height = ctx.canvas.height;
  var timeData = new Uint8Array(analyser.frequencyBinCount);
  var scaling = height / 512;
  var risingEdge = 0;
  var edgeThreshold = 15;

  analyser.getByteTimeDomainData(timeData);

  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  ctx.fillRect(0, 0, width, height);

  ctx.lineWidth = 5;
  ctx.strokeStyle = '#0F0';
  ctx.beginPath();


  while (timeData[risingEdge++] - 128 > 0 && risingEdge <= width);
  if (risingEdge >= width) risingEdge = 0;

  while (timeData[risingEdge++] - 128 < edgeThreshold && risingEdge <= width);
  if (risingEdge >= width) risingEdge = 0;

  for (var x = risingEdge; x < timeData.length && x - risingEdge < width; x++)
    ctx.lineTo(x - risingEdge, height - timeData[x] * scaling);

  ctx.stroke();
}


function kitexchanger(curPinumber) {

    switch (curPinumber) {
        case '0':
            return kit[0];

            break;
        case '1':
            return kit[1];
            break;
        case '2':
            return kit[2];
            break;
        case '3':
            return kit[3];
            break;
        case '4':
            return kit[4];
            break;
        case '5':
            return kit[5];
            break;
        case '6':
            return kit[6];
            break;
        case '7':
            return kit[7];
            break;
        case '8':
            return kit[8];
            break;
        case '9':
            return kit[9];
            break;
    }

}


function getSampleNameFromArray(arrayStatus) {

    switch (arrayStatus) {
        case '0':
            truc = sounds._00;

            break;
        case '1':
            truc = sounds._01;
            break;
        case '2':
            truc = sounds._02;
            break;
        case '3':
            truc = sounds._03;
            break;
        case '4':
            truc = sounds._04;
            break;
        case '5':
            truc = sounds._05;
            break;
        case '6':
            truc = sounds._06;
            break;
        case '7':
            truc = sounds._07;
            break;
        case '8':
            truc = sounds._08;
            break;
        case '9':
            truc = sounds._09;
            break;
    }

}
function getSampleObject(arrayStatus) {

    switch (arrayStatus) {
        case '0':
            return sounds._00;

            break;
        case '1':
            return sounds._01;
            break;
        case '2':
            return sounds._02;
            break;
        case '3':
            return sounds._03;
            break;
        case '4':
            return sounds._04;
            break;
        case '5':
            return sounds._05;
            break;
        case '6':
            return sounds._06;
            break;
        case '7':
            return sounds._07;
            break;
        case '8':
            return sounds._08;
            break;
        case '9':
            return sounds._09;
            break;
    }

}

function trigger() {

    if (PresentPosition <= myArray.length-1) {
        Presentstatus = kitexchanger(myArray[PresentPosition]);
        getSampleNameFromArray(Presentstatus);
      
       
        playSound(truc, 0);
          highlightCurrentNumber(PresentPosition);
     
    
        PresentPosition ++;

    } else {
        PresentPosition = 0;
        $('#Pi_Pattern').text(myString);
    }


}

function highlightCurrentNumber(index){

  var data = $('#Pi_Pattern').text().trim();
if (PresentPosition <= myArray.length) {
   var x =[];

   var  tr = data.setCharAt(index,"X" );
   var restore = data.setCharAt(index-1,myString.charAt(index-1)) ;
     $('#Pi_Pattern').text(tr);


       } else {
      var data =  myString;
    }



}

String.prototype.setCharAt = function(idx, chr) {
if(idx > this.length - 1){
return this.toString();
} else {
return this.substr(0, idx) + chr + this.substr(idx + 1);
}
};


function record(){
  
     isRecording = !isRecording;

    if (isRecording ) {
         startRecording();
        $("#Record_amen").html('STOP.');
        $("#record_led").html('<span class="on">x</span>');

        return "stop";
    } else {
       stopRecording();
        $("#Record_amen").html('REC.');
        $("#record_led").html('<span class="off">x</span>');
        return "rec";
    }


}


function startRecording() {
    recorder && recorder.record();
   

  }

  function stopRecording() {
    recorder && recorder.stop();

    createDownloadLink();
    
    recorder.clear();
  }

  function createDownloadLink() {
    recorder && recorder.exportWAV(function(blob) {
   var url = URL.createObjectURL(blob);
      var li = document.createElement('li');

  
      var hf = document.createElement('a');
      
  
      hf.href = url;
      hf.download = 'AMEN_REC_'+rec_i+'.wav';
      rec_i++;
      hf.innerHTML =' <img class="dl_img" src="./img/dl_icon.svg" alt="'+hf.download+'"/>';
      li.setAttribute("class", "download_link");
      li.appendChild(hf);
      recordingslist.appendChild(li);

    });
  }





