/* Get data form server */
var Controll = function(handlesObject) {
	
	/* sorting private variables */
	var nameSort = false,
			titleSort = false,
			resetFilters,
			resetSortIcons,	
			/* handles */
			handles = {
				filterGenre : handlesObject.filterGenre,
				filterGender : handlesObject.filterGender,
				filterHalloween : handlesObject.filterHalloween,
				filterFinance : handlesObject.filterFinance,
				sortAuthor : handlesObject.sortAuthor,
				sortTitle : handlesObject.sortTitle
			}

	resetFilters = () => {
		document.getElementById( handles.filterGenre ).selectedIndex = 0;
		document.getElementById( handles.filterGender ).selectedIndex = 0;
		document.getElementById( handles.filterHalloween ).checked = false;
		document.getElementById( handles.filterFinance ).checked = false;
	};

	resetSortIcons = () => {
		document.getElementById( handles.sortAuthor ).removeAttribute( 'data-sort' );
		document.getElementById( handles.sortTitle ).removeAttribute( 'data-sort' );
	};

	/* SORT */
	this.sort = ( fieldName, elementID ) => {
	
		resetSortIcons();

		var elem = document.getElementById( elementID );

		var direction = ( fieldName === 'author' ) ? nameSort : titleSort;
		
		elem.setAttribute( 'data-sort', direction );

		tableAPI.sort(fieldName, direction)
		
		if(fieldName === 'author'){
			nameSort = !nameSort;
		}else if(fieldName === 'title'){
			titleSort = !titleSort;
		}		

	}

	/* FILTER */
	this.filter = ( element ) => {

		var fieldName = element.name,
				fieldValue = element.options[ element.selectedIndex ].text; 

		if(fieldValue === 'All results')fieldValue = null

		tableAPI.filter( fieldName, fieldValue)
	}	


	/* HALLOWEEN */
	this.specialEvents = ( eventName, value ) => {

		value = value ? value : null;
		tableAPI.filter(eventName, value)
		
		
	};



	/* DATA FORM SERVER*/
	this.requestData = ( inputID ) => {
			
		var itemsAmount = parseInt( document.getElementById( inputID ).value );

		var changeButtonState,
				req = new XMLHttpRequest(),
				wl = window.location,
				url = 'http://' + wl.hostname + ':' + wl.port + '/api/generateBooks/' + itemsAmount,
				btn = document.getElementById('requestData');

		resetFilters()
		resetSortIcons();
		
		changeButtonState = ( disable ) => {
			btn.disabled = disable;
			btn.innerText = disable ? "Loading ..." : "Generate table"
		};

		changeButtonState( true )

		req.open("GET", url, true);
		
		req.onreadystatechange = () => {
	  
	  	if (req.readyState != 4 || req.status != 200) return;

	  	res = JSON.parse(req.responseText);

	  	tableAPI.start(res);

			changeButtonState( false )

		};

		req.send();

	};

}


var tableAPI = (function() {

	/* settings */
	var itemHeight = 30,
			wrapperHeight = 400,
			itemInSet = 100;

	/* variables */
	var memo = 0,
			actualSetNumber = 1,
			result,
			totalItems,
			listTotlaHeight;

	/* handles */
	var wrapper = 	document.getElementById('wrapper'),
			head 		= 	document.getElementById('head'),
			tail 		= 	document.getElementById('tail'), 
			center 	= 	document.getElementById('center'),
			rest 		= 	document.getElementById('rest'); 
	
	/* helper functions */
	var setHeadHeight 				= ( newHeight ) => head.style.height = newHeight+'px',
			setTailHeight	 				= ( newHeight ) => tail.style.height = newHeight+'px',
			getLimitTop 					= () => itemHeight * itemInSet * actualSetNumber - wrapperHeight,
			getLimitBottom 				= () => itemHeight * itemInSet * (actualSetNumber -1 ),
			getActualSetNumber 		= () => Math.ceil ( ( wrapper.scrollTop + wrapperHeight ) / ( itemInSet * itemHeight ) );
			isThisLastSet					= () => actualSetNumber === Math.ceil ( ( scrollUpLimit + wrapperHeight ) / ( itemInSet * itemHeight ) );

	/* Calculated */
	var scrollUpLimit = listTotlaHeight - wrapperHeight,
			actualTopLimit = getLimitTop(),
			actualBottomLimit = getLimitBottom();


	/* FUNCITONS */
	var sort, filter, generateEmptyTable, generateRows, generateDOM, init, start;


	/* SORT START */			
	sort = ( fieldName, direction ) => {
		
		var direction, 
				compareFunction, 
				getFieldValueFunction, 
				map = [], 
				res = [], 
				list = result;

		console.time('sorting');

		if( fieldName === 'author' ){
			
			
			getFieldValueFunction = ( item ) => item.author.name.toLowerCase();

		}else if( fieldName === 'title' ){
			
			getFieldValueFunction = ( item ) => item.title.toLowerCase();

		}
		
		if(direction){
			compareFunction = (a,b) => a.value < b.value ? 1 : -1;
		}else{
			compareFunction = (a,b) => a.value > b.value ? 1 : -1;	
		}		
			
		for (var i=0, length = list.length; i < length; i++) {
		  map.push({
		    index: i, // remember the index within the original array
		    value: getFieldValueFunction( list[i] ) // evaluate the element
		  });
		}

		// sorting the map containing the reduced values
		map.sort(function(a, b) {
		  return compareFunction(a,b);
		});

		// copy values in right order
		for (var i=0, length = map.length; i < length; i++) {
		  res.push(list[map[i].index]);
		}

		console.timeEnd('sorting');

		result = res;
			
		if( totalItems === 0 ){
			generateEmptyTable()
		}else if(totalItems < itemInSet){
			generateDOM(true);	
		}else{
			generateDOM();	
		}

	};/* SORT END */



	/* FILTER START */
	filter = ( fieldName, fieldValue ) => {
		
		/* if empty make copy of all result */
		if( filter.memo.allresult === null ){
			filter.memo.allresult = result.map( val => Object.assign( val ) );	
		}

		filter.memo[fieldName] = fieldValue;
		
		newResult = filter.memo.allresult.filter( val => {
			return filter.conditions.genre(val) && filter.conditions.gender(val) && filter.conditions.halloween(val) && filter.conditions.finance(val); 
		});

		init( newResult );

	};

	filter.memo = {
		allresult: null,
		genre: null,
		gender: null,
		halloween: null,
		finance: null		
	};

	filter.halloweenCheck = ( val ) => {

		var date;
		/* check first if genre is a Horror */
		if( val.genre !== 'Horror')return false;

		date = new Date( val.published );
		
		/* check if month is October ( month index base 0 so 10-1 === 9 )  */
		if( date.getMonth() !== 9 )return false;

		/* check if day is 31  */
		if( date.getDate() !== 31 )return false;

		return true;

	};

	filter.financeCheck = ( val ) => {

		var date, thisday, lastDayOfMonth, diff;
		
		/* check first if genre is a Horror */
		if( val.genre !== 'Finance')return false;

		date = new Date( val.published );
		thisday = date.getDate();

		/* Get last day of this month in this year , 0 in a day position will subtract 1 day*/
		lastDayOfMonth = new Date( date.getUTCFullYear(), date.getMonth() + 1, 0)

		diff = lastDayOfMonth.getDate() - thisday; 

		if( diff > 6 || diff < 0 )return false; 

		if(date.getDay() !== 5)return false;

		return true;

	};

	filter.conditions = {
		genre: ( val ) => filter.memo.genre === null ? true : val.genre === filter.memo.genre,
		gender: ( val ) => filter.memo.gender === null ? true : val.author.gender === filter.memo.gender,
		halloween: ( val ) => filter.memo.halloween === null ? true : filter.halloweenCheck( val ),
		finance: ( val ) => filter.memo.finance === null ? true : filter.financeCheck( val )
	};

	filter.reset = () => {
		
		filter.memo.allresult = null;
		filter.memo.genre = null;
		filter.memo.gender = null;
		filter.memo.halloween= null;
		filter.memo.finance = null;	
		
	};/* FILTER END */





	/* GENERATOR */
	generateEmptyTable = () => {

		setHeadHeight( 0 );
		setTailHeight( 0 );
		center.innerHTML = '<div class="item centered"> No results </div>';
	};

	generateRows = ( firstIndex, amount, whereToInsert ) => {

		var html = '';

		Array( amount ).fill().forEach( ( x, idx )=>{
			
			var idx = idx + firstIndex,
					authorName = result[idx].author.name;
					authorGender = result[idx].author.gender;
					title = result[idx].title,
					genre = result[idx].genre,
					published = new Date( result[idx].published ).toJSON(2).slice(0,10);

			html += `<div class="item"><span>${idx+1}</span><span>${authorName}</span><span>${authorGender}</span><span>${title}</span><span>${genre}</span><span>${published}</span></div>`;

		});

		whereToInsert.innerHTML = html;

	};


	generateDOM = ( lastSet ) => {
		
		var firstIndex = ( actualSetNumber - 1 ) * itemInSet,
		 		headHeight = ( actualSetNumber - 1 ) * itemInSet * itemHeight,
				tailheight = listTotlaHeight - actualSetNumber  * itemHeight * itemInSet,
				itemsLeft = result.length % itemInSet === 0 ? itemInSet : result.length % itemInSet,
				firstSet = actualSetNumber === 1,
				itemsAmmountToRenderInFirstSet = result.length < itemInSet ? result.length : itemInSet;
		
		if( lastSet ){
			tailheight = 0;
		}

		setHeadHeight( headHeight );
		
		if( headHeight > 0 ){
			/* if Head has some height generate additional rows in it  */
			generateRows( firstIndex - 20 , 20, rest );	
		} 
		
		/* generate rows in a center */
		
		if( lastSet ){
			generateRows( firstIndex, itemsLeft, center );
		}else if( firstSet ){
			generateRows( firstIndex, itemsAmmountToRenderInFirstSet, center );
		}else{
			generateRows( firstIndex, itemInSet, center );
		}
		
		setTailHeight( tailheight );

	};/* GENERATOR END */





	/* INIT */
	init = (dataSet) => {

		/* restart wrapper */
		wrapper.scrollTop = 0;
		center.inerHTML = '';
		rest.inerHTML = '';	
		actualSetNumber = 1;
		result = dataSet;
		totalItems = dataSet.length;
		listTotlaHeight = totalItems * itemHeight;
		scrollUpLimit = listTotlaHeight - wrapperHeight;

		if( totalItems === 0 ){
			generateEmptyTable()
		}else if(totalItems < itemInSet){
			generateDOM(true);	
		}else{
			generateDOM();	
		}

	};

	start = ( dataset ) => {
		filter.reset();
		init(dataset)
	};/* INIT END */



	/* EVENT LISTENER ON SCROLLBAR */
	wrapper.addEventListener('scroll', () => {

		var actualPosition = wrapper.scrollTop;
		
		if( actualPosition > scrollUpLimit) return;
		
		if( actualPosition > memo ){
		/* UP */
			if( actualPosition >= actualTopLimit ){

				actualSetNumber = getActualSetNumber();
				actualBottomLimit = getLimitBottom();

				if( isThisLastSet() ){
					actualTopLimit = 0 
					generateDOM( true );
					return;
				}else{
					actualTopLimit = getLimitTop();
					generateDOM();
				}
				

			}
		}else if(actualPosition < memo){
		/* DOWN */			
			if( actualPosition <= actualBottomLimit ){
				
				actualSetNumber =  getActualSetNumber();

		 		actualTopLimit = getLimitTop();
		 		actualBottomLimit = getLimitBottom();
				generateDOM();

			}		
		}
		memo = actualPosition;

	});/* EVENT LISTENER ON SCROLLBAR END*/


	/* PUBLIC API  */
	return api = {
		start,
		sort,
		filter,
	};
	
})();