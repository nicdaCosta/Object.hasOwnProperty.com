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

	function buildResult( currentProp , currentPropValue ) {

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

		if ( currentPropType === 'object' ) {

			var tmpUl = document.createElement( 'ul' );

			tmpUl.className = 'nav nav-stacked nav-tabs';
			var item;

			//var tmpProps = Object.getOwnPropertyNames( currentPropValue );

			//tmpProps.forEach( function( item ) {

			for ( item in currentPropValue ) {

				tmpUl.appendChild( buildResult( item , currentPropValue[ item ] ) );
				
			}

			tmpDiv.appendChild( tmpUl );

		}
		else {

			var tmpP = document.createElement( 'p' );
			tmpP.textContent =  currentPropValue;
			tmpDiv.appendChild( tmpP );
			
		}

		tmpLI.appendChild( tmpDiv );

		result.appendChild( tmpLI );

		return result;

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

		var results;

		if ( !Object.getOwnPropertyNames( grepResult ).length ) {

			// build no results found
			results = '';

		}
		else {

			results = buildResult( 'window.Grep : ' + $searchTerm , grepResult );

		}

		// search completed, return results
		$( document ).trigger( 'endSearch' , results );

	};

	$( document ).on( 'beginSearch' , initGrep );
	$( document ).on( 'beginBuild' , buildResult.init );
	
} ( window , window.document , window.jQuery ) );