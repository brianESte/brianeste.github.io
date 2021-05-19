// Approval Voting functions script

var nCandidates = 3;	// nCand range from 3-5
const nCandMax = 5;		// more than 5 candidates is unnecessary

var ballots = {'A': 0, 'B': 0, 'AB': 0, 'C': 0, 'AC': 0, 'BC': 0, 'ABC': 0};
var candidates = {'A': {'votes':0, 'active':true}, 'B': {'votes':0, 'active':true}, 'C': {'votes':0, 'active':true}};
for(let c = 0; c < 3; c++){
	candidates[String.fromCharCode(c+65)].active = $("#cSelect"+String.fromCharCode(c+65))[0].checked;
}

function nCandUpdate(){
	nCandidates = Number($("#cand-count")[0].value);
	if(nCandidates > nCandMax){
		nCandidates = nCandMax;	// limit nCandidates if it exceeds the max
		$("#cand-count")[0].value = nCandMax;
	}
}

// update the total number of voters
function voteSumUpdate(){
	var sum = 0;
	for(const ballot in ballots){
		sum += ballots[ballot];
	}
	$("#nVoter").html(sum)
}

function votesUpdate(){
	for(const ballot in ballots){
		ballots[ballot] = parseInt($("#a"+ballot).val());
	}
	voteSumUpdate();
}

/**
 * update the internal vote counts and then call voteSumUpdate()
 * 
 * @param {<input>} self 
 */
function update(self){
	var val = parseInt(self.value);
	if(isNaN(val) || val < 0){
		val = 0;
		self.value = val;
	}
	ballots[self.id.slice(1)] = val;
	voteSumUpdate();
}

/**
 * Simulate the election with the given ballots
 * 
 */
function simElection(){
	// first, clear the candidate scores and create row object for each
    var tallyRows = {};             // object to hold each row, initialized with the row headers
    for(const candidate in candidates){
		candidates[candidate].votes = 0;		// clear previous scores

        tallyRows[candidate] = $("<tr>")		// add a row object to tallyRows
			.append($("<td>"+candidate+"</td>"))
    }

    // tally the votes
    for(const ballot in ballots){
        for(const approvedC of ballot){
            if(candidates[approvedC].active){
                candidates[approvedC].votes += ballots[ballot];
            }
        }
    }

    // determine winner
    var winner = Object.keys(candidates)[0];
    for(const c in candidates){
        if(candidates[c].votes > candidates[winner].votes){
            winner = c;
        }
    }

    // display the results
    var tBody = $("<tbody>");
    for(const candidate in candidates){
        if(candidates[candidate].active){
			tallyRows[candidate].append($("<td>"+candidates[candidate].votes+"</td>"))
			if(candidate == winner){
				tallyRows[candidate].css({"background-color": "yellow", "color": "black"});
			}	
		} else {
			tallyRows[candidate].append($("<td>"))
		}
    }
    for(const row in tallyRows){        // append the rows to the table body
        tBody.append(tallyRows[row]);
    }

	$("#tally-rounds tbody").replaceWith(tBody);
}

// currently only used in one location...
function generateBallotObj(){
	ballots = {};
    var candList = Object.keys(candidates);

    // starting at 1, and going to 2^n touches on all relevant ballot permutations
	for(var b = 1; b < Math.pow(2, nCandidates); b++){
        // first convert b to a reversed binary array
        var revBinArray = [];
        var bVal = b;
        while(bVal > 0){
            revBinArray.push(bVal%2);
            bVal = Math.floor(bVal/2);
        }
        var ballotPerm = "";
        // cycle the revBinArray and add the corresponding candidate to the ballot
        var arrayLen = revBinArray.length;
        for(var i = 0; i < arrayLen; i++){
            if(revBinArray[i]){
                ballotPerm += candList[i];
            }
        }
        ballots[ballotPerm] = 0;                // initialize the ballot permutation count
    }
}

/**
 * Update the ballot permutations
 * 
 */
function generateBallots(){
	nCandidates = Number($("#cand-count")[0].value);
	if(nCandidates > nCandMax)	nCandidates = nCandMax;		// limit nCandidates if it exceeds the max

	// grab candidate deslector list
	var cSelectors = $("#candidate-selects");
	var nCandidates0 = cSelectors.find("label").length;

	// first check if the number of candidates needs to be changed. 
	if(nCandidates != nCandidates0){
		// update candidate selector list
		if(nCandidates > nCandidates0){
			for(let c = nCandidates0; c < nCandidates; c++){
				let cLetter = String.fromCharCode(c+65);
				candidates[cLetter] = {votes: 0, active: true};
				cSelectors.append($("<label>Candidate "+cLetter+"</label>")
					.prepend($("<input>", {"id": "cSelect"+cLetter, 
					"type": "checkbox", "onchange": "cSelectorToggle(this)", "checked": true})));
			}
		} else {
			for(var c = nCandidates0; c > nCandidates; c--){
				delete candidates[String.fromCharCode(c+64)];
				cSelectors.find("label").eq(c-1).remove()
			}	
		}

		// update header and footer, starting with wide cells
		var wideCells = $("#ballots [colspan]");
		for(var cell of wideCells){
			cell.colSpan = nCandidates;
		}

		// update candidate list row
		var candidateRow = $("<tr>");
		for(const c in candidates){
			candidateRow.append($("<td>"+c+"</td>"))
		}
		$("#ballots thead tr").eq(1).replaceWith(candidateRow);

		// update vote Object
		generateBallotObj();
		// create the blank tBody
		var newBody = $("<tbody>");
		// add a row for each ballot permutation
		for(const ballot of Object.keys(ballots)){
			var row = $("<tr>");		// create the row object

			var ballotApp = 0;
			for(const c in candidates){
				if(ballot[ballotApp] == c){
					row.append($("<td><span class='checkmark'></span></td>"));		// this creates a custom checkmark
					ballotApp++;
				}    
				else{
					row.append($("<td>"))
				}
			}
		
			row.append($("<td>")
				.append($("<input>", {"id": "a" + ballot,"type": "number", "min": 0, "onchange": "update(this)"})));

			newBody.append(row);	// append the row to the table body
		}

		// replace old tbody with updated tbody
		$("#ballots tbody").replaceWith(newBody);
	}

	for(let ballotPerm in ballots){
		$("#a"+ballotPerm)[0].value = Math.floor(Math.random()*100)
	}

	// update vote totals to match the new rando values
	votesUpdate();
}

function candClick(self){
	//console.log(self.innerHTML)
	var candLetter = self.innerHTML;
	var candColumn = candLetter.charCodeAt()-64;
	// :where() pseudo class acts as an OR: ( || ) 
	$("#ballots :where(thead, tbody) td:nth-child(" +candColumn+ ")").toggleClass("stripeOut");
}

// deselect specified candidate
function cSelectorToggle(self){
    var candLetter = self.id.slice(-1);
    candidates[candLetter].active = !candidates[candLetter].active;
    var blocColumn = candLetter.charCodeAt()-64;
	
    // candidateRow.find("th").eq(4).toggleClass("stripeOut")
    //$("#ballots th:nth-child("+blocColumn+")").toggleClass("stripeOut");
    // toggle honesty and votes cells of the selected column
    //$("#ballots tr:not(:first-child) td:nth-child("+blocColumn+")").toggleClass("stripeOut");
}

//genCandidates();
votesUpdate();
simElection();