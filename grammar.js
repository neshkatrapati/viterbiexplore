grammars = {
	'simple' : {
		'rules' : {
			'S' : [[ 'NP', 'VP' ]],
			'NP'  : [[ '@DT', '@NN' ], [ '@NN' ]],
			'VP' : [['@V',  'NP'], ['@V']]

		},
		'terminals' : {
			'NN' : ['book', 'books'],
			'DT' : ['a', 'the'],
			'V' : ['book', 'books']
		}
	},
	'first' : {
		'rules' : {
			'S' : [['NP', 'VP'], ['@Aux', 'NP', 'VP']],
			'VP' : [['@V', 'NP'], ['VP PP']],
			'NP' : [['@DT', '@NN'], ['@NN']],
			'PP' : [['@P', 'NP']]
		},
		'terminals' : {
			'NN' : ['workers', 'dumps', 'dump', 'sack', 'sacks', 'bin', 'bins'],
			'V' : ['dumps', 'dump', 'sack', 'sacks', 'bins', 'bin'],
			'P' : ['in', 'into', 'to'],
			'Aux' : ['is', 'has', 'does', 'do'],
			'DT' : ['the', 'a']
		}
	}

}
