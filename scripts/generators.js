'use strict';

const maleNames = require('fs').readFileSync(`${__dirname}/../data/maleNames.txt`).toString().split('\n'),
    lastnames = require('fs').readFileSync(`${__dirname}/../data/lastnames.txt`).toString().split('\n'),
    femaleNames = require('fs').readFileSync(`${__dirname}/../data/femaleNames.txt`).toString().split('\n'),
    bookGenres = require('fs').readFileSync(`${__dirname}/../data/bookGenres.txt`).toString().split('\n'),
    nouns = require('fs').readFileSync(`${__dirname}/../data/nouns.txt`).toString().split('\n'),
    adjectives = require('fs').readFileSync(`${__dirname}/../data/adjectives.txt`).toString().split('\n'),
    maleListLength = maleNames.length,
    lastnamesLength = lastnames.length,
    femaleNamesLength = femaleNames.length,
    nounsLength = nouns.length,
    adjectivesLength = adjectives.length,
    forms = [
        () => `${adjectives[parseInt(Math.random() * adjectivesLength, 10)]} ${nouns[parseInt(Math.random() * nounsLength, 10)]}`,
        () => `The ${adjectives[parseInt(Math.random() * adjectivesLength, 10)]} of ${nouns[parseInt(Math.random() * nounsLength, 10)]}`,
        () => `${nouns[parseInt(Math.random() * nounsLength, 10)]} of ${nouns[parseInt(Math.random() * nounsLength, 10)]}`,
        () => `The ${nouns[parseInt(Math.random() * nounsLength, 10)]} 's ${nouns[parseInt(Math.random() * nounsLength, 10)]}`,
        () => `The ${nouns[parseInt(Math.random() * nounsLength, 10)]} of the ${nouns[parseInt(Math.random() * nounsLength, 10)]}`,
        () => `${nouns[parseInt(Math.random() * nounsLength, 10)]} in the ${nouns[parseInt(Math.random() * nounsLength, 10)]}`
    ];



module.exports = {

    /* GENERATE AUTHOR - OBJECT */
    authorGenerator() {
        let name;
        const gender = ['M', 'F'][Math.round(Math.random())];

        if (gender === 'M') {
            name = maleNames[parseInt(Math.random() * maleListLength, 10)];
        } else if (gender === 'F') {
            name = femaleNames[parseInt(Math.random() * femaleNamesLength, 10)];
        }

        name += ` ${lastnames[parseInt(Math.random() * lastnamesLength, 10)]}`;
        return {
            name,
            gender
        };
    },

    /* GENERATE BOOK TITLE - STRING */
    bookTitleGenerator: () => forms[parseInt(Math.random() * forms.length, 10)](),

    /* GENERATE BOOK GENRE - STRING */
    bookGenreGenerator: () => bookGenres[parseInt(Math.random() * bookGenres.length, 10)],

    /* GENERATE DATE - DATE OBJECT */
    dateGenerator: () => {
        const start = new Date(1200, 0, 1),
            end = new Date();

        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).getTime();
    }

};
