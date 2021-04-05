
var nCandidates = 3;	// nCand range from 3-5

var ballots = {'A': 0, 'B': 0, 'AB': 0, 'C': 0, 'AC': 0, 'BC': 0, 'ABC': 0};
var candidateScores = {	'A': 0, 'B': 0, 'C': 0};


function nCandUpdate(){
	nCandidates = Number($("#cand-count")[0].value);
}

// Currently only used in candidateUpdate()... 
function genCandidates(){
	candidateScores = {};
	for(var c = 0; c < nCandidates; c++){
		candidateScores[String.fromCharCode(c+65)] = 0;
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

// update the vote counts and total
function update(self){
	var val = parseInt(self.value);
	if(isNaN(val) || val < 0){
		val = 0;
		self.value = val;
	}
	ballots[self.id.slice(1)] = val;
	voteSumUpdate();
}

function genHTMLwithInner(tag, inner){
	var htmlObj = document.createElement(tag);
	htmlObj.innerHTML = inner;
	return htmlObj;
}

function genInputObj(options){
	var inpObj = document.createElement("input");
	for(const attr in options){
		inpObj[attr] = options[attr];
	}
	return inpObj;
}

function simElection(){
    // clear previous scores
    genCandidates();

    var tallyRows = {};             // object to hold each row, initialized with the row headers
    for(const candidate in candidateScores){
        var nRow = document.createElement("tr");
        nRow.append(genHTMLwithInner("td", candidate));
        tallyRows[candidate] = nRow;
    }

    // delete deselected candidates from candidateScores
    for(const c in candidateScores){
		if(!$("#deselect"+c)[0].checked){
            delete candidateScores[c];
            tallyRows[c].append(genHTMLwithInner("td", ""))
        }
	}

    // tally the votes
    for(const ballot in ballots){
        for(const approvedC of ballot){
            if(candidateScores[approvedC] != null){
                candidateScores[approvedC] += ballots[ballot];
            }
        }
    }

    // determine winner
    var winner = Object.keys(candidateScores)[0];
    for(const c in candidateScores){
        if(candidateScores[c] > candidateScores[winner]){
            winner = c;
        }
    }

    // display the results
    var tBody = document.createElement("tbody");
    for(const candidate in candidateScores){
        tallyRows[candidate].append(genHTMLwithInner("td", candidateScores[candidate]));
        if(candidate == winner){
            tallyRows[candidate].cells[0].style.background = "#e6e600";
            tallyRows[candidate].cells[1].style.background = "#e6e600";
        }
    }
    for(const row in tallyRows){        // append the rows to the table body
        tBody.append(tallyRows[row]);
    }

    var tallyTable = $("#tally-rounds")[0];
    tallyTable.replaceChild(tBody, tallyTable.tBodies[0]);
}

function generateBallotObj(){
	ballots = {};
    var candList = Object.keys(candidateScores);

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

    // update candidates
	genCandidates();
    var candList = Object.keys(candidateScores);

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
		for(var c = nCandidates0; c > nCandidates; c--)
			deselectors.removeChild(deselectors.children[c-1]);
	}
	
	// get table object
	var bTable = $("#ballots")[0];

	// update header and footer, starting with wide cells
	var wideCells = $("#ballots [colspan]");
	for(var cell of wideCells){
		cell.colSpan = nCandidates;
	}
	// update candidate list row
	var candidateRow = document.createElement("tr");
	for(const c in candidateScores){
		candidateRow.append(genHTMLwithInner("td", c))
	}
	bTable.tHead.replaceChild(candidateRow, bTable.tHead.rows[1]);

	// update vote Object
	generateBallotObj();
	// create the blank tBody
	var newBody = document.createElement("tbody");
	// add a row for each ballot permutation
	for(const ballot of Object.keys(ballots)){
		var row = document.createElement("tr");		// create the row object

        var ballotApp = 0;
        for(const c of candList){
            if(ballot[ballotApp] == c){
                row.append(genHTMLwithInner("td", "✔️"));
                ballotApp++;
            }    
            else    row.append(genHTMLwithInner("td", ""));
		}
	
		// add the number input cell
		// <input id="aA" type="number" min=0 value=92 onchange="update(this)">
		var nBallot = genInputObj({"id": "a" + ballot,"type": "number", "min": 0,
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

//genCandidates();
votesUpdate();
simElection();