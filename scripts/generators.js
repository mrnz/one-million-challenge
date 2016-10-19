'use strict'

var maleNames = require('fs').readFileSync(__dirname+'/../data/maleNames.txt').toString().split('\n'),
		lastnames = require('fs').readFileSync(__dirname+'/../data/lastnames.txt').toString().split('\n'),
		femaleNames = require('fs').readFileSync(__dirname+'/../data/femaleNames.txt').toString().split('\n'),
		bookGenres = require('fs').readFileSync(__dirname+'/../data/bookGenres.txt').toString().split('\n'),
		nouns = require('fs').readFileSync(__dirname+'/../data/nouns.txt').toString().split('\n'),
		adjectives = require('fs').readFileSync(__dirname+'/../data/adjectives.txt').toString().split('\n');

module.exports = {

	/* GENERATE AUTHOR - OBJECT */
	authorGenerator : function* (){

		var maleListLength = maleNames.length,
				lastnamesLength = lastnames.length,
				femaleNamesLength = femaleNames.length;

		while(true){
			let name,
					gender = ['M','F'][ Math.round( Math.random()) ];

			if( gender === 'M' ){
				name = 	maleNames[parseInt( Math.random() * maleListLength )];
			}else if(  gender === 'F' ){
				name = femaleNames[parseInt( Math.random() * femaleNamesLength )];
			}
			name += ' ' + lastnames[parseInt( Math.random() * lastnamesLength )];
			yield {
				name,
				gender
			}
		}
	},

	/* GENERATE BOOK TITLE - STRING */ 
	bookTitleGenerator: function* (){
		
		var forms,
				nounsLength = nouns.length,
				adjectivesLength = adjectives.length;
				
		forms = [
			() => adjectives[parseInt( Math.random() * adjectivesLength )] + ' ' + nouns[parseInt( Math.random() * nounsLength )],
			() => 'The ' + adjectives[parseInt( Math.random() * adjectivesLength )] + ' of ' + nouns[parseInt( Math.random() * nounsLength )],
			() => nouns[parseInt( Math.random() * nounsLength )] + ' of ' + nouns[parseInt( Math.random() * nounsLength )],
			() => 'The ' + nouns[parseInt( Math.random() * nounsLength )] + '\'s ' + nouns[parseInt( Math.random() * nounsLength )],
			() => 'The ' + nouns[parseInt( Math.random() * nounsLength )] + ' of the ' + nouns[parseInt( Math.random() * nounsLength )],
			() => nouns[parseInt( Math.random() * nounsLength )] + ' in the ' + nouns[parseInt( Math.random() * nounsLength )]
		];

		while(true){
			yield forms[parseInt( Math.random() * forms.length )]();
		}

	},

	/* GENERATE BOOK GENRE - STRING */ 
	bookGenreGenerator: function* (){
		var bookGenresLength = bookGenres.length;
		while(true){
			yield bookGenres[parseInt( Math.random() * bookGenresLength )];
		}
	},

	/* GENERATE DATE - DATE OBJECT */
	dateGenerator : function* () {
		var start = new Date(1200,0,1);
		var end = new Date();
		while(true){
			yield new Date(start.getTime() + Math.random() * ( end.getTime() - start.getTime() ) ).getTime();
		}
	}

};