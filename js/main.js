( function ( window , document , $ ){

	'use strict';

		var $hasOwnProperty = function() {
			//defualt namespace

			// populate history
			var tmpHistory = window.localStorage.getItem( 'prevSearches' );

			$hasOwnProperty.history = ( tmpHistory ) ? tmpHistory.split( ',' ) : [];

			// init necessary event listeners

			$( '.results' ).on( 'click' , '.isObject' , function( e ) {

				var $this = $( this ),
					$parentLI = $this.parent( 'li' );

					// toggle Expanded class on <li> to show children properties
					$parentLI.toggleClass( 'expanded' );

					e.preventDefault();


			} );

			$( '.historyPanel' ).on( 'click' , 'a', function( e ) {

				$hasOwnProperty.search( e , $( this ).text() );

			} );

			$( 'button.search' ).on( 'click' , $hasOwnProperty.search );

			$( '#Search' ).on( 'keypress' , function( e ) {
				
				var keyCode = e.charCode || e.keyCode;

				if ( keyCode === 13 ) {
				
					e.preventDefault();
					$hasOwnProperty.search();
				
				}

			} );

			$( document ).on( 'beginSearch' , $hasOwnProperty.updateHistory );
			$( document ).on( 'endSearch' , $hasOwnProperty.populateResults );
			$( document ).on( 'historyUpdated' , $hasOwnProperty.populateHistory );

		};

		$hasOwnProperty.search = function( e , $term ) {

			// toggle header if inital search
			if ( !$('.hero-unit').hasClass( 'compressed' ) ) {

				$('.hero-unit').addClass('compressed');
			
			}

			// use value passed through, else get value then cache so not to repeat jQuery selection
			var $searchTerm =  $term || $( '#Search' ).val();
			
			if ( !$searchTerm ) {
				
				// exit and notify no search term supplied
				!$( '.span3' ).hasClass( 'hide' ) && $( '.span3' ).fadeOut().addClass( 'hide' );
				!$( '.span9' ).hasClass( 'hide' ) && $( '.span9' ).fadeOut().addClass( 'hide' );
				var $alert = $( '.alert' );
				var $alertText = $alert.find('p');
				$alertText.text('Please enter in a valid search term');
				$alert.fadeIn();

				return false;

			}

			// determine if searchTerm is a RegExp, if so, create new instance.
			// Would prefer parsing the regex and creating new instance of RegExp with necessary params than eval
			$searchTerm = (  /^\/[\W\w]+/ig.test( $searchTerm ) ) ? eval( $searchTerm ) : $searchTerm;

			// trigger search Event
			$( '.alert' ).fadeOut();
			$( document ).trigger( 'beginSearch' , [ $searchTerm ] );

			// show loader and side panel
			$( '.span3' ).hasClass( 'hide' ) && $( '.span3' ).fadeIn().removeClass( 'hide' );

		};

		$hasOwnProperty.populateResults = function( e , results ) {

			var $resultsContainer = $( '.results' );

			// empty existing results
			$resultsContainer.empty();

			// append results to container
			$resultsContainer.append( results );

			$resultsContainer.parent().hasClass( 'hide' ) && $resultsContainer.parent().fadeIn().removeClass( 'hide' );

			// show results



		};

		$hasOwnProperty.updateHistory = function( e , $searchTerm ) {

			// get previous searches from localStorage, if none, create empty array
			var $prevSearch = $hasOwnProperty.history || [];

			if ( $prevSearch.length === 5 ) {

				// remove first search term as is oldest
				$prevSearch.shift();

			}
			
			$prevSearch.push( $searchTerm );

			window.localStorage.setItem( 'prevSearches' , $prevSearch );

			$( document ).trigger( 'historyUpdated' , [ $prevSearch ] );

		};

/*
	Need to clean up populateHistory, refactor and possibly create a seperate "generate History elemnts" function.
	Will address in next version, wil suffice for initial release.
*/
		$hasOwnProperty.populateHistory = function( e , $history ){

			var $prevSearch = $hasOwnProperty.history.reverse();
			
			var historyPanel = $( '.historyPanel' );
			var noPrevSearch = historyPanel.children( 'li' ).length;

			// check if any existing terms, else check no of terms, if > 5, remove oldest and add, else add
			if ( !noPrevSearch ) {
				
				// add all terms to history panel
				var docFrag = document.createDocumentFragment();
				
				$prevSearch.forEach( function( $term , i ) {
					
					var elemLi = document.createElement( 'li' );
					elemLi.className = ( i === 0 ) ? 'active' : '' ;
					var elemAnchor = document.createElement( 'a' );
					elemAnchor.href = '#';
					elemAnchor.textContent = $term;

					elemLi.appendChild( elemAnchor );

					docFrag.appendChild( elemLi );

				});

				historyPanel.empty();
				historyPanel.append( docFrag );

			}
			else {


				if ( noPrevSearch === 5 ) {

					historyPanel.children('li:last').remove();

				}

				historyPanel.find( '.active' ).removeClass( 'active' );

				var elemLi = document.createElement( 'li' );
				elemLi.className = 'active';
				
				var elemAnchor = document.createElement( 'a' );
				elemAnchor.href = '#';
				elemAnchor.textContent = $prevSearch[ 0 ];

				elemLi.appendChild( elemAnchor );

				historyPanel.prepend( elemLi );

			}

		};

		$hasOwnProperty();

/*

	Web Platform API link to obtain all URLs,Categories and Labels for given term
	http://docs.webplatform.org/w/api.php?format=json&action=webplatformsearch&term={{searchTerm}}

*/

} ( window , document , jQuery ) );
