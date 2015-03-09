(function( treejo,  undefined ) {
    'use strict';

    treejo.init = function(selector) {
        var tree = $(selector);
        if ( tree.length === 0 ) {
            console.warn('No elements found using selector: "' + selector + '*');
        }
    };

    return treejo;
}( window.treejo = window.treejo || {} ));
