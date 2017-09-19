
grammar = {};
cnfGrammar = {}; 
grammarMap = {};
terminals = {}; 
sentence = [];
cykCells = [];
cykState = [0, 0];
cykStep = 1; 


//document.getElementById('grmselect').onload = function() {
$('#grmselect').append('<option value="">--Select--</option>');
for(grammar_name in grammars){
	$('#grmselect').append('<option value="'+grammar_name+'">'+grammar_name+'</option>');
}

$('#grmselect').change(function(event) {
	val = $(this).val();
	grammar = {};
	cnfGrammar = {};
	if (val != undefined) {
		g = grammars[val].rules;		
		grammar = $.extend(true, {}, g);
		terminals = $.extend(true, {}, grammars[val].terminals);
		cnfGrammar = $.extend(true, {}, g);
		convertToCNF();
		showGrammar();
	}
});
//}




inArray = function(element, array) {
	el  = JSON.stringify(element);
	for(e in array) {
		if (el == JSON.stringify(array[e])) {
			return true;
		}
	}
	return false; 
}


isNonTerminal = function(symbol, grammar) {
	if (symbol in grammar) {
		return true;
	} else if (symbol.slice(0, 1) == '@') { // Explicit Declaration of Nonterminals 
		return true;
	}
	return false;
}


convertRuleToCNF = function(rule_lhs, grammar){

	for (r in grammar[rule_lhs]) {
		rule_rhs = grammar[rule_lhs][r];
		status = false;
		for(ps in rule_rhs) {
			if (rule_rhs[ps].slice(0,1) == '@') {
				terminal = rule_rhs[ps].slice(1, rule_rhs[ps].length);
				if ((terminal in terminals) == false){
					terminals[terminal] = [];
				}
			}
		}
		if (rule_rhs.length == 1) { // A -> B; B -> c; Changes to A -> c;
			if (rule_rhs[0] in grammar) {
				grammar[rule_lhs].splice(r);				
				target_productions = grammar[rule_rhs[0]];
				for(p in target_productions) {
					if(inArray(target_productions[p],cnfGrammar[rule_lhs]) == false){
						new_index = grammar[rule_lhs].push(target_productions[p]);	
						new_index = new_index-1;
						grammarMap[rule_lhs +'.'+new_index] = rule_rhs[0]+'.'+p;
					}
				}	

				convertRuleToCNF(rule_lhs, grammar);
				
			} else {
				status = true;
			}

		} else if (rule_rhs.length == 2) {
			new_rule  = [];
			for(pos in rule_rhs) { // A -> xy => A -> XY
				
				if (isNonTerminal(rule_rhs[pos], grammar) == false){
					
					console.log(rule_lhs, rule_rhs[pos]);
					non_terminal_len = Object.keys(grammar).length;
					new_non_terminal = 'X'+(non_terminal_len+1);
					new_rule[pos] = new_non_terminal;
					cnfGrammar[new_non_terminal] = [[rule_rhs[pos]]];
					if ((rule_lhs + '.' + r) in grammarMap) {
						grammarMap[new_non_terminal + '.' + r] = grammarMap[rule_lhs + '.' + r];	
					} else {
						grammarMap[new_non_terminal+'.'+0] = rule_lhs + '.' + r;
					}

				} else {
					new_rule[pos] = rule_rhs[pos];
				}				
			}
			
			//rule_rhs = new_rule;
			grammar[rule_lhs][r] = new_rule;
			if ((rule_lhs + '.' + r) in grammarMap) {
				grammarMap[rule_lhs + '.' + r] = grammarMap[rule_lhs + '.' + r];	
			} 
			else {
				grammarMap[rule_lhs+'.'+r] = rule_lhs+'.'+r;
			
			}
		
		} else if (rule_rhs.length > 2) {

			first_part = rule_rhs.slice(0, 1);
			next_part = rule_rhs.slice(1, rule_rhs.length);
			new_non_terminal = 'X' + (Object.keys(grammar).length + 1)
			grammar[new_non_terminal] = [next_part];
			new_rule = [first_part[0], new_non_terminal];
			grammar[rule_lhs][r] = new_rule;
			if ((rule_lhs + '.' + r) in grammarMap) {
				grammarMap[new_non_terminal+'.'+0] = grammarMap[rule_lhs + '.' + r];	
			} else {
				grammarMap[rule_lhs+'.'+r] = rule_lhs + '.' + r;
				grammarMap[new_non_terminal+'.'+0] = rule_lhs + '.' + r;	
			}

			convertRuleToCNF(new_non_terminal, grammar);

		}

	}
}
convertToCNF = function() {
	//terminals = {};
	cnfGrammar = $.extend(true, {}, grammar);
	for(rule_lhs in cnfGrammar){
		//cnfGrammar[rule_lhs] = grammar[rule_lhs];
		convertRuleToCNF(rule_lhs, cnfGrammar);
	}
}


processGrammar = function(grammar) {
	grammar_text = $('#grm_edit_ta').val();
	grammar_lines = grammar_text.split('\n');
	//grammar = grammar_lines;
	grammar = {};
	for (grammar_rid in grammar_lines) {
		grammar_rule = grammar_lines[grammar_rid];
		if (grammar_rule.length > 0) {
			grammar_components = grammar_rule.split('->');
			rule_lhs = grammar_components[0].trim();
			rule_rhs = grammar_components[1].trim().split(' ');
			//grammar.push([rule_lhs,rule_rhs]);
			if ((rule_lhs in grammar) == false) {
				grammar[rule_lhs] = [];
			}
			grammar[rule_lhs].push(rule_rhs);
		}
	}
	convertToCNF();
}

showGrammarInTextArea = function() {
	gtext = "";
	for (rule_lhs in grammar) {
		//console.log(rule_lhs);
		if(rule_lhs != undefined){
			for(r in grammar[rule_lhs]) {					
				rule_rhs = grammar[rule_lhs][r];

				if (rule_rhs != undefined){
					gtext += rule_lhs + " -> " + rule_rhs.join(' ') + "\n";

				}
			}
		}
	}
	$('#grm_edit_ta').val(gtext);
	//document.getElementById('grm_edit').innerText = gtext;
	//document.getElementById('grm_edit').contentEditable=true;
}

showGrammar = function () {
	$('#grm_view').html('<li class="list-group-item list-group-item-primary">Non-CNF Rules</li>');
	$('#cnf_view').html('<li class="list-group-item list-group-item-primary">CNF Rules</li>');
	for (rule_lhs in grammar) {
		// statement
		for(r in grammar[rule_lhs]){
			rule_rhs = grammar[rule_lhs][r];
			rule = rule_lhs + " -> " + rule_rhs.join(' ');
			$('#grm_view').append('<li class="list-group-item list-group-item-action grmrule" id="G'+rule_lhs+'.'+r+'".>'+rule+'</li>');		
		}
	}
	for (rule_lhs in cnfGrammar) {
		// statement
		for(r in cnfGrammar[rule_lhs]){
			rule_rhs = cnfGrammar[rule_lhs][r];

			rule = rule_lhs + " -> " + rule_rhs.join(' ');
			$('#cnf_view').append('<li class="list-group-item list-group-item-action cnfrule" id="'+rule_lhs+'.'+r+'".>'+rule+'</li>');		
		}
	}
	
	showTerminals();

	$('.cnfrule').click(function(event) {
		grmFrom = grammarMap[$(this).attr('id')];
		$('.grmrule').removeClass('list-group-item-danger');
		$('#G'+grmFrom.replace('.', '\\.')).addClass('list-group-item-danger');
	});
}


showTerminals = function() {
	$('#twords').html("");
	for(terminal in terminals) {
		val = terminals[terminal].join(',');

		$('#twords').append('<li class="list-group-item list-group-item-action"><div class="input-group"><span class="input-group-addon">'+terminal+'</span><input class="terminp" style="width:100%" id="T'+terminal+'" type="text" value="'+val+'"/></div></li>');

	}
}

$('#view_edit').click(function() {
	state = $('#view_edit').attr('data-state');
	if (state == 'view') {
		$('#grm_edit').show();		
		showGrammarInTextArea();
		$('#grm_view').hide();
		
		state = 'edit';
		$('#view_edit').html('Save & View');

	} else {
		processGrammar(grammar);
		showGrammar();
		$('#grm_view').show();
		$('#grm_edit').hide();
		state = 'view';
		$('#view_edit').html('Edit');
	}
	$('#view_edit').attr('data-state', state);
});

$('#parse').click(function(event) {
	cykCells = [];
	$('#cykarea').html('');	
	$('#control-panel').show();
	text = $('#sentence').val();
	words = text.split(' ');
	sentence = words;
	html = "<div id='splits' class='container'></div>";
	html += "<table class='table'>";
	for (i = 0; i < words.length; i++){
			html += '<th>'+words[i]+'('+i+')</th>';
			
	}
	for (i = 0; i < words.length; i++){
		//html += '<div class="row">';
		html += '<tr>';
		cykCells.push([]);
		for(j = 0; j < words.length; j++){
			cykCells[i].push([]);
			if (j < i) {
				html += '<td></td>';
			} else {
				html += '<td><div class="card cyktile"><div class="card-body" style="padding:0" id="c'+i+'-'+j+'"></div><div class="card-footer">'+i+'-'+j+'<button class="btn badge badge-primary splitshow" data-id="c'+i+'-'+j+'" type="button" style="float:right">S</button></div></div></td>';
			}
		}
		//html += '</div>';
		html += '</tr>';
	}
	html += "</table>";
	$('#cykarea').html(html);

	$('.splitshow').click(function(event) {
		$('#splits').html('');
		data_id = $(this).attr('data-id');
		ids = data_id.slice(1, data_id.length).split('-');
		start = parseInt(ids[0]);
		end = parseInt(ids[1]);
		html = "<div class='col-md-12'>";
		for( i = start; i < end + 1; i++) {
			if ((i < end) || (start == end)){
				html += "<div class='row' style='margin-left:20%;'>";
				console.log(start, i, i+1, end);
				for(wid in words) {
					ac = '';
					if (wid >= start && wid <= i){
						ac = 'bg-warning';
					}
					else if (wid >= i && wid <= end) {
						ac = 'bg-danger';
					}
					html += "<span style='margin:0.5%;' class='"+ac+"'>"+words[wid]+"</span>";
				}
				html += "</div>";
			}
		}
		html += "</div>";
		$('#splits').html(html);
		//cykcell = $('#'+data_id);
		//console.log(cykcell);
	});
});


getTerminals = function() {
	elements = $('.terminp');
	for(eid =0; eid < elements.length; eid ++) {
		element = elements[eid];
		console.log(elements, eid);
		term = element.id.slice(1, element.id.length);
		if(element.value.length > 0) {
			values = element.value.split(',');
			terminals[term] = values;
		}
	}
}

getTerminalRules = function(word) {
	terminal_rules = [];
	for(term in terminals) {
		for (v in terminals[term]) {
			if (word.trim() == terminals[term][v].trim()) {
				terminal_rules.push(term);	
			}
		}
		//if (word in terminals[term]) {
		//	terminal_rules.push(term);
		//}
	}
	return terminal_rules;
}

showRules = function(rules, state) {
	cell = $('#c'+state[0]+'-'+state[1]);
	cell.html('');
	html = '<ul class="list-group list-group-flush">';
	for(r =0; r < rules.length; r++) {
		rl = rules[r];
		html += '<li class="list-group-item">' + rl[0] + ' -> ' + rl[1].join(' ') + '</li>';
	}
	html += "</ul>";
	cell.html(html);
}


getFollowUpRules = function(rule) {
	var rules = [];
	rjson = JSON.stringify(rule);
	for(rule_lhs in cnfGrammar) {
		for(i =0; i< cnfGrammar[rule_lhs].length; i++) {
			rxjson = JSON.stringify(cnfGrammar[rule_lhs][i]);

			if(rjson == rxjson) {

				rules.push([rule_lhs, rule]);
				console.log(rules);
				fxrules = getFollowUpRules([rule_lhs]);
				for(j =0; j < fxrules.length; j++){
					rules.push(fxrules[j]);
				}
				//rules = rules.concat(fxrules);
			}
		}
	}
	return rules;
}

$('#next').click(function(event) {
	if(cykState[0] == cykState[1]) { 
		getTerminals();		
		word = sentence[cykState[0]];
		terminal_rules = getTerminalRules(word);
		rules = []
		for(t in terminal_rules) {
			rules.push([terminal_rules[t], [word]]);
			fxrules = getFollowUpRules(['@'+terminal_rules[t]]);
			for(j =0; j < fxrules.length; j++){
				rules.push(fxrules[j]);
			}
		}
		showRules(rules, cykState);	
		
		cykCells[cykState[0]][cykState[1]] = rules;
	}
	if (cykState[1] >= sentence.length - 1) {
		cykState[0] = 0;
		cykState[1] = cykStep;
		cykStep += 1;
	} else {
		cykState[0] += 1;
		cykState[1] += 1;
	}
});