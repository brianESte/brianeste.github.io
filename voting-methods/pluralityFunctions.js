// plurality page functions

var nCandidates = 3;	// nCand range from 3-5
const nCandMax = 6;		// more than 5 candidates is unnecessary

var voterInfo = {'a': {Voters: 0, Honesty: 100, active: true},
                'b': {Voters: 0, Honesty: 100, active: true},
                'c': {Voters: 0, Honesty: 20, active: true}};
var candidateScores = {	'a': 0, 'b': 0, 'c': 0};

// object to hold the frontrunners from each # of candidates
var frontRunnerRule = {3: "ab", 4: "bc", 5: "bd"}

function nCandUpdate(){
	nCandidates = Number($("#cand-count")[0].value);
	if(nCandidates > nCandMax){
		nCandidates = nCandMax;	// limit nCandidates if it exceeds the max
		$("#cand-count")[0].value = nCandMax;
	}
}

/*
// update the total number of voters
function voteSumUpdate(){
	var sum = 0;
	for(const ballot in ballots){
		sum += ballots[ballot];
	}
	$("#nVoter").html(sum)
}
*/

function votesUpdate(){
	for(const voterBloc in voterInfo){
		voterInfo[voterBloc].Voters = parseInt($("#"+voterBloc+"Voters").val());
        voterInfo[voterBloc].Honesty = parseInt($("#"+voterBloc+"Honesty").val());
	}
	//voteSumUpdate();
}

// update the vote counts and total
function update(self){
	var val = parseInt(self.value);
	if(isNaN(val) || val < 0){
		val = 0;
		self.value = val;
	}
    var id = self.id;
	voterInfo[id.slice(0, 1)][id.slice(1)] = val;   // voterInfo[a|b|c][Voters|Honesty]
	//voteSumUpdate();
}

// deselect specified candidate
function deselect(self){
    var voterBloc = self.id.slice(-1).toLowerCase();
    voterInfo[voterBloc].active = !voterInfo[voterBloc].active;
    var blocColumn = voterBloc.charCodeAt()-95;
    // candidateRow.find("th").eq(4).toggleClass("stripeOut")
    $("#voters th:nth-child("+blocColumn+")").toggleClass("stripeOut");
    // toggle honesty and votes cells of the selected column
    $("#voters tr:not(:first-child) td:nth-child("+blocColumn+")").toggleClass("stripeOut");
}

/**
 * Simulate a plurality election
 * 
 * Needs work. Issues arise when a frontrunner is disabled
 */
function simPlurality(){
    // clear previous scores
    for(let c = 0; c < nCandidates; c++){
        candidateScores[String.fromCharCode(c+97)] = 0;
    }

    var frontRunners = frontRunnerRule[nCandidates];

    //  if not 100% honest (non frontrunner / mainstream)
    for(let voterBloc in voterInfo){
        if(voterInfo[voterBloc].active){
            if(voterInfo[voterBloc].Honesty == 100){
                candidateScores[voterBloc] += voterInfo[voterBloc].Voters;
            } else {
                let nVoters = voterInfo[voterBloc].Voters;
                for(let v = 0; v < nVoters; v++){
                    if(Math.random()*100 < voterInfo[voterBloc].Honesty){
                        candidateScores[voterBloc] += 1;
                    } else {
                        var vBlocPos = voterBloc.charCodeAt();
                        var vBlocRange = 1;
                        var nearestFrontRunners = [];        // empty array for next frontrunners
                        while(nearestFrontRunners.length < 1){
                            //console.log(String.fromCharCode(vBlocPos +vBlocRange));
                            if(frontRunners.includes(String.fromCharCode(vBlocPos +vBlocRange)))    // +range
                                nearestFrontRunners.push(String.fromCharCode(vBlocPos +vBlocRange));
                            if(frontRunners.includes(String.fromCharCode(vBlocPos -vBlocRange)))    // -range
                                nearestFrontRunners.push(String.fromCharCode(vBlocPos -vBlocRange));
                            vBlocRange++;
                        }
                        if(nearestFrontRunners.length == 1){
                            candidateScores[nearestFrontRunners[0]] += 1;
                            //console.log(nearestFrontRunners)
                        } else {
                            //let nVoters = voterInfo[voterBloc].Voters;
                            //for(let v = 0; v < nVoters; v++){
                                if(Math.random() < 0.5)
                                    candidateScores[nearestFrontRunners[0]] += 1;
                                else
                                    candidateScores[nearestFrontRunners[1]] += 1;
                            //}
                        }
                    }
                }
            }                
        } else {                // if candidate inactive, voterBloc is 100% strategic
            console.log("inactive candidate if branch");
            var vBlocPos = voterBloc.charCodeAt();
            var vBlocRange = 1;
            var nearestFrontRunners = [];        // empty array for next frontrunners
            while(nearestFrontRunners.length < 1){
                //console.log(String.fromCharCode(vBlocPos +vBlocRange));
                if(frontRunners.includes(String.fromCharCode(vBlocPos +vBlocRange)))    // +range
                    nearestFrontRunners.push(String.fromCharCode(vBlocPos +vBlocRange));
                if(frontRunners.includes(String.fromCharCode(vBlocPos -vBlocRange)))    // -range
                    nearestFrontRunners.push(String.fromCharCode(vBlocPos -vBlocRange));
                vBlocRange++;
            }
            if(nearestFrontRunners.length == 1){
                candidateScores[nearestFrontRunners[0]] += voterInfo[voterBloc].Voters;
                //console.log(nearestFrontRunners)
            } else {
                let nVoters = voterInfo[voterBloc].Voters;
                for(let v = 0; v < nVoters; v++){
                    if(Math.random() < 0.5)
                        candidateScores[nearestFrontRunners[0]] += 1;
                    else
                        candidateScores[nearestFrontRunners[1]] += 1;
                }
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

    // color the winning candidate's cell
    var votesCells = $("#voters tbody tr").eq(2).find("td");
    for(var c = 1; c < nCandidates+1; c++){
        votesCells.eq(c).html(candidateScores[String.fromCharCode(c+96)])
        if(String.fromCharCode(c+96) == winner)
            votesCells.eq(c).css({"background-color": "yellow", "color": "black"});
        else
            votesCells.eq(c).css({"background-color": "", "color": ""});
    }
}

function generateVoterObj(){
	voterInfo = {};
    var candList = Object.keys(candidateScores);
    var frontRunners = frontRunnerRule[candList.length];

    for(const cand of candList){
        if(frontRunners.includes(cand))
            voterInfo[cand] = {Voters: Math.floor(Math.random()*500), Honesty: 100, active: true};
        else
            voterInfo[cand] = {Voters: Math.floor(Math.random()*150), Honesty: Math.floor(Math.random()*50), active: true};
    }
}

/**
 * Generate / update the election table
 * 
 * 
 */
function genElectionTable(){
	nCandidates = Number($("#cand-count")[0].value);
	if(nCandidates > nCandMax)	nCandidates = nCandMax;	// limit nCandidates if it exceeds the max
    if(nCandidates < 3)	nCandidates = 3;	            // limit nCandidates if it is less than 3

	// grab candidate deslector list
	var deselectors = $("#candidate-deselect");
	var nCandidates0 = deselectors.find("label").length;

    // update candidates
    candidateScores = {};
    for(let c = 0; c < nCandidates; c++){
        candidateScores[String.fromCharCode(c+97)] = 0;
    }

    // update structure
	// grab table rows
	var candidateRow = $("#voters thead tr").eq(0);
    var nVotersRow = $("#voters tbody tr").eq(0);
    var honestyRow = $("#voters tbody tr").eq(1);
    var votesRow = $("#voters tbody tr").eq(2);

	// update candidate deselector list
	if(nCandidates > nCandidates0){
		for(let c = nCandidates0; c < nCandidates; c++){
            let candLetter = String.fromCharCode(c+65);  
            deselectors.append($("<label>Candidate "+String.fromCharCode(c+65)+"</label>")
                .prepend($("<input>", {"id": "deselect"+String.fromCharCode(c+65), "type": "checkbox", 
                "onchange": "deselect(this)", "checked": true})));

            candidateRow.append($("<th>"+candLetter+"</th>"));

            candLetter = String.fromCharCode(c+97);
            nVotersRow.append($("<td>").append($("<input>",{"id": candLetter+"Voters", type: "number",
                min: 0, "onchange": "update(this)"})));
            honestyRow.append($("<td>").append($("<input>",{"id": candLetter+"Honesty", "type": "number",
                "min": 0, "max": 100, "onchange": "update(this)"})));
            votesRow.append($("<td>"));
		}
	} else {
		for(let c = nCandidates0; c > nCandidates; c--){
            deselectors.find("label").eq(c-1).remove();

            // remove unnecessary cells
            candidateRow.find("th").eq(c).remove();
            nVotersRow.find("td").eq(c).remove();
            honestyRow.find("td").eq(c).remove();
            votesRow.find("td").eq(c).remove();
        }
	}

    var frontRunners = frontRunnerRule[nCandidates];

    $("#voters th:not(:first-child)").each((index, el) => {
        //console.log(index);
        let candLetter = String.fromCharCode(index +65);
        if(frontRunners.includes(candLetter.toLowerCase()))
            $(el).html("* "+candLetter+" *")
        else
            $(el).html(candLetter)
    })

    // update values
    // generate voter info Object
    generateVoterObj();

    // "value": voterInfo[c].Voters
    for(let c = 0; c < nCandidates; c++){
        nVotersRow.find("input").eq(c).val(voterInfo[String.fromCharCode(c+97)].Voters);
        honestyRow.find("input").eq(c).val(voterInfo[String.fromCharCode(c+97)].Honesty);
    }

	// update vote totals to match the new rando values
	votesUpdate();
}

for(var box of $("[checked]")){
    if(!box.checked){
        deselect(box)
    }
}

//votesUpdate();
genElectionTable();
simPlurality();