basket.require(

		{ url : 'js/vendor/jquery.min.js' , key : 'jQuery' , unique : '1.9' }

	).then( function() {

		basket.require(

				{ url : 'js/vendor/modernizr.min.js' , key : 'modernizr' , unique : '1.1.0' },
				{ url : 'js/Grep.min.js' , key : 'Grep' , unique : '0.3' },
				{ url : 'js/main.min.js' , key : 'Main' , unique : '0.2' }

			);

});
		
		