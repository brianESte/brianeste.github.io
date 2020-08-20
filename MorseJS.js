// this will be the JS file for the morse code page
//
// basic unit: dot
// dash-length: 3xdot
// char-space: 3xdot
// word-space: 7xdot

var level = 4;
var word;
var morseWord;

var hintDisplay = document.getElementById('msg-hint');
var inBox = document.getElementById('text-in');

var morseDict = {
	a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.",
	g: "--.", h: "....", i: "..", j: ".---", k: "-.-", l: ".-..",
	m: "--", n: "-.", o: "---", p: ".--.", q: "--.-", r: ".-.",
	s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-',
	y: '-.--', z: '--..',
	1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....',
	6: '-....', 7: '--...', 8: '---..', 9: '----.', 0: '-----'
};

var wordList0 = ['apple', 'banana', 'closet', 'example', 'mango', 'python', 'river'];
var bWords = ['beats', 'bistro', "bombs", "boxes", "break", "brick", "flick", "halls", "leaks", "shell", "slick", "strobe", "steak", "sting", "trick", "vector"]; 


function textToMorse(text){
	var morseText = morseDict[text[0]];
	for(i = 1; i < text.length; i++){
		morseText += ' ' + morseDict[text[i]];
	}
	return morseText;
}

function setWord(){
	switch(level){
		case 4:
			word = bWords[Math.floor(Math.random()*bWords.length)];
			break;
		default:
			word = wordList0[Math.floor(Math.random()*wordList0.length)];
	}
	morseWord = textToMorse(word);
	hintDisplay.innerText = morseWord;
	inBox.value = '';
}

function toggleHint(){
	var hintTog = document.getElementById('toggle-text');
	hintDisplay.style.display = (hintTog.checked) ? "inline" : "none";
	console.log('toggle Hint display');
}

function checkAnswer(){
	inBox.value = inBox.value.slice(0,-1);
	inBox.value = (inBox.value === word) ? 'Correct!! :)' : 'No... Try again.';
}


inBox.addEventListener('keyup', function(event){
	if(event.keyCode === 13){
		event.preventDefault();
		checkAnswer();
	}
});

setWord();
