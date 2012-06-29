// lang.js
// source: http://www.adammark.net/2011/03/05/javascript-resource-bundles/
 
// Do not invoke with new!  Use all static methods 
function Lang() { 
} 
 
// The bundles 
Lang.bundles = {"cs": {}} 
 
// Set the language (e.g. “fr”). Default is “en” 
Lang.setLang = function (lang) { 
    Lang.lang = lang; 
} 
 
// Set a resource bundle 
Lang.setBundle = function (lang, bundle) { 
    Lang.bundles[lang] = bundle; 
} 
 
// Retrieve a string from the resource bundle 
Lang.get = function (key, args) { 
    return Lang.tx(Lang.bundles[Lang.bundles[Lang.lang] ? Lang.lang : "cs"][key] || "???", args); 
} 
 
// Translate a string with optional args 
Lang.tx = function (string, args) { 
    if (typeof args == "string") { 
        args = [args]; 
    } 
 
    var tokens = string.match(/{\d+}/g); 
 
    for (var i in tokens) { 
        string = string.replace(tokens[i], args[tokens[i].match(/\d+/)]); 
    } 
    return string; 
} 
