/*! treejo v0.001 | (c) 2015 David Schmidt <davewood@gmx.at> | http://www.gnu.org/licenses/lgpl.html */

(function( treejo, undefined ) {
    'use strict';

    var options = {
        "window_top_offset":  30,
        "url":                '/api',
        "highlight_cooldown": 5000,
        "scroll_duration":    500,
        "show_duration":      500,
        "hide_duration":      500,
    };

    function build_node(id, title, body) {
        return '<div data-node-id="' + id + '" class="node">'
             +   '<div class="node-panel">'
             +     '<div class="node-panel-header">'
             +       '<div class="node-toggle node-closed"></div> '
             +       title
             +     '</div>'
             +     '<div class="node-panel-body">' + body + '</div>'
             +   '</div>'
             + '</div>';
    }
    function node_load(node) {
        var node_id = node.data('node-id');

        var content = node.children('.node-content');
        if ( content.length === 0 ) {
            var node_id = node.data('node-id');
            content = $('<div class="node-content" style="display:none;"></div>');
            $.ajax({
                url:     options.url,
                async:   false,
                type:    'GET',
                data:    {"node_id": node_id},
                dataType: 'json',
                error:   function(jqXHR, textStatus, errorThrown) { console.warn(errorThrown); alert('Ajax Error: ' + textStatus); },
                success: function( data ) {
                             content.append('<div class="node-closer" title="close '+data.name+'"><div></div></div>');
                             $.each( data.child_nodes, function(index, value) {
                                content.append(build_node(value.id, value.title, value.body));
                             })
                         }
            });
            node.append(content);
        }
    }
    function node_show(node) {
        node_load(node);
        node.children('.node-content').slideDown({ duration: options.show_duration });
        var node_toggle = node.children('.node-panel').children('.node-panel-header').children('.node-toggle');
        node_toggle.removeClass('node-closed');
        node_toggle.addClass('node-open');
    }
    function node_hide(node) {
        node.children('.node-content').slideUp({ duration: options.hide_duration });
        var node_toggle = node.children('.node-panel').children('.node-panel-header').children('.node-toggle');
        node_toggle.removeClass('node-open');
        node_toggle.addClass('node-closed');
    }

    treejo.find_node_by_path = function(path) {
        var parts = path.split('.');
        if ( parts.shift() !== '1' ) {
            console.warn('materialized paths always have to begin with "1". ('+ path + ')');
            return;
        }
        var current = $('#mytreejo > .node').first();
        for (var i = 0; i < parts.length; i++) {
            var index = parts[i] - 1;
            node_show(current);
            current = $( current.children('.node-content').children('.node').get(index) );
            if (current.length === 0) {
                console.warn('Path does not exist: ' + path);
                return;
            }
        }
        scroll_to_node(current);
    };

    function scroll_to_node(node) {
        $('html, body').animate(
            {
                scrollTop: node.offset().top - options.window_top_offset
            },
            options.scroll_duration
        );
        highlight_panel(node);
    }
    function highlight_panel(node) {
        var panel = node.children('.node-panel');
        panel.addClass('node-panel-highlight');
        setTimeout(
          function() {
              panel.removeClass('node-panel-highlight');
          },
          options.highlight_cooldown
        );
    }
    function is_visible(node) {
        var view_top     = window.pageYOffset + options.window_top_offset;
        var view_bottom  = view_top + $(window).height();
        var panel        = node.children('.node-panel');
        var panel_top    = panel.offset().top;
        var panel_bottom = panel_top + panel.height();

        if ( panel_top > view_top && panel_bottom < view_bottom ) {
            return true;
        }
        else {
            return false;
        }
    }

    function merge_options(_options) {
        for (var name in _options) {
            if (options.hasOwnProperty(name)) {
                options[name] = _options[name];
            }
        }
    }

    treejo.init = function(selector, options) {
        merge_options(options);

        var tree = $(selector);
        if ( tree.length === 0 ) {
            console.warn('No elements found using selector: "' + selector + '*');
        }
        else {
            tree.on('click',
                    '.node-toggle.node-closed',
                    function(event) {
                        node_show( $(event.target).closest('.node') );
                    });
            tree.on('click',
                    '.node-toggle.node-open',
                    function(event) {
                        node_hide( $(event.target).closest('.node') );
                    });
            tree.on('click',
                    '.node-closer',
                    function(event) {
                        var node = $(event.target).closest('.node');
                        node_hide(node);
                        if( !is_visible(node) ) {
                            scroll_to_node(node);
                        }
                        else {
                            highlight_panel(node);
                        }
                    });
        }
    };

    return treejo;
}( window.treejo = window.treejo || {} ));
