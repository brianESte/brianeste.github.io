
var nCandidates = 3;	// nCand range from 3-5
var testObj;
// may rename this to ballots...
var votes = {'AB':0, 'AC':0, 'A':0,
			 'BA':0, 'BC':0, 'B':0,
			 'CA':0, 'CB':0, 'C':0};
var candidates; // = {	'A':{'votes':0, 'active':true},	'B':{'votes':0, 'active':true},	'C':{'votes':0, 'active':true}};


function nCandUpdate(){
	nCandidates = Number($("#cand-count")[0].value);
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

// election function/loop
function simElection(){
	// update vote Obj ...
	for(const vote in votes){
		votes[vote] = parseInt($("#p"+vote).val());
	}

	// regenerate candidates object
	genCandidates();

	// clear background formatting		is this necessary if i create a new tally-table?
	//$("#tally-rounds td,th").css("background","#00cc99");
	var nCandidates0 = 0;

	for(const c in candidates){
		if($("#deselect"+c)[0].checked){
			nCandidates0++;
		} else {
			delete candidates[c];
		}
		//candidates[c].active = ;	// pull starting value from deselector list
		//if(candidates[c].active)	
	}

	// grab tally table
	var tallyTable = $("#tally-rounds")[0];
	// udpate thead...
	var headerRow = document.createElement("tr");
	var thcell = document.createElement("th");
	thcell.innerHTML = "Candidate";		// may change later...
	headerRow.appendChild(thcell);
	for(var i = 1; i < nCandidates0; i++){
		headerRow.appendChild(genHTMLwithInner("th", "Rd "+i));
	}
	tallyTable.tHead.replaceChild(headerRow, tallyTable.tHead.rows[0]);

	// create new tallyBody
	var tallyBody = document.createElement("tbody");
	var tallyRows = {};
	for(var c = 0; c < nCandidates; c++){
		var cLetter = String.fromCharCode(c+65);
		var cCell = genHTMLwithInner("td", cLetter);
		var row = document.createElement("tr");
		row.append(cCell);
		tallyRows[cLetter] = row;
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
				tallyRows[c].append(genHTMLwithInner("td", candidates[c].votes));
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
	tallyRows[winningCand].cells[nCandidates0-1].style.background = "#e6e600";
	for(var i = 0; i < nCandidates; i++){
		tallyBody.append(tallyRows[String.fromCharCode(i+65)])
	}
	tallyTable.replaceChild(tallyBody, tallyTable.tBodies[0]);
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

function genHTMLwithInner(tag, inner){
	var cell = document.createElement(tag);
	cell.innerHTML = inner;
	return cell;
}

/**
 * generates an html input object. Could/might modify/expand to all html tags
 * might not work with "onchange"... not sure why..
 * 
 * @param {Object} options 
 * @returns 	generated input object
 */
function genInputObj(options){
	var inpObj = document.createElement("input");
	for(const attr in options){
		inpObj[attr] = options[attr];
	}
	return inpObj;
}

function candidateUpdate(){
	nCandidates = Number($("#cand-count")[0].value);
	// grab candidate deslector list
	var deselectors = $("#candidate-deselect")[0];
	var nCandidates0 = deselectors.childElementCount;
	
	if(nCandidates == nCandidates0){					// check that the nC did* change
		console.log("nCand == nCandIn, nothing to do, returning to base")
		console.log("current: ",nCandidates0," new: ",nCandidates)
		return;
	} else {
		console.log("current: ",nCandidates0," new: ",nCandidates)
	}

	// update candidate deselector list
	// <li><label><input type="checkbox" id="deselectC" checked>Candidate C</label></li>
	if(nCandidates > nCandidates0){
		for(var c = nCandidates0; c < nCandidates; c++){
			//var lItem = document.createElement("li");
			var candLabel = document.createElement("label");
			var candSel = genInputObj({"id": "deselect"+String.fromCharCode(c+65), "type": "checkbox"});
			candSel.setAttribute("checked", true);
			candLabel.append(candSel);
			candLabel.innerHTML += "Candidate "+String.fromCharCode(c+65);
			//lItem.append(candLabel);
			deselectors.append(candLabel);	//lItem);
		}
	} else {
		for(var c = nCandidates0; c > nCandidates; c--){
			deselectors.removeChild(deselectors.children[c-1]);
		}
	}
	
	// get table object
	var bTable = $("#ballots")[0];

	// update header and footer
	// update wide cells
	var wideCells = $("#ballots [colspan]");
	for(var cell of wideCells){
		cell.colSpan = nCandidates - 1;
	}
	// update rank# row
	var rankRow = document.createElement("tr");
	for(var r = 1; r < nCandidates; r++){
		rankRow.append(genHTMLwithInner("td",r+"."))
	}
	bTable.tHead.replaceChild(rankRow, bTable.tHead.rows[1]);

	// update candidates
	genCandidates();

	// update vote Object
	generateVoteObj();
	// create the blank tBody
	var newBody = document.createElement("tbody");
	// add a row for each ballot permutation
	for(const ballot of Object.keys(votes)){
		var row = document.createElement("tr");		// create the row object
	
		for(var pref of ballot){					// add the ranked candidates
			row.append(genHTMLwithInner("td", pref))
		}
		
		for(var c = row.cells.length; c < nCandidates-1; c++){	// add blank cells as necessary
			row.append(genHTMLwithInner("td", " "))
		}
	
		// add the number input cell
		// <input id="pC" type="number" min=0 value=92 onchange="update(this)">
		var nBallot = genInputObj({"id": "p" + ballot,"type": "number", "min": 0,
			"value": Math.floor(Math.random()*100)});
		nBallot.setAttribute("onchange", "update(this)");
	
		var nBallotCell = document.createElement("td");
		nBallotCell.append(nBallot);
		row.append(nBallotCell);

		newBody.append(row);	// append the row to the table body
	}

	// replace old tbody with updated tbody
	var tBody = bTable.tBodies[0];
	bTable.replaceChild(newBody, tBody)

	// update vote totals to match the new rando values
	votesUpdate();
}

function votesUpdate(){
	for(const vote in votes){
		votes[vote] = parseInt($("#p"+vote).val());
	}
}

// Burlington example votes
function burlington(select){
	// K -> A, M -> B, W -> C
	$("#cand-count")[0].value = 3;
	//nCandidates = 3;
	candidateUpdate();

	if(select == 0){
		var burlingtonVotes = [2043, 371, 568, 1332, 767, 455, 495, 1513, 1289];
	} else {
		var burlingtonVotes = [2043, 371, 1321, 1332, 767, 455, 0, 1513, 1031];
	}
	var prefs = $("#ballots input");
	var permLen = prefs.length;
	for(var i = 0; i < permLen; i++){
		prefs[i].value = burlingtonVotes[i];
	}
	votesUpdate();
	voteSumUpdate();
}

genCandidates();
votesUpdate();
voteSumUpdate();
simElection();

