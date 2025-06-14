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

const audio_sw = $("#audio-sw");
const blinker_sw = $("#blinker-sw");
const light = $("#light");
const hint_sw = $("#text-hint-sw");
const hint_display = $("#msg-hint");
const ring_light_selector = "svg .illuminated-ring";

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
	["AH", "AM", "AM", "AR", "AS", "AT", "BC", "BE", "BI", "BY", "DO", "ED", "EH", "EM", "ER", "EX", "GO", "HA", "HE", "HO", "ID", "IF", "IN", "IO", "IS", "IT", "LO", "LS", "MA", "ME", "MM", "MU", "MY", "NA", "NO", "OB", "OF", "OH", "OK", "ON", "OP", "OR", "OS", "OX", "PA", "PI", "SH", "SI", "SO", "TI", "TO", "UN", "UP", "US", "WE", "YA", "YO"],
	["ADZ", "AFT", "AGO", "AMP", "AWK", "BAR", "BED", "BIN", "BOT", "BOX", "DAY", "DEX", "DOG", "DIN", "DIV", "ELK", "ELM", "EMU", "END", "ERA", "FEM", "FOG", "FOO", "FOR", "FUN", "GAT", "GAY", "GIB", "GIT", "GNU", "HAT", "HEN", "HIT", "HOG", "HUG", "ILK", "IMP", "INK", "INT", "ISO", "JIB", "JOB", "JOT", "JUG", "JUT", "KAT", "KEA", "KEG", "KID", "KIT", "LAP", "LED", "LET", "LOG", "LOP", "MAN", "MAP", "MAR", "MHO", "NAT", "NEW", "NOD", "NOR", "NUT", "OAK", "OHM", "OPE", "ORB", "OWO", "RED", "PET", "PIG", "PUB", "RAD", "REM", "RUN", "SED", "SET", "SOD", "SUN", "TAB", "TAX", "TOP", "VAT", "VIA", "VIM", "WAR", "WIT"],
	["ABUT", "AKIN", "AREA", "BALD", "BASK", "BOTH", "DAMP", "DATA", "DIRT", "EDIT", "ERGO", "EVIL", "FIND", "FLIP", "FUNK", "GIMP", "GOLD", "GREP", "HALO", "HELP", "HERB", "IDOL", "INFO", "INTO", "JEDI", "JERK", "JUDO", "KELP", "KERN", "KILN", "LAND", "LAVA", "LONG", "MAKI", "MASK", "MUST", "NEON", "NMAP", "NOVA", "OKRA", "ONUS", "OVEN", "PARK", "PART", "POST", "RAFT", "RAND", "RIFT", "SALT", "SELF", "SHOT", "TANK", "TART", "THIS", "ULNA", "USER", "VAST", "VETO", "VEST", "WAFT", "WASM", "WORK", "YANK", "YARN", "YETI", "ZERO", "ZEST"],
	["ABORT", "APPLE", "BAGEL", "BANANA", "DELTA", "DEMON", "ELDER", "ESTOP", "FEMUR", "FERAL", "GATOR", "GLITZ", "HABIT", "HALAL", "HARAM", "IDIOM", "INEPT", "INGOT", "JUMPY", "KARMA", "KEBAB", "KLUTZ", "LABEL", "LAIKA", "LASER", "MAMBA", "MANGO", "MELON", "METAL", "NABLA", "NAKED", "NOVEL", "OASIS", "OLDEN", "ORBIT", "PAGAN", "PARKA", "PESTO", "RABID", "RIGOR", "RIVER", "SABER", "SABOT", "SERVO", "TAIGA", "TALON", "TAROT", "ULTRA", "UNFIT", "UPSET", "VAPID", "VENOM", "VISTA", "WAGER", "WAREZ", "WATER"],
	["BEATS", "BISTRO", "BOMBS", "BOXES", "BREAK", "BRICK", "FLICK", "HALLS", "LEAKS", "SHELL", "SLICK", "STROBE", "STEAK", "STING", "TRICK", "VECTOR"],	// lvl 5
	["ABRUPT", "ALPACA", "BADGER", "BANGER", "DAMSEL", "DURING", "EMBARK", "ENTRAP", "FLAVOR", "FORGOT", "GAMBIT", "GARDEN", "HARKEN", "HUBRIS", "IMPART", "INWARD", "JASMIN", "JETLAG", "KATANA", "KOBOLD", "LAGUNA", "LEDGER", "MARKET", "MEMBER", "NAPKIN", "NUMBER", "OBLONG", "OSMIUM", "PERIOD", "PERSON", "PYTHON", "RAPIDS", "RETURN", "SELECT", "STATUS", "TRAVEL", "TUNDRA", "UNITED", "UPTURN", "VIOLET", "VULGAR", "WARDEN", "WITHIN", "YESTER", "YOGURT", "ZENITH", "ZONING"],
	["ALGEBRA", "ARBITER", "BEDEVIL", "BOLLARD", "DECRYPT", "DIGITAL", "EMERALD", "ENCHANT", "FEDERAL", "FURTHER", "GELATIN", "GUNSHIP", "HANDGUN", "HOSTING", "INSWEPT", "INTEGER", "JAVELIN", "JUNKMAN", "KESTREL", "KILOTON", "LEOTARD", "LIMITED", "MACHETE", "MANGOLD", "NATURAL", "NETWORK", "OCARINA", "ORBITAL", "PROBLEM", "PRODUCT", "RATATAT", "RIFLING", "SIMILAR", "STUDENT", "TANGRAM", "TEMPEST", "UNSHORN", "UTILITY", "VENTRAL", "VERDANT", "WARNING", "WAYWARD", "YODELER"],
	["ALTRUISM", "ANALYSIS", "BASILISK", "BESTOWER", "COMPUTER", "DINGBATS", "DISASTER", "ELDRITCH", "ELEVATOR", "FAMILIAL", "FRESHMAN", "FORESTED", "GANGSTER", "GRANDSON", "HANDHOLD", "HOLOGRAM", "INVERTER", "ISOTOPES", "JETLINER", "JUNKYARD", "KANGAROO", "KILOVOLT", "LINOLEUM", "LONGHORN", "MALARKEY", "MASTHEAD", "NAPROXEN", "NEWSGIRL", "ODOMETER", "ORGANISM", "PANGOLIN", "PATHOGEN", "REDEPLOY", "RELEVANT", "SANDFISH", "SOLARIUM", "TOGETHER", "TRIBUNAL", "UNDERARM", "UTENSILS", "VAGABOND", "VERTEBRA", "WARBLING", "WATERBED"],
	["4N4LYZ3R", "84DL4ND5", "D474FL0W", "D3F3ND3R", "D150RD3R", "F3LD5P4R", "F1R37R4P", "F0R357RY", "60V3RN0R", "H4ND6R1P", "H4Z3LNU7", "1NDU57RY", "1NV3N70R", "J0Y571CK", "K1L06R4M", "K1NDL1N6", "L4V3ND3R", "L0WL4ND5", "M4T3R14L", "M473RN4L", "M0N0L17H", "N3W5P34K", "P3NUM8R4", "PL471NUM", "R3F1N3RY", "R3M3M83R", "R3V0LV3R", "5HR4PN3L", "57R4WM4N", "73RM1N4L", "7R1FL1N6", "V4N4D1UM", "W1Z4RDRY"],
	["4L847R05", "4N7174NK", "81N0M14L", "8074N157", "D14M3T3R", "D16174L", "357R063N", "37H3RN37", "F4573N3R", "645W0RK5", "6L17CH35", "H05P174L", "1D3N717Y", "173R470R", "L164M3N7", "L1573N3R", "M46N0L14", "M4R47H0N", "N0V3M83R", "N0V3L157", "083D13N7", "0P3R470R", "P47H063N", "P3N7460N", "R360L17H", "5474N15M", "53D1M3N7", "73L36R4M", "7R41N1N6", "V46480ND", "V357M3N7"]];


/**
 * Convert a given text message to morse code
 * @param {String} text The message to convert
 * @returns Morse code version of the given message
 */
function text_to_morse(text) {
	return text.split('').reduce((acc, curr) => {
		return acc + morse_dict[curr.toUpperCase()] + ' ';
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
	$("#button-panel button " + ring_light_selector).removeClass("ring-grn");
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
	setTimeout(() => new_message(), 2000);
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
 * Call the hint display update fn with a delay equal to the switch transition time
 */
function toggle_hint_sw() {
	let sw_delay = 0;
	if (hint_sw.is(":checked"))
		sw_delay = 300;
	setTimeout(() => update_hint_disp(), sw_delay);
}

/**
 * Update the text hint display
 */
function update_hint_disp() {
	// apparently the proper way to set the content of a textarea (hint_display) is
	// via its value
	hint_display.val((hint_sw.is(":checked")) ? msg_morse_str : "");
}

/**
 * Check the selected message option against the true message. Sets the button ring light according to whether the option chosen is correct or not.
 * @param {Element} caller Button element selecting a message option
 */
function check_msg(caller) {
	let button = $(caller);
	let option = button.next().find("text").html().trim();
	if (option === message) {
		button.find(ring_light_selector).addClass("ring-grn");
		morse_line_code = [0];
		setTimeout(reset_animation, 1000);
	} else {
		// button.find("svg use").addClass("ring-red");
		button.find(ring_light_selector).addClass("ring-red");
	}
}

/**
 * Initiate the reset animation. Disable audio and blinker, and set a timer to set a new message
 */
function reset_animation() {
	blinkOn = false;
	// clear all ring light colors
	$("#button-panel button " + ring_light_selector).removeClass(["ring-grn", "ring-red"]);
	$("#button-panel button").eq(0).find(ring_light_selector).addClass("ring-grn");

	let animation_id = setInterval(() => {
		let buttons = $("#button-panel button");
		let button_lit = buttons.find(".ring-grn");
		let btn_idx = buttons.index(button_lit.parent().parent());
		button_lit.removeClass("ring-grn");
		btn_idx = (btn_idx + 1) % buttons.length;
		$("#button-panel button").eq(btn_idx).find(ring_light_selector).addClass("ring-grn");
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
