(function( treejo,  undefined ) {
    'use strict';

    function get_node(title, body) {
        return '<div class="node">'
             +   '<div class="node-panel">'
             +     '<div class="node-panel-header">'
             +       '<div class="node-toggle node-closed"></div> '
             +       title
             +     '</div>'
             +     '<div class="node-panel-body">' + body + '</div>'
             +   '</div>'
             + '</div>';
    }
    function node_show(node) {
        //var url = 'http://localhost:3000/get_node';
        var url = 'file:///home/david/dev/treejo/data.json';
        var content = node.children('.node-content');
        if ( content.length === 0 ) {
            content = $('<div class="node-content" style="display:none;"></div>');
            $.ajax({
                url:     url,
                async:   false,
                type:    'GET',
                data:    {"node_id":"1"},
                dataType: 'json',
                error:   function(jqXHR, textStatus, errorThrown) { console.log(errorThrown); alert('Ajax Error: ' + textStatus); },
                success: function( data ) {
                             content.append('<div class="node-closer" title="close '+data.name+'"><div></div></div>');
                             $.each( data.child_nodes, function(index, value) {
                                content.append(get_node(value.title, value.body));
                             })
                         }
            });
            node.append(content);
        }
        content.slideDown({ duration: 500 });
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
                        node.children('.node-content').slideUp({ duration: 500 });
                        node_toggle.toggleClass('node-closed node-open');
                    });
            tree.on('click',
                    '.node-closer',
                    function(event) {
                        var node = $(event.target).closest('.node');
                        var node_toggle = node.children('.node-panel').children('.node-panel-header').children('.node-toggle');
                        node.children('.node-content').slideUp({ duration: 500 });
                        node_toggle.toggleClass('node-closed node-open');
                    });
        }
    };

    return treejo;
}( window.treejo = window.treejo || {} ));
