// this will be the JS file for the morse code page
//
// basic unit: dot
// dash-length: 3xdot
// char-space: 3xdot
// word-space: 7xdot

// check if the device has touch capability
var hasTouch = 'ontouchstart' in window || 'onmsgesturechange' in window;

var word;
var morseWord;
var bitArry;
var pos = 0;

var lvlSlider = document.getElementById('lvl-slider');
var hintDisplay = document.getElementById('msg-hint');
var inBox = document.getElementById('text-in');
//var blinker = document.getElementById('blinker');
var light = document.getElementById("light");

// Settings variables
var level = 0;
var wpm = 10;
var farnsworth = 1;
var baseT = 1200;	// [milliseconds]
var rxIntID = 0;
var audioOn = false;
var blinkOn = false;
var textHintOn = false;

// Tone settings/vars
var audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
// different browsers use different methods.. all named similarly, though.
var oscOn = false;			// so that the oscillator is only started once.	
var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();

oscillator.connect(gainNode);	// connect Osc to the gain
gainNode.connect(audioCtx.destination);	// connect Gain to the 'destination'
// default freq is 440, vol: 1

// a text to morse dictionary object.
var morseDict = {
	A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
	G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
	M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
	S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
	Y: '-.--', Z: '--..',
	1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....',
	6: '-....', 7: '--...', 8: '---..', 9: '----.', 0: '-----'
};

var wordLists =[['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
				['this', 'level', 'needs', 'more', 'words'],
				['this', 'level', 'needs', 'more', 'words'],
				['this', 'level', 'needs', 'more', 'words'],
				['APPLE', 'BANANA', 'CLOSET', 'EXAMPLE', 'MANGO', 'PYTHON', 'RIVER'],
				['BEATS', 'BISTRO', "BOMBS", "BOXES", "BREAK", "BRICK", "FLICK", "HALLS", 
				 "LEAKS", "SHELL", "SLICK", "STROBE", "STEAK", "STING", "TRICK", "VECTOR"],	// lvl 5
				['Pokemon', 'Halloween', 'this', 'level', 'needs', 'more', 'words'],
				['this', 'level', 'needs', 'more', 'words'],
				['this', 'level', 'needs', 'more', 'words'],
				['this', 'level', 'needs', 'more', 'words'],
				['this', 'level', 'needs', 'more', 'words']]; 


function textToMorse(text){
	var morseText = morseDict[text[0].toUpperCase()];
	for(i = 1; i < text.length; i++){
		morseText += ' ' + morseDict[text[i].toUpperCase()];
	}
	return morseText;
}

let morseToOnOff = mWord => {
	var onOff = [];
	for(let i = 0; i < mWord.length; i++){
		if(mWord[i] == '.'){ onOff.push(1,0) }	// if a .: 10
		else if(mWord[i] == '-'){ onOff.push(1,1,1,0) } // if a -: 1110
		else if(mWord[i] == ' '){ onOff.push(0,0)}	// if a ' ': 00
	}
	onOff.push(0,0,0,0,0,0);
	return onOff
}

// this function needs to be cleaned up and improved once the wordLists are complete,
// or a suitable word gen system/function is created
function setWord(){
	// grab the level approprate wordList
	var wordList = wordLists[Number(level)];
	// pick a random word from the chosen wordList
	word = wordList[Math.floor(Math.random()*wordList.length)];
	
	if(hasTouch){	setOptions()	}	// if the device has a touchscreen, set the options
	else{	inBox.value = ''}

	morseWord = textToMorse(word);
	if(textHintOn){	hintDisplay.innerText = morseWord;	}
	document.getElementById('answer').innerHTML = '';	
	document.getElementById('prompt').innerHTML = '';
	bitArry = morseToOnOff(morseWord);
}

function setOptions(){
	// grab the level appropriate wordList
	var wordDict = wordLists[Number(level)].slice();
	
	var buttons = document.getElementsByClassName('button');
	for (var i=0; i < buttons.length; i++){
		// splice out an array of len = 1 containing a random word
		// convert it to uppercase then store it in the current button
		buttons[i].innerHTML = wordDict.splice(Math.floor(Math.random()*wordDict.length),1)[0].toUpperCase();
	}
	var needAns = true;	
	// check if correct answer was not randomly added to the option set...
	for (var i=0; i < buttons.length; i++){
		if(buttons[i].innerHTML === word.toUpperCase()){
			needAns = false;
			break;
		}
	}
	// if correct answer was not already added to list, then add it
	if(needAns){
		buttons[Math.floor(Math.random()*buttons.length)].innerHTML = word.toUpperCase()
	}
}

function tuneLvl(it){
	level = it.innerHTML;
	var ptr = it.parentNode.getElementsByClassName("radio-pointer")[0];
	ptr.style.transform = "rotate("+ level*26 +"deg)";
	console.log('level now: '+level);
}
function tuneWPM(it){
	wpm = it.innerHTML;
	var ptr = it.parentNode.getElementsByClassName("radio-pointer")[0];
	ptr.style.transform = "rotate("+ (wpm-1)*12 +"deg)";
	updateWPM();
}

/*function toggleAudio(){
	if(!oscOn){	
		oscillator.start();
		oscOn = true;
	}
}*/

function toggle(it,select){
	var position;
	switch(select){
		case 1:
			audioOn = !audioOn;
			position = audioOn;
			// start oscillator:
			if(!oscOn){	
				oscillator.start();
				oscOn = true;
			}
			break;
		case 2:
			blinkOn = !blinkOn;
			position = blinkOn;
			break;
		case 3:
			textHintOn = !textHintOn;
			position = textHintOn;
			toggleHint(textHintOn);
			break;
		default:
			console.log("invalid switch selector");
	}
	var switchShaft = it.parentNode.getElementsByClassName("switch-shaft")[0];
	var angle = (position) ? 180 : 0;
	switchShaft.style.transform = "rotateY("+ angle +"deg)";
	var switchBall = it.parentNode.getElementsByClassName("switch-ball")[0];
	var pos = (position) ? 64 : 0;
	switchBall.style.transform = "translateX("+ pos +"px)";
}

function toggleHint(hintOn){
	if(hintOn == null){
		hintOn = document.getElementById('toggle-text')
	}
	hintDisplay.innerText = (hintOn) ? morseWord : "";
	//hintDisplay.style.display = (hintTog.checked) ? "inline" : "none";
	console.log('toggle Hint display');
}

// this function is not yet used apparently..
function checkWord(it){
	var ans = word.toUpperCase();
	document.getElementById('prompt').innerHTML = (it.innerHTML === ans) ? 'Correct!! :)' : 'No... Try again.';
}
function updateLvl(){
	level = lvlSlider.value;
	document.getElementById('lvl-disp').innerHTML = level;
	console.log('level now: '+level);
}

function updateWPM(){
	//wpm = document.getElementById('wpm-slider').value;
	//document.getElementById('wpm-disp').innerHTML = wpm;
	baseT = 1200/Number(wpm);
	clearInterval(rxIntID);
	rxIntID = setInterval(rxMorse, baseT);
	console.log('speed now: '+wpm);
}

function updateFwth(){
	farnsworth = document.getElementById('Farnsworth-slider').value;
	document.getElementById('fwth-disp').innerHTML = farnsworth;
	console.log('Farnsworth now: '+farnsworth);
}

function showAnswer(){
	document.getElementById('answer').innerHTML = word;	
}

function beepOn(){
	if(!gainNode.gain.value){	gainNode.gain.value = 1	}
}
function beepOff(){
	if(gainNode.gain.value){	gainNode.gain.value = 0	}
}

function rxMorse(){
	if(bitArry[pos]){
		// document.getElementById('toggle-audio').checked
		if(audioOn){	beepOn()	}
		if(blinkOn){	
			//blinker.style.background = 'red';
			light.setAttribute("fill", "url(#light-on)");
			light.setAttribute("stroke", "none")
		}
	}	else {
		// set light to "off" appearance
		//blinker.style.background = 'black';
		light.setAttribute("fill", "#aa0000");
		light.setAttribute("stroke", "#440000");
		beepOff();
	}
	pos = (pos >= bitArry.length) ? 0 : pos + 1;
}

inBox.addEventListener('keyup', function(event){
	if(event.keyCode === 13){
		event.preventDefault();	// what does this do...?
		// check the answer provided...
		var guess = inBox.value.slice(0,-1).toUpperCase();
		var ans = word.toUpperCase();
		document.getElementById('prompt').innerHTML = (guess === ans) ? 'Correct!! :)' : 'No... Try again.';
	}
});

if(hasTouch){ // if the device has touch, swap keyboard/textarea for buttons
	var elsNoTouch = document.getElementsByClassName('ntouch');
	for(var i=0; i<elsNoTouch.length; i++){
		elsNoTouch[i].style.display = 'none';
	}
	var elsTouch = document.getElementsByClassName('touch');
	for(var i=0; i< elsTouch.length; i++){
		elsTouch[i].style.display = 'block';
	}
}

//updateLvl();
updateWPM();
//updateFwth();
setWord();

var uagent = navigator.userAgent;
//document.getElementById('uagent-info').innerHTML = uagent;
//document.getElementById('touch-info').innerHTML = hasTouch;

