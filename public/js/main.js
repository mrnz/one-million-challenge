/* eslint-env browser */
/* eslint no-use-before-define: ["error", { "variables": false }] */
/* eslint no-confusing-arrow: ["error", {"allowParens": true}] */
/* eslint no-unused-vars: 0 */

'use strict';

const Controll = class {

    constructor(handlesObject) {

    /* PRIVATE START */
        const sortAttrName = 'data-sort',
            handles = {},
            sortMemo = {
                author: false,
                title: false
            };

        /* handles */
        handles.startButton = document.getElementById(handlesObject.startButton);
        handles.itemsAmount = document.getElementById(handlesObject.itemsAmount);
        handles.filterGenre = document.getElementById(handlesObject.filterGenre);
        handles.filterGender = document.getElementById(handlesObject.filterGender);
        handles.filterHalloween = document.getElementById(handlesObject.filterHalloween);
        handles.filterFinance = document.getElementById(handlesObject.filterFinance);
        handles.sortAuthor = document.getElementById(handlesObject.sortAuthor);
        handles.sortTitle = document.getElementById(handlesObject.sortTitle);

        /* helper fiunctions*/
        const resetFilters = () => {
            handles.filterGenre.selectedIndex = 0;
            handles.filterGender.selectedIndex = 0;
            handles.filterHalloween.checked = false;
            handles.filterFinance.checked = false;
        };

        const resetSortIcons = () => {
            handles.sortAuthor.removeAttribute(sortAttrName);
            handles.sortTitle.removeAttribute(sortAttrName);
        };

        const ajaxCall = (amount, callback) => {

            const request = new XMLHttpRequest(),
                wl = window.location,
                url = `http://${wl.hostname}:${wl.port}/api/generateBooks/${amount}`;
            let response;

            request.open('GET', url, true);

            request.onreadystatechange = () => {

                if (request.readyState !== 4 || request.status !== 200) {
                    return;
                }

                response = JSON.parse(request.responseText);
                callback(response);
            };

            request.send();
        };

        /*
            TABLE Object
        */
        const tableAPI = (() => {

            /* settings */
            const itemHeight = 30,
                wrapperHeight = 400,
                itemInSet = 100;

            /* variables */
            let memo = 0,
                actualSetNumber = 1,
                result,
                totalItems,
                listTotlaHeight;

            /* handles */
            const wrapper = document.getElementById('wrapper'),
                head = document.getElementById('head'),
                tail = document.getElementById('tail'),
                center = document.getElementById('center'),
                rest = document.getElementById('rest');

            /* helper functions */
            const setHeadHeight = newHeight => {
                    head.style.height = `${newHeight}px`;
                },
                setTailHeight = newHeight => {
                    tail.style.height = `${newHeight}px`;
                },
                getLimitTop = () => itemHeight * itemInSet * actualSetNumber - wrapperHeight,
                getLimitBottom = () => itemHeight * itemInSet * (actualSetNumber - 1),
                getActualSetNumber = () => Math.ceil((wrapper.scrollTop + wrapperHeight) / (itemInSet * itemHeight)),
                isThisLastSet = () => actualSetNumber === Math.ceil((scrollUpLimit + wrapperHeight) / (itemInSet * itemHeight));

            /* Calculated */
            let scrollUpLimit = listTotlaHeight - wrapperHeight,
                actualTopLimit = getLimitTop(),
                actualBottomLimit = getLimitBottom();

            /* SORT START */
            const sort = (fieldName, direction) => {

                let compareFunction,
                    getFieldValueFunction;
                const map = [],
                    res = [],
                    list = result;

                // eslint-disable-next-line no-console
                console.time('sorting');

                wrapper.scrollTop = 0;
                actualSetNumber = 1;

                if (fieldName === 'author') {

                    getFieldValueFunction = item => item.author.name.toLowerCase();

                } else if (fieldName === 'title') {

                    getFieldValueFunction = item => item.title.toLowerCase();

                }

                if (direction) {
                    compareFunction = (a, b) => (a.value < b.value ? 1 : -1);
                } else {
                    compareFunction = (a, b) => (a.value > b.value ? 1 : -1);
                }

                for (let i = 0, length = list.length; i < length; i++) {
                    map.push({
                        index: i, // remember the index within the original array
                        value: getFieldValueFunction(list[i]) // evaluate the element
                    });
                }

                // sorting the map containing the reduced values
                map.sort((a, b) => compareFunction(a, b));

                // copy values in right order
                for (let i = 0, length = map.length; i < length; i++) {
                    res.push(list[map[i].index]);
                }

                // eslint-disable-next-line no-console
                console.timeEnd('sorting');

                result = res;

                if (totalItems === 0) {
                    generateEmptyTable();
                } else if (totalItems < itemInSet) {
                    generateDOM(true);
                } else {
                    generateDOM();
                }

            };/* SORT END */



            /* FILTER START */
            const filter = (fieldName, fieldValue) => {

                /* if empty make copy of all result */
                if (filter.memo.allresult === null) {
                    filter.memo.allresult = result.map(val => Object.assign(val));
                }

                filter.memo[fieldName] = fieldValue;
                const newResult = filter.memo.allresult.filter(val => filter.conditions.genre(val) && filter.conditions.gender(val) && filter.conditions.halloween(val) && filter.conditions.finance(val));

                init(newResult);

            };

            filter.memo = {
                allresult: null,
                genre: null,
                gender: null,
                halloween: null,
                finance: null
            };

            filter.halloweenCheck = val => {

                /* check first if genre is a Horror */
                if (val.genre !== 'Horror') {
                    return false;
                }
                const date = new Date(val.published);

                /* check if month is October ( month index base 0 so 10-1 === 9 )  */
                if (date.getMonth() !== 9) {
                    return false;
                }

                /* check if day is 31  */
                if (date.getDate() !== 31) {
                    return false;
                }

                return true;
            };

            filter.financeCheck = val => {

                /* check first if genre is a Horror */
                if (val.genre !== 'Finance') {
                    return false;
                }

                const date = new Date(val.published),
                    thisday = date.getDate(),
                    lastDayOfMonth = new Date(date.getUTCFullYear(), date.getMonth() + 1, 0),
                    diff = lastDayOfMonth.getDate() - thisday;

                if (diff > 6 || diff < 0) {
                    return false;
                }

                if (date.getDay() !== 5) {
                    return false;
                }

                return true;
            };

            filter.conditions = {
                genre: val => (filter.memo.genre === null ? true : val.genre === filter.memo.genre),
                gender: val => (filter.memo.gender === null ? true : val.author.gender === filter.memo.gender),
                halloween: val => (filter.memo.halloween === null ? true : filter.halloweenCheck(val)),
                finance: val => (filter.memo.finance === null ? true : filter.financeCheck(val))
            };

            filter.reset = () => {
                filter.memo.allresult = null;
                filter.memo.genre = null;
                filter.memo.gender = null;
                filter.memo.halloween = null;
                filter.memo.finance = null;
            };/* FILTER END */





            /* GENERATOR */
            const generateEmptyTable = () => {
                setHeadHeight(0);
                setTailHeight(0);
                center.innerHTML = '<div class="item item-centered"> No results </div>';
            };

            const generateRows = (firstIndex, amount, whereToInsert) => {
                let html = '';

                Array(amount).fill().forEach((x, idx) => {

                    const index = idx + firstIndex,
                        authorName = result[index].author.name,
                        authorGender = result[index].author.gender,
                        title = result[index].title,
                        genre = result[index].genre,
                        published = new Date(result[index].published).toJSON(2).slice(0, 10);

                    html += `<div class="item"><span>${index + 1}</span><span>${authorName}</span><span>${authorGender}</span><span>${title}</span><span>${genre}</span><span>${published}</span></div>`;

                });

                whereToInsert.innerHTML = html;
            };


            const generateDOM = lastSet => {

                let tailheight = listTotlaHeight - actualSetNumber * itemHeight * itemInSet;
                const firstIndex = (actualSetNumber - 1) * itemInSet,
                    headHeight = (actualSetNumber - 1) * itemInSet * itemHeight,
                    itemsLeft = result.length % itemInSet === 0 ? itemInSet : result.length % itemInSet,
                    firstSet = actualSetNumber === 1,
                    itemsAmmountToRenderInFirstSet = result.length < itemInSet ? result.length : itemInSet;

                if (lastSet) {
                    tailheight = 0;
                }

                setHeadHeight(headHeight);

                if (headHeight > 0) {

                    /* if Head has some height generate additional rows in it  */
                    generateRows(firstIndex - 20, 20, rest);
                }

                /* generate rows in a center */

                if (lastSet) {
                    generateRows(firstIndex, itemsLeft, center);
                } else if (firstSet) {
                    generateRows(firstIndex, itemsAmmountToRenderInFirstSet, center);
                } else {
                    generateRows(firstIndex, itemInSet, center);
                }

                setTailHeight(tailheight);

            };/* GENERATOR END */


            /* INIT */
            const init = dataSet => {

                /* restart wrapper */
                wrapper.scrollTop = 0;
                center.inerHTML = '';
                rest.inerHTML = '';
                actualSetNumber = 1;
                result = dataSet;
                totalItems = dataSet.length;
                listTotlaHeight = totalItems * itemHeight;
                scrollUpLimit = listTotlaHeight - wrapperHeight;

                if (totalItems === 0) {
                    generateEmptyTable();
                } else if (totalItems < itemInSet) {
                    generateDOM(true);
                } else {
                    generateDOM();
                }

            };

            const start = dataset => {
                filter.reset();
                init(dataset);
            };/* INIT END */



            /* EVENT LISTENER ON SCROLLBAR */
            wrapper.addEventListener('scroll', () => {
                const actualPosition = wrapper.scrollTop;

                if (actualPosition > scrollUpLimit) {
                    return;
                }

                if (actualPosition > memo) {

                    /* UP */
                    if (actualPosition >= actualTopLimit) {
                        actualSetNumber = getActualSetNumber();
                        actualBottomLimit = getLimitBottom();

                        if (isThisLastSet()) {
                            actualTopLimit = 0;
                            generateDOM(true);
                            return;
                        }
                        actualTopLimit = getLimitTop();
                        generateDOM();
                    }
                } else if (actualPosition < memo) {

                    /* DOWN */
                    if (actualPosition <= actualBottomLimit) {
                        actualSetNumber = getActualSetNumber();
                        actualTopLimit = getLimitTop();
                        actualBottomLimit = getLimitBottom();
                        generateDOM();

                    }
                }
                memo = actualPosition;

            });/* EVENT LISTENER ON SCROLLBAR END*/

            /* PUBLIC API  */
            return {
                start,
                sort,
                filter
            };

        })();

        /* Table object end*/
        /*  PRIVATE END  */

        /* PUBLIC FUNCITONS */
        /* sort */
        this.sort = (fieldName, elementID) => {
            const elem = document.getElementById(elementID);

            resetSortIcons();
            elem.setAttribute(sortAttrName, sortMemo[fieldName]);
            tableAPI.sort(fieldName, sortMemo[fieldName]);
            sortMemo[fieldName] = !sortMemo[fieldName];
        };

        /* filter */
        this.filter = (filterName, filterValue) => {
            filterValue = filterValue === 'All results' ? null : filterValue;
            tableAPI.filter(filterName, filterValue);
        };

        /* special events */
        this.specialEvents = (eventName, eventValue) => {
            eventValue = eventValue ? eventValue : null;
            tableAPI.filter(eventName, eventValue);
        };

        /* DATA FORM SERVER*/
        this.requestData = () => {
            const itemsAmount = parseInt(handles.itemsAmount.value, 10),
                callback = response => {
                    tableAPI.start(response);
                    handles.startButton.disabled = false;
                    handles.startButton.innerText = 'Generate';
                };

            resetFilters();
            resetSortIcons();

            handles.startButton.disabled = true;
            handles.startButton.innerText = 'Loading ...';
            ajaxCall(itemsAmount, callback);
        };
    }
};
