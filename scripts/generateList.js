'use strict';

const generators = require('./generators');
const getAuthor = generators.authorGenerator,
    getBookTilte = generators.bookTitleGenerator,
    getBookGenre = generators.bookGenreGenerator,
    getDate = generators.dateGenerator;

class Book {
    constructor() {
        this.author = getAuthor();
        this.title = getBookTilte();
        this.genre = getBookGenre();
        this.published = getDate();
    }
}

module.exports = () => number => Array(number).fill().map(() => new Book());
