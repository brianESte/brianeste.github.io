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
var bArry;
var pos = 0;

var lvlSlider = document.getElementById('lvl-slider');
var hintDisplay = document.getElementById('msg-hint');
var inBox = document.getElementById('text-in');
var blinker = document.getElementById('blinker');

// Settings variables
var level = 0;
var wpm = 1;
var farnsworth = 1;
var baseT = 1200;	// [milliseconds]
var rxIntID = 0;

// Tone settings/vars
var audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
// different browsers use different methods.. all named similarly, though.
var oscOn = false;	// so that the oscillator is only started once.	
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

var wordList0 = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
var wordList4 = ['apple', 'banana', 'closet', 'example', 'mango', 'python', 'river'];
var bWords = ['beats', 'bistro', "bombs", "boxes", "break", "brick", "flick", "halls", "leaks", "shell", "slick", "strobe", "steak", "sting", "trick", "vector"]; 


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

function setWord(){
	switch(Number(level)){
		case 5:
			word = bWords[Math.floor(Math.random()*bWords.length)];
			break;
		case 4:
			word = wordList4[Math.floor(Math.random()*wordList4.length)];
			break;
		default:
			word = wordList0[Math.floor(Math.random()*wordList0.length)];
	}
	if(hasTouch){	setOptions()	}
	else{	inBox.value = ''}

	morseWord = textToMorse(word);
	hintDisplay.innerText = morseWord;
	document.getElementById('answer').innerHTML = '';	
	document.getElementById('prompt').innerHTML = '';
	bArry = morseToOnOff(morseWord);
}

function setOptions(){
	var wordDict = [];
	switch(Number(level)){
		case 5:
			wordDict = bWords.slice();
			break;
		case 4:
			wordDict = wordList4.slice();
			break;
		default:
			wordDict = wordList0.slice();
	}
	var buttons = document.getElementsByClassName('button');
	for (var i=0; i < buttons.length; i++){
		buttons[i].innerHTML = wordDict.splice(Math.floor(Math.random()*wordDict.length),1)[0].toUpperCase();
	}
	var needAns = true;
	for (var i=0; i < buttons.length; i++){
		if(buttons[i].innerHTML === word.toUpperCase()){
			needAns = false;
			break;
		}
	}
	if(needAns){buttons[Math.floor(Math.random()*buttons.length)].innerHTML = word.toUpperCase()}
}

function toggleAudio(){
	if(!oscOn){	
		oscillator.start();
		oscOn = true;
	}
	if(document.getElementById('toggle-audio').checked){
		document.getElementById('audio-sym').classList.add('audio-on');
	}else{
		document.getElementById('audio-sym').classList.remove('audio-on');
	}		
}

function toggleHint(){
	var hintTog = document.getElementById('toggle-text');
	hintDisplay.style.display = (hintTog.checked) ? "inline" : "none";
	console.log('toggle Hint display');
}

function checkAnswer(){
	inBox.value = inBox.value.slice(0,-1).toLowerCase();
	document.getElementById('prompt').innerHTML = (inBox.value === word) ? 'Correct!! :)' : 'No... Try again.';
}
function checkWord(it){
	document.getElementById('prompt').innerHTML = (it.innerHTML === word) ? 'Correct!! :)' : 'No... Try again.';
}
function updateLvl(){
	level = lvlSlider.value;
	document.getElementById('lvl-disp').innerHTML = level;
	console.log('level now: '+level);
}

function updateWPM(){
	wpm = document.getElementById('wpm-slider').value;
	document.getElementById('wpm-disp').innerHTML = wpm;
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
	if(bArry[pos]){	
		if(document.getElementById('toggle-audio').checked){	beepOn()	}
		blinker.style.background = 'red'
	}	else {
		blinker.style.background = 'black';	
		beepOff();
	}
	pos = (pos >= bArry.length) ? 0 : pos + 1;
}

inBox.addEventListener('keyup', function(event){
	if(event.keyCode === 13){
		event.preventDefault();
		checkAnswer();
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

updateLvl();
updateWPM();
updateFwth();
setWord();

var uagent = navigator.userAgent;
document.getElementById('uagent-info').innerHTML = uagent;
document.getElementById('touch-info').innerHTML = hasTouch;

