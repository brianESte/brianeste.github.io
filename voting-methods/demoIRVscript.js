
var votes = {'ABC':0, 'ACB':0, 'A':0,
						 'BAC':0, 'BCA':0, 'B':0,
						 'CAB':0, 'CBA':0, 'C':0};
var candidates = {'A':{'votes':0, 'active':true},
									'B':{'votes':0, 'active':true},
									'C':{'votes':0, 'active':true}};

// no longer used, will likely delete
var fields = [$("#pABC"), $("#pACB"), $("#pA"),
							$("#pBAC"), $("#pBCA"), $("#pB"),
							$("#pCAB"), $("#pCBA"), $("#pC")];

// update the total number of voters
function updateTotal(){
	var sum = 0;
	for(const pOrder in votes){
		sum += votes[pOrder];
	}
	$("#nVoter").html(sum)
}


// election function/loop
function simElection(){
	// clear background formatting
	$("#tally-rounds td,th").css("background","#00cc99");
	for(const c in candidates){
		candidates[c].active = true;
	}

	// for each runoff round...
	for(var r = 1; r < 3; r++){
		// step 0: clear vote totals
		for(const c in candidates){
			candidates[c].votes = 0;
		}
		
		// first tally the votes
		for(const vGroup in votes){
			var currRank = 0;
			var currPref = candidates[vGroup[currRank]];
			
			// if the top preference isnt active, cycle to the next active one
			while(Boolean(currPref) && !currPref.active){
				currPref = candidates[vGroup[++currRank]];
			}
			if(Boolean(currPref)){
				currPref.votes += votes[vGroup];
			}
		}

		// then display the vote totals
		for(const c in candidates){
			if(candidates[c].active){
				$(".c"+c+".Rd"+r).text(candidates[c].votes);
			} else {
				$(".c"+c+".Rd"+r).text("");
			}
		}
		
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
			if(!candidates[c].active){
				continue;
			}
			if(candidates[c].votes < candidates[lowCand].votes){
				lowCand = c;
			}
		}
		candidates[lowCand].active = false;
		$(".c"+lowCand+".Rd"+r).css("background","#ff3300");
	}
}

// update the vote counts and total
var update = self => {
	var val = parseInt(self.value);
	if(isNaN(val) || val < 0){
		val = 0;
		self.value = val;
	}
	votes[self.id.slice(1)] = val;
	updateTotal();
}


for(const vote in votes){
	votes[vote] = parseInt($("#p"+vote).val());
}

updateTotal();
simElection();

