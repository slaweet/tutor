//Nepotřebujeme khan-exercise.js	
	window.Khan = {};
	// Tohle se může hodit
	window.Khan.error = function( ) {
		if ( typeof console !== "undefined" ) {
			jQuery.each( arguments, function( ix, arg ) {
				console.error(arg);
			});
		}
		};
//Scratchpad nemáme, volá se z interactive.js/addMouseLayer()
	window.Khan.scratchpad = {};
	window.Khan.scratchpad.disable = function () {};

//Ve window.KhanUtil.currentGraph se objeví objekt právě vytvořeného grafu
	window.KhanUtil = {};
