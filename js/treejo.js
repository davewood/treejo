(function( treejo,  undefined ) {
    'use strict';

    function get_node(title, body) {
        return '<div class="node">'
             +   '<div class="node-header">'
             +     '<span class="node-toggle node-closed"></span> '
             +     title
             +   '</div>'
             +   '<div class="node-body">' + body + '</div>'
             + '</div>';
    }
    function node_show(node) {
        var content = node.children('.node-content');
        if ( content.length === 0 ) {
            content = '<div class="node-content">'
                         +   '<div class="node-closer"></div>'
                         +   get_node("head foo", "body foo")
                         + '</div>';
            node.append(content);
        }
        else {
            content.show();
        }
    }

    treejo.init = function(selector) {
        var tree = $(selector);
        if ( tree.length === 0 ) {
            console.warn('No elements found using selector: "' + selector + '*');
        }
        else {
            tree.on('click',
                    '.node-toggle.node-closed',
                    function(event) {
                        var node_toggle = $(event.target);
                        var node = node_toggle.closest('.node');
                        node_show(node);
                        node_toggle.toggleClass('node-closed node-open');
                    });
            tree.on('click',
                    '.node-toggle.node-open',
                    function(event) {
                        var node_toggle = $(event.target);
                        var node = node_toggle.closest('.node');
                        node.find('.node-content').hide();
                        node_toggle.toggleClass('node-closed node-open');
                    });
        }
    };

    return treejo;
}( window.treejo = window.treejo || {} ));
