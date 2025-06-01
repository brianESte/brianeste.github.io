// morse_code.js
//
// basic unit: dot
// dash-length: 3xdot
// char-space: 3xdot
// word-space: 7xdot

// check if the device has touch capability
var hasTouch = 'ontouchstart' in window || 'onmsgesturechange' in window;

var message;
var msg_morse_str;
var morse_line_code = [];
var pos = 0;

const audio_sw = $("#audio_sw");
const blinker_sw = $("#blinker_sw");
const light = $("#light");
const hint_sw = $("#text_hint_sw");
const hint_display = $("#msg-hint");

// Settings variables
var level = 0;
var wpm = 10;
var farnsworth = 1;
var baseT = 1200;	// [milliseconds]
var rxIntID = 0;
var blinkOn = false;

// Tone settings/vars
var oscOn = false;			// so that the oscillator is only started once.	
var audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
// different browsers use different methods.. all named similarly, though.
var oscillator = new OscillatorNode(audioCtx);
// default freq is 440 Hz
var gainNode = new GainNode(audioCtx, { gain: 0 });
oscillator.connect(gainNode);	// connect oscillator node to gain node
gainNode.connect(audioCtx.destination);	// connect Gain to the 'destination'

// a text to morse dictionary object.
var morse_dict = {
	A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
	G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
	M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
	S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
	Y: '-.--', Z: '--..',
	1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....',
	6: '-....', 7: '--...', 8: '---..', 9: '----.', 0: '-----'
};

var morse_timing = {
	'.': [1],
	'-': [1, 1, 1],
	' ': [0, 0, 0]
};

var msg_lists = [
	['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
	["AM", "AS", "AT", "BE", "BY", "GO", "HE", "IF", "IT", "LO", "NO", "OK", "OR", "TO", "UP", "WE"],
	["AWK", "BOX", "END", "FUN", "JOB", "LOG", "MAP", "MAR", "RED", "RUN", "SET", "TAX", "TOP", "VIA", "WAR"],
	["AREA", "BOTH", "DATA", "FIND", "GREP", "INFO", "LONG", "MUST", "PART", "POST", "THIS", "USER", "WORK"],
	["APPLE", "BANANA", "CLOSET", "EXAMPLE", "MANGO", "PYTHON", "RIVER"],
	["BEATS", "BISTRO", "BOMBS", "BOXES", "BREAK", "BRICK", "FLICK", "HALLS", "LEAKS", "SHELL", "SLICK", "STROBE", "STEAK", "STING", "TRICK", "VECTOR"],	// lvl 5
	["ABRUPT", "ALPACA", "BADGER", "DURING", "GARDEN", "MARKET", "MEMBER", "NUMBER", "PERIOD", "PERSON", "RETURN", "SELECT", "STATUS", "TRAVEL", "UNITED", "WITHIN"],
	["ARBITER", "BOLLARD", "DIGITAL", "EMERALD", "ENCHANT", "FEDERAL", "FURTHER", "HOSTING", "LIMITED", "NATURAL", "NETWORK", "PROBLEM", "PRODUCT", "SIMILAR", "STUDENT"],
	["ALTRUISM", "ANALYSIS", "BASILISK", "COMPUTER", "ELDRITCH", "FAMILIAL", "FRESHMAN", "FORESTED", "JUNKYARD", "LINOLEUM", "LONGHORN", "MASTHEAD", "TOGETHER"],
	["F3LD5P4R", "F0R357RY", "H4Z3LNU7", "1NDU57RY", "1NV3N70R", "J0Y571CK", "K1L06R4M", "M4T3R14L", "M473RN4L", "M0N0L17H", "R3F1N3RY", "R3M3M83R"],
	["D16174L", "6L17CH35", "173R470R", "M4R47H0N", "N0V3M83R", "N0V3L157"]];


/**
 * Convert a given text message to morse code
 * @param {String} text The message to convert
 * @returns Morse code version of the given message
 */
function text_to_morse(text) {
	return text.split().reduce((acc, curr) => {
		return acc + morse_dict[curr.toUpperCase()];
	}, '');
}

/**
 * Convert a morse code string to a line code array of 1's and 0's
 * @param {String} morse_string String of -'s, .'s and ' 's to be converted to line code
 * @returns Line code as array of 1's and 0's
 */
function morse_to_line_code(morse_string) {
	let line_code = [0, 0, 0, 0, 0, 0];
	for (let i = 0; i < morse_string.length; i++) {
		line_code.push(...morse_timing[morse_string[i]]);
		if (line_code.at(-1) === 1) line_code.push(0);
	}
	return line_code
}

/**
 * Clear the button ring lights, enable blinker / audio-rx, and set a new message
 * @param {Number} animation_id Interval ID of the current animation
 */
function new_message(animation_id) {
	clearInterval(animation_id);
	$("#button-panel button svg use").removeClass("ring_grn");
	update_blinker_enable();
	update_audio_rx();
	set_message();
}

/**
 * Pick a message and update hint and line code variables
 */
function set_message() {
	// pick a random message from the level-selcted message list
	let msg_list = msg_lists[Number(level)];
	let msg_idx = Math.floor(Math.random() * msg_list.length);
	message = msg_list[msg_idx];

	set_msg_options(msg_idx);
	// convert message text to morse string
	msg_morse_str = text_to_morse(message);
	update_hint_disp();
	morse_line_code = morse_to_line_code(msg_morse_str);
}

/**
 * Set the message options
 * @param {Number} msg_idx Index of the correct message in its message list
 */
function set_msg_options(msg_idx) {
	// grab message option text elements
	let msg_options = $(".msg-option text");
	const n_options = msg_options.length;
	// copy the level-selected messge list
	let msg_list = msg_lists[Number(level)].slice();
	// remove msg from list, shuffle list
	let msg = msg_list.splice(msg_idx, 1)[0];
	shuffle_array(msg_list, 100);
	// build option list from msg and first n shuffled messages
	let msg_option_list = [msg, ...msg_list.slice(0, n_options - 1)];
	shuffle_array(msg_option_list, 10 + n_options);
	// assign messages to displays
	for (let i = 0; i < n_options; i++) {
		msg_options[i].innerHTML = msg_option_list[i].padEnd(8);
	}
}

/**
 * Shuffle the given array
 * @param {Array} array Array to be shuffled
 * @param {Number} n_iter Number of "shuffle" operations to perform
 */
function shuffle_array(array, n_iter) {
	const len = array.length;
	for (let i = 0; i < n_iter; i++) {
		let val1 = array.shift();
		let rand_pos = Math.floor(Math.random() * len);
		array.splice(rand_pos, 0, val1);
	}
}

/**
 * Update the level knob and setting
 * @param {Element} caller Reference to the caller element
 */
function tune_lvl(caller) {
	level = caller.innerHTML;
	let ptr = caller.parentNode.getElementsByClassName("radio-pointer")[0];
	ptr.style.transform = "rotate(" + level * 26 + "deg)";
	console.log('level now: ' + level);
}

/**
 * Update the WPM knob and setting
 * @param {Element} caller Reference to the caller element
 */
function tuneWPM(caller) {
	wpm = parseInt(caller.innerHTML);
	let ptr = caller.parentNode.getElementsByClassName("radio-pointer")[0];
	ptr.style.transform = "rotate(" + (wpm - 1) * 12 + "deg)";
	update_WPM();
}

/**
 * Update the WPM setting and restat the morse Tx/Rx at the new period
 */
function update_WPM() {
	baseT = 1200 / Number(wpm);
	clearInterval(rxIntID);
	rxIntID = setInterval(rx_morse_msg, baseT);
}

/**
 * Parse the current bit in the morse line code and increment the bit position
 */
function rx_morse_msg() {
	if (morse_line_code[pos]) {
		beepOn()
		if (blinkOn) {
			// set light to "on" appearance
			light.attr("fill", "url(#light-on)");
			light.attr("stroke", "none")
		}
	} else {
		// set light to "off" appearance and turn off beeper
		light.attr("fill", "#aa0000");
		light.attr("stroke", "#440000");
		beepOff();
	}
	pos = (pos >= morse_line_code.length) ? 0 : pos + 1;
}

/**
 * Turn on beep sound
 */
function beepOn() {
	gainNode.gain.value = 1;
}

/**
 * Turn off beep sound
 */
function beepOff() {
	gainNode.gain.value = 0
}

/**
 * Update the active audio settings. Start the oscillator is not already started, and update audio_on variable
 */
function update_audio_rx() {
	const sw_state = audio_sw.is(":checked");
	if (sw_state && audioCtx.state === "suspended") {
		if (!oscOn) {
			oscillator.start();
			oscOn = true;
		}
		audioCtx.resume();
	} else if (!sw_state && audioCtx.state === "running") {
		audioCtx.suspend();
	}
}

/**
 * Set the blinker state to in/active according to the blinker switch
 */
function update_blinker_enable() {
	blinkOn = blinker_sw.is(":checked");
}

/**
 * Update the text hint display
 */
function update_hint_disp() {
	hint_display.html((hint_sw.is(":checked")) ? msg_morse_str : "");
}

/**
 * Check the selected message option against the true message. Sets the button ring light according to whether the option chosen is correct or not.
 * @param {Element} caller Button element selecting a message option
 */
function check_msg(caller) {
	let button = $(caller);
	let option = button.next().find("text").html().trim();
	if (option === message) {
		button.find("svg use").addClass("ring_grn");
		morse_line_code = [0];
		setTimeout(reset_animation, 3000);
	} else {
		button.find("svg use").addClass("ring_red");
	}
}

/**
 * Initiate the reset animation. Disable audio and blinker, and set a timer to set a new message
 */
function reset_animation() {
	blinkOn = false;
	// clear all ring light colors
	$("#button-panel button svg use").removeClass(["ring_grn", "ring_red"]);
	$("#button-panel button").eq(0).find("svg use").addClass("ring_grn");

	let animation_id = setInterval(() => {
		let buttons = $("#button-panel button");
		let button_lit = buttons.find(".ring_grn");
		let btn_idx = buttons.index(button_lit.parent().parent());
		button_lit.removeClass("ring_grn");
		btn_idx = (btn_idx + 1) % buttons.length;
		$("#button-panel button").eq(btn_idx).find("svg use").addClass("ring_grn");
	}, 300);
	setTimeout(new_message, 4000, animation_id);
}

/**
 * What does this function do??
 */
function updateFwth() {
	farnsworth = document.getElementById('Farnsworth-slider').value;
	document.getElementById('fwth-disp').innerHTML = farnsworth;
	console.log('Farnsworth now: ' + farnsworth);
}


// reset audio switch
audio_sw.prop("checked", false);
update_WPM();
//updateFwth();
new_message();

// var uagent = navigator.userAgent;
//document.getElementById('uagent-info').innerHTML = uagent;
//document.getElementById('touch-info').innerHTML = hasTouch;
