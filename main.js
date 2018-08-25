model = {
    tokens : [],
    tags : [],
    transition : {},
    emission : {}
}


$('#viterbi_go').click(function (e) { 
   var sentence = sentence_input.value.split(' ');
   var viterbi_comps = "<table>";
   viterbi_comps += "<tr>";
   for(var j = 0; j < sentence.length; j++) {
       viterbi_comps += '<th>'+sentence[j]+'</th>';

   }
   viterbi_comps += "</tr>";
   for(var i=0; i < model.tags.length; i++){
    var tag = model.tags[i];
    viterbi_comps += "<tr>";
        for(var j = 0; j < sentence.length; j++) {
            viterbi_comps += '<td><a href="#" class="btn-floating btn-large waves-effect waves-light cyan lighten-1">'+tag+'</a></td>';

        }
    viterbi_comps += "</tr>";
   } 
   viterbi_comps += "<tr>";
   for(var j = 0; j < sentence.length; j++) {
       viterbi_comps += '<th>'+sentence[j]+'</th>';

   }
   viterbi_comps += "</tr>";
   viterbi_comps += "</table>";
   viterbi.innerHTML = viterbi_comps;
});


smooth_and_convert = function(counts, unigrams) {
    
    for( var key in counts ) {
        for ( var u in unigrams ) {
            var uni = unigrams[u];
            if (!(uni in counts[key])) {
                counts[key][uni] = 0;
            }
            counts[key][uni] += 1;
        }
    }
    var probs = {}
    for( var key in counts ) {
        var sum_count = Object.values(counts[key]).reduce((a, b) => a + b, 0);
        probs[key]={};
        for(var val in counts[key]){
            
            if(sum_count > 0){
                probs[key][val] = parseFloat(Math.log((parseFloat(counts[key][val]) / sum_count)).toFixed(2));
                
            } else {
                probs[key][val] = 0;
            }
        }
    }

    return probs;
}



process_corpus = function(corpus) {
    var sentences = corpus.split('\n');
    var tokens = [];
    var tags = [];
    var emission = {};
    var transition = {};
    var prev_tag = '@ST';
    tags.push(prev_tag);
    for (let index = 0; index < sentences.length; index++) {
        var sentence = sentences[index].split(' ');
        for (let jindex = 0; jindex < sentence.length; jindex++) {
            if (sentence[jindex].trim().length > 0){
                var token_tag = sentence[jindex].split('/');
                var token = token_tag[0];
                var tag = token_tag[1];
                if ($.inArray(tag, tags) < 0){
                    tags.push(tag);
                } 
                if ($.inArray(token, tokens) < 0){
                    tokens.push(token);
                }
                
                if (!(tag in emission)){
                    emission[tag] = {}
                }
                if (!(token in emission[tag])) {
                    emission[tag][token] = 0;
                } 
                emission[tag][token] += 1;
                
                if(!(prev_tag in transition)) {
                    transition[prev_tag] = {};
                }
                if(!(tag in transition[prev_tag])){
                    transition[prev_tag][tag] = 0;
                }
                transition[prev_tag][tag] += 1;
                prev_tag = tag;
            }                         
        }
        prev_tag = '@ST';
    }
    emission = smooth_and_convert(emission, tokens);
    transition = smooth_and_convert(transition, tags);
    model.emission = emission;
    model.transition = transition;
    update_tokens_tags(tokens, tags);
    update_emission_table();
    update_transition_table();
}


fetch_corpus = function (corpus_file) {
    fetch (corpus_file).then((resp)=> resp.text())
    .then(function (data) {
        process_corpus(data);
    }).catch(function (param) {
        console.log("Couldn't fetch that file !!");
    })
}


update_tokens_tags = function (tokens, tags) {
    model.tokens = tokens;
    model.tags = tags;
    token_list.value = tokens.join(',');
    tags_list.value = tags.join(',');
}

update_transition_table = function () {
    var transition_table = '<table class="striped">';
    transition_table += "<tr>";
    transition_table += "<th>P(ti|ti-1)</th>";
    for (let index = 0; index < model.tags.length; index++) {
        transition_table += "<th>" + model.tags[index] + "</th>";   
    }
    transition_table += "</tr>";
    for (let index = 0; index < model.tags.length; index++) {
        transition_table += '<tr>';
        transition_table += "<td>" + model.tags[index] + "</td>";   
        var current_tag = model.tags[index];
        for (let jindex = 0; jindex < model.tags.length; jindex++) {
            var dval = 0.0;
            var prev_tag = model.tags[jindex];
            if ((prev_tag in model.transition) && (current_tag in model.transition[prev_tag])) {
                dval = model.transition[prev_tag][current_tag];
            }
            transition_table += "<td><input type='text' value='"+dval+"'></td>";   
        }
        transition_table += '</tr>';
    }
    transition_table += '</table>';
    transition_reg.innerHTML = transition_table;
}

update_emission_table = function () {
    // Highlight highest
    var emission_table = '<table class="striped">';
    emission_table += "<tr>";
    emission_table += "<th>P(wi|ti)</th>";
    for (let index = 0; index < model.tags.length; index++) {
        emission_table += "<th>" + model.tags[index] + "</th>";   
    }
    emission_table += "</tr>";
    for (let index = 0; index < model.tokens.length; index++) {
        emission_table += '<tr>';
        emission_table += "<td>" + model.tokens[index] + "</td>";   
        var token = model.tokens[index];
        for (let jindex = 0; jindex < model.tags.length; jindex++) {
            var tag = model.tags[jindex];
            var dval = 0.0;
            if ((tag in model.emission) && (token in model.emission[tag])) {
                dval = model.emission[tag][token];
            }
            emission_table += "<td><input type='text' value='"+dval+"'></td>";   
        }
        emission_table += '</tr>';
    }
    emission_table += '</table>';
    emission_reg.innerHTML = emission_table;
}


$('#tokens_tags_update').click(function (e) { 
    var tokens = token_list.value.split(',');
    var tags = tags_list.value.split(',');
    update_tokens_tags(tokens,tags);
    update_transition_table();
    update_emission_table();
});

$('#load_corpus').click(function (e) { 
    fetch_corpus(corpora.value);
});