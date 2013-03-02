/*
	Grep.js
	Author	: Nic da Costa ( @nic_daCosta )
    Created : 2012/11/14
	Version	: 0.2
	License : MIT, GPL licenses
	(c) Nic da Costa

	Overview:
	Basic function that searches / filters any object or function and returns matched properties.
	This receives either a string or regex as the initial parameter( strSearch ), the sencond parameter ( isRecursive == Bool) is
	used to determine whether to search the property's properties should the current property be of type object / function.
	Main area of use would be for DevTools purposes, when needing to find a specific property but only part of
    the property name is known.
    Is now an inherited method on any Object / Function due to Object.prototype.
    Thus can go ObjectName.Grep( 'SearchTerm' ).
    eg: navigator.Grep( 'geo' );
        var foo = function(){}; foo.Grep( 'proto' );

       *Tested in Chrome Dev Tools*

*/
( function ( window , document , $ , undefined ) {
	
	'use strict';

	window.Grep = function( strSearch , isRecursive ) {

		// Checks if seach string is not empty/undefined
		if ( !strSearch ) {

			// return nothing if no search term entered
			return '';

		}

		// Used to prevent maxing out callstack for sub-lookups due to __proto__ == Object
		isRecursive = isRecursive || false;

		// Declare necessary local variables to hold necessary values
		var objToIterate = this,
			typeOfObject = typeof objToIterate,
			objKeys = [],
			objResult = {};

		
		// if item that needs to be iterated over is an object or function, get all properties ( including non enumerable properties )
		if (  objToIterate && ( typeOfObject === 'object' || typeOfObject === 'function' ) ) {

			objKeys = Object.getOwnPropertyNames( objToIterate );

		}

		// Loop through all the ) properties
		objKeys.forEach( function( item ) {

			var itemValue;
			/*
				Initially check if search phrase is a regular expression, if so check if there is a match, else
				check if key matches search string, if so add, if not, check if object and iterate through object's props
			*/
			if ( ( strSearch instanceof RegExp ) ? item.match( strSearch ) : item.toLowerCase().indexOf( strSearch.toLowerCase() ) >= 0 ) {

				// check if is type Object, if so, create drop down list else value and well
				itemValue = objToIterate[ item ];

				// check if will have multiple props else "single line"
				
			}
			else if ( typeof objToIterate[ item ] === 'object' && !isRecursive ){

				itemValue = window.Grep.call( objToIterate[ item ] , strSearch , true );
				
			}
			
			// append results
			if ( itemValue ) {
 
				objResult[ item ] = itemValue;

			}
	 
		} );

		// checks if objResult is empty, if so, return empty string.
		return ( Object.getOwnPropertyNames( objResult ).length ) ? objResult : '';

	};

	function buildResult( e , currentProp , currentPropValue , promise ) {
		
		var currentPropType = typeof currentPropValue,
			result = document.createDocumentFragment(),
			tmpLI = document.createElement( 'li' ),
			tmpA = document.createElement( 'a' ),
			tmpI = document.createElement( 'i' ),
			tmpDiv = document.createElement( 'div' );

			tmpI.className = 'icon-result';

			tmpA.href = '#';
			tmpA.className = 'isObject';
			tmpA.textContent = currentProp;
			tmpA.appendChild( tmpI );

			tmpLI.appendChild( tmpA );

			tmpDiv.className = 'well';

		// iterate through sub methods and properties of Objects, unless is type MineTypeArray or PluginArra due to an "infinate loop" created due to prototypes
		if ( currentPropType === 'object' && currentPropValue && !( currentPropValue instanceof window.MimeTypeArray ) && !( currentPropValue instanceof window.PluginArray ) ) {

			var tmpUl = document.createElement( 'ul' );

			tmpUl.className = 'nav nav-stacked nav-tabs';
			var item,
				arrPromises = [],
				currentPromise;

			//var tmpProps = Object.getOwnPropertyNames( currentPropValue );

			//tmpProps.forEach( function( item ) {

			for ( item in currentPropValue ) {

				currentPromise = new window.RSVP.Promise();
				// build array of promises
				arrPromises.push( currentPromise );

				// trigger build
				$( document ).trigger( 'buildRequired' , [ item , currentPropValue[ item ] , currentPromise ] );

			}

			// once all promises have been forfilled, append results to UL element, then append to DIV
			window.testProm = arrPromises;
			window.RSVP.all( arrPromises ).then( function( arrResultLI ) {

					arrResultLI.forEach( function( resultLI ) {

						tmpUl.appendChild( resultLI );

					});

					tmpDiv.appendChild( tmpUl );

					tmpLI.appendChild( tmpDiv );

					result.appendChild( tmpLI );

					// resolve passed through promise, element representing object has been built
					promise.resolve( result );

				} );

		}
		else {

			var tmpP = document.createElement( 'p' );
			tmpP.textContent =  currentPropValue || 'null';
			tmpDiv.appendChild( tmpP );
			
			tmpLI.appendChild( tmpDiv );

			result.appendChild( tmpLI );

			promise.resolve( result );
			
		}


		/* single line - <li>
							<a class="isObject">frameElement <i class="icon-result"></i></a>
							<div class="well">
								<p>This is content</p>
							</div>
						</li>

			object -	<li class="expanded">
							<a href="#" class="isObject">appCodeName <i class="icon-result"></i></a>
							<div class="well">
								<ul class="nav nav-stacked nav-pills">
								</ul>
							</div>
						</li>
		*/

	}

	function initGrep( e , $searchTerm ) {

		if ( !$searchTerm ) {

			return false;

		}

		var grepResult = window.Grep( $searchTerm );

		$( document ).trigger( 'beginBuild' , [ grepResult , $searchTerm ] );

	}

	buildResult.init = function ( e , grepResult , $searchTerm ) {

		grepResult = grepResult || {};

		var results = document.createDocumentFragment(),
			promResult = new window.RSVP.Promise();


		if ( !!Object.getOwnPropertyNames( grepResult ).length ) {

			$( document ).trigger( 'buildRequired' , [ 'window.Grep : ' + $searchTerm , grepResult , promResult ] );

		}
		else {

			// build no results found
			var tmpLI = document.createElement( 'li' ),
				tmpA = document.createElement( 'a' ),
				tmpI = document.createElement( 'i' ),
				tmpDiv = document.createElement( 'div' ),
				tmpP = document.createElement( 'p' );

			tmpI.className = 'icon-result';

			tmpA.href = '#';
			tmpA.className = 'isObject';
			tmpA.textContent = 'window.Grep : No Results Found - ' + $searchTerm;
			tmpA.appendChild( tmpI );


			tmpDiv.className = 'well';

			tmpP.textContent = ' No results found. Please try another term';

			tmpDiv.appendChild( tmpP );

			tmpLI.appendChild( tmpA );
			tmpLI.appendChild( tmpDiv );

			results.appendChild( tmpLI );

			promResult.resolve( results );

		}

		promResult.then( function( builtResult ) {
			
				// search completed, return results
				$( document ).trigger( 'endSearch' , builtResult );

			} );

	};

	$( document ).on( 'beginSearch' , initGrep );
	$( document ).on( 'beginBuild' , buildResult.init );
	$( document ).on( 'buildRequired' , buildResult );
	
} ( window , window.document , window.jQuery ) );