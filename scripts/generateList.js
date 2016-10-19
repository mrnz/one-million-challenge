'use strict'
var generators = require('./generators'),
		getAuthor = generators.authorGenerator(),
		getBookTilte = 	generators.bookTitleGenerator(),
		getBookGenre = 	generators.bookGenreGenerator(),
		getDate = generators.dateGenerator();

module.exports = function() {

	return function( number ) {
		
		class Book {

		  constructor() {

		    this.author = getAuthor.next().value;
		    
		    this.title = getBookTilte.next().value;
		    
		    this.genre = getBookGenre.next().value;

		    this.published = getDate.next().value;;

		  }
		 
		};
		
		return Array( number ).fill().map( x => new Book() );

	};
	
};