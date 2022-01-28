// Instant Runoff Voting functions script

var nCandidates = 3;	// nCand range from 3-5
const nCandMax = 5;		// maximum number of candidates. More is unnecessary

var ballots = {'AB':0, 'AC':0, 'A':0,
			 'BA':0, 'BC':0, 'B':0,
			 'CA':0, 'CB':0, 'C':0};
var candidates = {};

/**
 * inc/de-crements the number of candidates and updates the candidate selectors
 * 
 * @param {int} inc +/-1, indicates whether the number of c-selects should increment or decrement
 */
function increment_n(inc){
	if(nCandidates+inc > nCandMax || nCandidates+inc < 3)	return

	nCandidates += inc;
	var c_selects = $("#candidate-selects").children();

	c_selects.eq(nCandidates-1).css("display", "flex");
	c_selects.eq(nCandidates).css("display", "none");
	$("#cand-count").val(nCandidates);
}

/**
 * Generate the candidate object
 */
function genCandidates(){
	candidates = {};	// 'A':{'votes':0, 'active':true},
	for(let c = 0; c < nCandidates; c++){
		candidates[String.fromCharCode(c+65)] = {'votes':0, 'active':true, 'src_node': 0, 'tar_node': 0, "ballots":{}};
	}
}

// update the total number of voters
function voteSumUpdate(){
	var sum = 0;
	for(const pOrder in ballots){
		sum += ballots[pOrder];
	}
	$("#nVoter").html(sum)
}

function votesUpdate(){
	for(const ballot in ballots){
		ballots[ballot] = parseInt($("#p"+ballot).val());
	}
	voteSumUpdate();
}

/**
 * Simulate an election with the current candidate selection and votes
 * 
 * keeping this function in case I feel like reuing any of the code or bringing the results table back.
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
			//delete candidates[c];
			candidates[c].active = false;
		}
		
		//candidates[c].active = $("#cSelect"+c)[0].checked;	// pull starting value from deselector list
		//if(candidates[c].active)	
	}
	//nCandidates0 = Object.keys(candidates).length;		// not very elegant. not a fan.

	var headerRow = $("<tr>").append($("<th>Candidate</th>"));
	for(let i = 1; i < nCandidates0; i++){
		headerRow.append($("<th>Rd&nbsp;"+i+"</th>"))
	}
	$("#tally-rounds thead tr").replaceWith(headerRow);

	// create new tallyBody
	var tallyBody = $("<tbody>");
	var tallyRows = {};
	for(let c = 0; c < nCandidates; c++){
		var cLetter = String.fromCharCode(c+65);
		tallyRows[cLetter] = $("<tr>").append($("<td>"+cLetter+"</td>"))
	}

	// for each runoff round...
	for(let r = 1; r < nCandidates0; r++){
		// step 0: clear vote totals
		for(const c in candidates){
			candidates[c].votes = 0;
		}
		
		// step 1: tally the votes
		for(const ballot in ballots){	// AB, AC, A, BA...
			var currRank = 0;
			var currPref = candidates[ballot[currRank]];
			
			// if the top preference isnt active, cycle to the next active one
			//while(!currPref && currRank < nCandidates){
			while(Boolean(currPref) && !currPref.active){	//  && (currRank < nCandidates)
				currPref = candidates[ballot[++currRank]];
			}
			// if an active candidate was found on the ballot, add those votes to their total:
			if(Boolean(currPref)){
				currPref.votes += ballots[ballot];
			} else {
				//console.log(ballots[ballot], " exhausted ballots from ",ballot)
			}
			// else add to exhausted total
		}

		// step 2: display the vote totals
		for(const c in candidates){
			if(candidates[c].active){
				tallyRows[c].append($("<td>"+candidates[c].votes+"</td>"))
			}
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

		// step 3: determine round loser and set them inactive
		// grab first active candidate to be starting pt for min loop
		var roundLoser;		//  = Object.keys(candidates)[0]
		for(const c in candidates){
			if(candidates[c].active){
				roundLoser = c;
				break;
			}
		}
		// now find the actual round loser
		for(const c in candidates){
			if(!candidates[c].active)
				continue;
			if(candidates[c].votes < candidates[roundLoser].votes){
				roundLoser = c;
			}
		}
		// eliminate the lowest ranking candidate
		//delete candidates[roundLoser];
		candidates[roundLoser].active = false;
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

	for(let i = 0; i < nCandidates; i++){
		tallyBody.append(tallyRows[String.fromCharCode(i+65)])
	}

	$("#tally-rounds tbody").replaceWith(tallyBody);
}

/**
 * New and improved election sim function
 */
function sim_election_2(){
	// regenerate candidates object
	genCandidates();

	// set any unchecked candidates to inactive
	for(let c in candidates){
		if(!$("#cSelect"+c)[0].checked){
			candidates[c].active = false;
		}
	}

	// create list of active candidates
	var active_cands = Object.keys(candidates).filter(c => candidates[c].active);
	// record number of initially active candidates for reference at the end
	var n_initial_cands = active_cands.length;

	// loop through each ballot and assign it to the first active candidate ranked
	for(let b in ballots){
		if(ballots[b] == 0)	continue;
		var ar = 0;			// active rank
		while(b[ar] && !candidates[b[ar]].active)	ar++;
		if(b[ar])	candidates[b[ar]].ballots[b] = ballots[b];
	}

	// clear sankey nodes/links vars, create the initial nodes for the Sankey diagram
	var sankey_links = [];
	var sankey_nodes = [];
	var node_ctr = 0;
	// add the initial nodes, filtered by which are active:
	for(let c of Object.keys(candidates).filter(c => candidates[c].active)){
		sankey_nodes.push({id: node_ctr, name: c});
		candidates[c].src_node = node_ctr++;
	}
	
	do{
		// reset the candidate votes to 0
		for(let c in candidates)
			candidates[c].votes = 0;
		
		// count the votes for each candidate
		for(let c of active_cands){
			for(let n_v of Object.values(candidates[c].ballots)){
				candidates[c].votes += n_v;
			}
		}
		// determine which candidates to eliminate
		let round_ranking = active_cands.slice();
		round_ranking.sort((a, b) => { return candidates[b].votes - candidates[a].votes});
		var bottom_sum = 0;
		for(let c of round_ranking.slice(1))
			bottom_sum += candidates[c].votes;
		for(var i = 0; i < round_ranking.length-2; i++){
			if(candidates[round_ranking[i]].votes > bottom_sum)
				break;	// eliminate all cands at indices > i
			bottom_sum -= candidates[round_ranking[i+1]].votes;
		}
		// create list of candidates to be eliminated, and increment elimination index
		let to_be_eliminated = round_ranking.slice(++i);
		// create new nodes for the candidates progressing to the next round, and links to them
		for(let c of round_ranking.slice(0, i)){
			// ignore active/inactive for now
			sankey_nodes.push({name: c, id: node_ctr});
			sankey_links.push({source: candidates[c].src_node, target: node_ctr, value: candidates[c].votes});
			candidates[c].tar_node = node_ctr++;
		}
		// set all candidates to be eliminated to inactive
		for(let e of to_be_eliminated)	candidates[e].active = false;
		// then process their ballots
		for(let e of to_be_eliminated){
			// create link from eliminated candidate to transfer recipients and transfer ballots
			for(let b of Object.keys(candidates[e].ballots)){
				// figure out the next active rank of the ballot, so we can determine the ballot transfer recipient
				let nex_rank = b.indexOf(e)+1;
				while(candidates[b[nex_rank]] && !candidates[b[nex_rank]].active)	nex_rank++;
				// define the recipient node number
				let recipient_node = -1;
				if(b[nex_rank]){
					// if there is a valid ballot transfer recipient, reassign the recipient_node, and transfer the ballots
					recipient_node = candidates[b[nex_rank]].tar_node;
					candidates[b[nex_rank]].ballots[b] = candidates[e].ballots[b];
				} 
				// create / update the transfer link
				let previous_link = sankey_links.find(el => {return el.source == candidates[e].src_node && el.target == recipient_node});
				if(previous_link){
					previous_link.value += candidates[e].ballots[b];
				} else
					sankey_links.push({source:candidates[e].src_node, target:recipient_node, value:candidates[e].ballots[b]});
			}
		}
		// update the node values of the remaining candidates
		for(let c of round_ranking.slice(0, i)){
			candidates[c].src_node = candidates[c].tar_node;
		}
		// update the list of active candidates
		active_cands = Object.keys(candidates).filter(c => candidates[c].active);
	}while(active_cands.length > 2);
	// If there were any exhausted ballots, add the exhausted node
	if(sankey_links.some((e) => e.target == -1)){
		sankey_nodes.push({id: node_ctr, name: "Exhausted"})
		// update all links to use exhausted node number instead of placeholder (-1)
		for(let l in sankey_links){
			if(sankey_links[l].target == -1)
				sankey_links[l].target = node_ctr;
		}
	}

	// filter out any empty initial nodes
	// could maybe try to filter those earlier in the sim process...
	sankey_nodes = sankey_nodes.filter(n => {
		if(n.id >= n_initial_cands )	return true;
		for(let link of sankey_links)
			if(link.source === n.id)	return true;
		return false;
	});

	// rebuild the sankey diagram
	build_sankey({nodes: sankey_nodes, links: sankey_links});
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

/**
 * function to call the recursive genVoteObjRec with the standard candidate inputs
 */
function generateBallotObj(){
	ballots = {};
	genBallotObjRec(ballots, "", Object.keys(candidates));
}

/**
 * Recursive function to generate the vote object
 * 
 * @param {String} startPref Indicates the current ballot preference
 * @param {Array-like} nextCands strings indicating the next ballot preferences
 */
function genBallotObjRec(obj, startPref, nextCands){
	var nNexCands = nextCands.length;

	if(nNexCands > 1){
		for(let i = 0; i < nNexCands; i++){
			let tempArry = nextCands.slice(0,i).concat(nextCands.slice(i+1))
			genBallotObjRec(obj, startPref + nextCands[i], tempArry);

			let perm = startPref + nextCands[i];
			if(!obj[perm])
				obj[perm] = 0;
		}
	}
}

/**
 * Build / generate a new ballot table
 */
function build_ballot_table(){
	// begin rebuilding / regenerating table
	// update header and footer
	// update wide cells
	let wideCells = $("#ballots [colspan]");
	for(let cell of wideCells){
		cell.colSpan = nCandidates - 1;
	}

	// update rank# row
	let rankRow = $("<tr>");
	for(let r = 1; r < nCandidates; r++){
		rankRow.append($("<td>"+r+".</td>"))
	}
	
	$("#ballots thead tr").eq(1).replaceWith(rankRow);

	// create the blank tBody
	let newBody = $("<tbody>");
	// add a row for each ballot permutation
	for(const ballot of Object.keys(ballots)){
		let row = $("<tr>");				// create the row object
	
		// add the ranked candidates
		for(let pref of ballot)	
			row.append($("<td>"+pref+"</td>"));
		
		// add blank cells as necessary
		for(let c = row[0].childElementCount; c < nCandidates-1; c++)
			row.append($("<td> </td>"));
	
		// add the number input cell
		row.append($("<td>").append($("<input>", {"id": "p"+ballot,"type": "number", "min": 0, "onchange": "update(this)"})));

		// append the row to the table body
		newBody.append(row);	
	}

	// replace old tbody with updated tbody
	$("#ballots tbody").replaceWith(newBody);
}

/**
 * populate the ballot table from the ballot object
 */
function fill_ballot_table(){
	if(document.getElementById("chkbx-hide-unused").checked){
		// if unused should be hidden, go thorugh each row, set the value
		let perms = Object.keys(ballots);
		let rows = $("#ballots tbody tr");
		for(let r = 0; r < rows.length; r++){
			// assign the permutation vote to the input value 
			rows.find("input").eq(r).val(ballots[perms[r]]);
			// hide / unhide each row based on the perm vote count
			if(ballots[perms[r]] == 0){
				rows.eq(r).attr("style", "display:none");
			} else {
				rows.eq(r).attr("style", "display:table-row");
			}
		}
	} else {
		for(let ballotPerm in ballots){
			$("#p"+ballotPerm).val(ballots[ballotPerm]);
		}
	}
	voteSumUpdate();
}

/**
 * Generate new ballots, updating the table if necessary
 * 
 * @param {bool} init regen candidates, ballots, and table, even if nCandidates is unchanged
 */
function generateBallots(init=false){
	// if initialising or if the number of candidates changed, rebuild the table
	if(init || nCandidates-1 != $("#ballots thead tr th").eq(0).attr("colspan")){
		// update candidates
		genCandidates();
		// update ballot Object
		generateBallotObj();
		// build a new ballot table and candidate selectors
		build_ballot_table();
	}

	// generate ballot values
	for(let perm in ballots){
		ballots[perm] = Math.max(0, Math.floor(Math.random()*500)-150);
	}

	// fill ballot table from generated ballots
	fill_ballot_table();
}

/**
 * Enter a predefined set of ballots into the table
 * 
 * @param {Int} select Selects the set of ballots to enter
 */
function presetEntry(select){
	var presetValues;

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

	if(nCandidates != 3){
		// update candidates
		genCandidates();
		// update ballot Object
		generateBallotObj();
		// build a new ballot table and candidate selectors
		build_ballot_table();
	}

	//var prefs = $("#ballots input");
	var permutations = Object.keys(ballots);
	var permLen = permutations.length;
	for(let i = 0; i < permLen; i++){
		ballots[permutations[i]] = presetValues[i];
	}
	fill_ballot_table();
	//votesUpdate();
}

function zeroAll(){
	for(const vote in ballots){
		$("#p"+vote).val(0);
		ballots[vote] = 0;
	}
	$("#nVoter").html(0)
}

function toggle_unused(){
	var hide_unused = document.getElementById("chkbx-hide-unused").checked;
	
	// hide the 0's if desired
	var perms = Object.keys(ballots)
	var rows = $("#ballots tbody tr");
	for(let r = 0; r < perms.length; r++){
		// check each row for a 0 count. hide if desired
		if(hide_unused && rows[r].lastChild.firstChild.value == 0){
			rows[r].setAttribute("style", "display:none")
		} else {
			rows[r].setAttribute("style", "display:table-row")
		}
	}
}

function process_ballot_file(event){
	//console.log(event)
	var input = event.target;
	if("files" in input && input.files.length > 0){
		console.log("there is a file. Maybe check the encoding?")
		//place_content(document.getElementById("file-out"), input.files[0])
		read_content(input.files[0]).then(content => {
			let lines = get_lines(content);
			const line_regex = /^(?:[\w-]+)(?:[^\w-][\w-]+)*[ \t]+\d+$/m;
			if(!line_regex.test(lines[0])){
				alert("Invalid file content. First line did not match desired format");
				return;
			}

			let last_cand = 0;
			let prefs;
			// create a blank ballot object for 3 candidates
			nCandidates = 3;
			genCandidates();
			generateBallotObj();
			var cand_map = new Map();
			// keep track of how many candidates there are
			for(let line of lines){
				if(!line || !line_regex.test(line))	continue;
				prefs = line.match(/[\w-]+/g);
				prefs.pop();
				// map the new candidates from the current line to a candidate letter {A, B, C...}
				for(let c of prefs)
					if(!cand_map.has(c))
						cand_map.set(c, String.fromCharCode(65+ last_cand++))
				
				// expand ballot object to handle new candidates / permutations:
				if(cand_map.size > nCandidates){
					let n_cands_needed = cand_map.size;
					// add a new candidate, then expand the ballow object
					for(let c = nCandidates; c < n_cands_needed; c++){
						candidates[String.fromCharCode(c+65)] = {'votes':0, 'active':true};
					}
					genBallotObjRec(ballots, "", Object.keys(candidates));
					nCandidates = n_cands_needed;
					if(nCandidates > nCandMax){
						alert("Too many candidates. Demo not currently setup to handle that many candidates");
						return;
					}
				}

				// convert file preferences to ABC_code:
				let p_code = "";
				// convert prefs to p_code:
				for(let c of prefs){
					p_code += cand_map.get(c);
				}

				// if ballots already has an entry for p_code, update it, otherwise store as new
				if(ballots[p_code]){
					ballots[p_code] += parseInt(line.match(/\d+$/m));
				} else {
					ballots[p_code] = parseInt(line.match(/\d+$/m));
				}
			}

			// need to check the number of candidates
			if(nCandidates != $("#candidate-selects").find("label").length){
				build_ballot_table();
			}

			// fill the ballot table with the loaded ballots
			fill_ballot_table();
		}).catch(error => console.log(error));
	}
}

// break a long string into a list of nl separated strings
function get_lines(long_string){
	var line = "";
	var str_lines = [];
	var i = 0;

	for(char of long_string){
		line = line + char;
		if(char == '\n'){
			str_lines[i] = line;
			line = "";
			i++;
		}
	}
	str_lines[i] = line;
	return str_lines;
}

function read_content(file){
	const reader = new FileReader();
   
	return new Promise((resolve, reject) => {
		// first setup the onEvent functions:
		reader.onload = event => resolve(event.target.result)
		reader.onerror = error => reject(error)
		// then read the file as text:
		reader.readAsText(file)
	})
}

function place_content(target, file){
	read_content(file).then(content => {
		console.log("now placing the content in "+target)
		//content = content.replaceAll("\n\n", '\n')
		lines = get_lines(content);
		target.innerHTML = lines[3];
		console.log(lines[3])

	}).catch(error => console.log(error))
}


//document.getElementById("file-input").addEventListener("change", process_ballot_file)
genCandidates();
generateBallots(true);
//votesUpdate();
sim_election_2();

// TODO: add table/list to display the ABC..-> candidate mapping from file