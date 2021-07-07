// Instant Runoff Voting functions script

var nCandidates = 3;	// nCand range from 3-5
const nCandMax = 5;		// maximum number of candidates. More is unnecessary
// may rename this to ballots...
var votes = {'AB':0, 'AC':0, 'A':0,
			 'BA':0, 'BC':0, 'B':0,
			 'CA':0, 'CB':0, 'C':0};
var candidates = {'A':{'votes':0, 'active':true}, 'B':{'votes':0, 'active':true}, 'C':{'votes':0, 'active':true}};

/**
 * Update the number of candidates, limit if necessary. 
 * Referenced by number input's onchange()
 */
function nCandUpdate(){
	nCandidates = Number($("#cand-count")[0].value);
	if(nCandidates > nCandMax){
		nCandidates = nCandMax;	// limit nCandidates if it exceeds the max
		$("#cand-count")[0].value = nCandMax;
	}
}

function genCandidates(){
	candidates = {};	// 'A':{'votes':0, 'active':true},
	for(var c = 0; c < nCandidates; c++){
		candidates[String.fromCharCode(c+65)] = {'votes':0, 'active':true};
	}
}

// update the total number of voters
function voteSumUpdate(){
	var sum = 0;
	for(const pOrder in votes){
		sum += votes[pOrder];
	}
	$("#nVoter").html(sum)
}

function votesUpdate(){
	for(const vote in votes){
		votes[vote] = parseInt($("#p"+vote).val());
	}
	voteSumUpdate();
}

/**
 * Simulate an election with the current candidate selection and votes
 * 
 * should update this to make use of the active property
 */
function simElection(){
	// update vote Obj ...
	votesUpdate();

	// regenerate candidates object
	genCandidates();

	var nCandidates0 = 0;		// initialize starting number of candidates

	for(const c in candidates){
		//console.log($("#cSelect"+c)[0].checked);
		
		if($("#cSelect"+c)[0].checked){
			nCandidates0++;
		} else {
			delete candidates[c];
		}
		
		//candidates[c].active = $("#cSelect"+c)[0].checked;	// pull starting value from deselector list
		//if(candidates[c].active)	
	}
	//nCandidates0 = Object.keys(candidates).length;		// not very elegant. not a fan.

	var headerRow = $("<tr>").append($("<th>Candidate</th>"));
	for(var i = 1; i < nCandidates0; i++){
		headerRow.append($("<th>Rd&nbsp;"+i+"</th>"))
	}
	$("#tally-rounds thead tr").replaceWith(headerRow);

	// create new tallyBody
	var tallyBody = $("<tbody>");
	var tallyRows = {};
	for(var c = 0; c < nCandidates; c++){
		var cLetter = String.fromCharCode(c+65);
		tallyRows[cLetter] = $("<tr>").append($("<td>"+cLetter+"</td>"))
	}

	// for each runoff round...
	for(var r = 1; r < nCandidates0; r++){
		// step 0: clear vote totals
		for(const c in candidates){
			candidates[c].votes = 0;
		}
		
		// first tally the votes
		for(const ballot in votes){	// AB, AC, A, BA...
			var currRank = 0;
			var currPref = candidates[ballot[currRank]];
			
			// if the top preference isnt active, cycle to the next active one
			while(!currPref && currRank < nCandidates){
				currPref = candidates[ballot[++currRank]];
			}
			if(Boolean(currPref)){
				currPref.votes += votes[ballot];
			}
		}

		// then display the vote totals
		for(const c in candidates){
			//if(candidates[c].active){
				tallyRows[c].append($("<td>"+candidates[c].votes+"</td>"))
			//}
		}
		/*
		// grab first active candidate to be starting pt for min loop
		var lowCand;
		for(const c in candidates){
			if(candidates[c].active){
				lowCand = c;
				break;
			}
		}
		// set the lowest voted candidate to inactive
		for(const c in candidates){
			if(!candidates[c].active){	continue;	}
			if(candidates[c].votes < candidates[lowCand].votes){
				lowCand = c;
			}
		}
		candidates[lowCand].active = false;
		*/
		var roundLoser = Object.keys(candidates)[0];
		for(const c in candidates){
			if(candidates[c].votes < candidates[roundLoser].votes){
				roundLoser = c;
			}
		}
		delete candidates[roundLoser];	// eliminate the lowest ranking candidate
	}
	// find highest voted candidate
	var winningCand = Object.keys(candidates)[0];
	for(const c in candidates){
		//if(!candidates[c].active){	continue;	}
		if(candidates[c].votes > candidates[winningCand].votes){
			winningCand = c;
		}
	}

	tallyRows[winningCand].css({"background-color": "yellow", "color": "black"});

	for(var i = 0; i < nCandidates; i++){
		tallyBody.append(tallyRows[String.fromCharCode(i+65)])
	}

	$("#tally-rounds tbody").replaceWith(tallyBody);
}

// update the vote counts and total
function update(self){
	var val = parseInt(self.value);
	if(isNaN(val) || val < 0){
		val = 0;
		self.value = val;
	}
	votes[self.id.slice(1)] = val;
	voteSumUpdate();
}

/**
 * function to call the recursive genVoteObjRec with the standard candidate inputs
 */
function generateVoteObj(){
	votes = {};
	genVoteObjRec("", Object.keys(candidates));
}

/**
 * Recursive function to generate the vote object
 * 
 * @param {String} startPref Indicates the current ballot preference
 * @param {Array} nextCands strings indicating the next ballot preferences
 */
function genVoteObjRec(startPref, nextCands){
	var nNexCands = nextCands.length;

	if(nNexCands > 1){
		for(var i = 0; i < nNexCands; i++){
			var tempArry = nextCands.slice(0,i).concat(nextCands.slice(i+1))
			genVoteObjRec(startPref + nextCands[i], tempArry)
			votes[startPref + nextCands[i]] = 0;
		}
	}
}

/**
 * Generate a new ballot table
 */
function generateBallots(){
	nCandidates = Number($("#cand-count")[0].value);
	if(nCandidates > nCandMax)	nCandidates = nCandMax;	// limit nCandidates if it exceeds the max
	// grab candidate deslector list
	var cSelectors = $("#candidate-selects");
	var nCandidates0 = cSelectors.find("label").length;

	if(nCandidates != nCandidates0){
		// update candidate deselector list
		if(nCandidates > nCandidates0){
			for(var c = nCandidates0; c < nCandidates; c++){

				let cLetter = String.fromCharCode(c+65);
				cSelectors.append($("<label>Candidate "+cLetter+"</label>")
					.prepend($("<input>", {"id": "cSelect"+cLetter, "type": "checkbox", "checked": true})))
			}
		} else {
			for(var c = nCandidates0; c > nCandidates; c--){
				cSelectors.find("label").eq(c-1).remove();
			}
		}

		// update header and footer
		// update wide cells
		var wideCells = $("#ballots [colspan]");
		for(var cell of wideCells){
			cell.colSpan = nCandidates - 1;
		}

		// update rank# row
		var rankRow = $("<tr>");
		for(var r = 1; r < nCandidates; r++){
			rankRow.append($("<td>"+r+".</td>"))
		}
		
		$("#ballots thead tr").eq(1).replaceWith(rankRow);

		// update candidates
		genCandidates();

		// update vote Object
		generateVoteObj();
		// create the blank tBody
		var newBody = $("<tbody>");
		// add a row for each ballot permutation
		for(const ballot of Object.keys(votes)){
			var row = $("<tr>")				// create the row object
		
			for(var pref of ballot){					// add the ranked candidates
				row.append($("<td>"+pref+"</td>"))
			}
			
			for(var c = row[0].childElementCount; c < nCandidates-1; c++){	// add blank cells as necessary
				row.append($("<td> </td>"))
			}
		
			// add the number input cell
			row.append($("<td>").append($("<input>", {"id": "p"+ballot,"type": "number", "min": 0, "onchange": "update(this)"})));

			newBody.append(row);	// append the row to the table body
		}

		// replace old tbody with updated tbody
		$("#ballots tbody").replaceWith(newBody);
	}

	for(let ballotPerm in votes){
		$("#p"+ballotPerm)[0].value = Math.floor(Math.random()*500)
	}

	// update vote totals to match the new rando values
	votesUpdate();
}

// Enter a predefined set of ballots into the table
function presetEntry(select){
	$("#cand-count")[0].value = 3;		// Example is assumed to use only 3 candidates

	generateBallots();
	var presetValues;		// create presetValues var

	switch(select){
		case 0:
			presetValues = [33, 6, 89, 64, 4, 61, 98, 51, 33];
			break;
		case 1:			// Burlington normal votes				// K -> A, M -> B, W -> C
			presetValues = [2043, 371, 568, 1332, 767, 455, 495, 1513, 1289];
			break;
		case 2:			// Burlington hypothetical votes
			presetValues = [2043, 371, 1321, 1332, 767, 455, 0, 1513, 1031];
			break;
		default:
			console.warning("unused case value sent to presetEntry()")
	}

	var prefs = $("#ballots input");
	var permLen = prefs.length;
	for(var i = 0; i < permLen; i++){
		prefs[i].value = presetValues[i];
	}
	votesUpdate();
}

function zeroAll(){
	for(const vote in votes){
		$("#p"+vote).val(0);
		votes[vote] = 0;
	}
	$("#nVoter").html(0)
}

//genCandidates();
votesUpdate();
simElection();

