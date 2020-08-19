// this will be the JS file for the morse code page
//
//

var level = 0;

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

	var morseWord = textToMorse(word);
	var hintDisplay = document.getElementById('msg-hint');
	hintDisplay.innerText = morseWord;
}

setWord();
