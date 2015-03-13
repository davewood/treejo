/*!
 * treejo v0.001
 *
 * (c) 2015 David Schmidt <davewood@gmx.at>
 * Released under the Artistic License 2.0 (see LICENSE file for details)
 */

(function( treejo, undefined ) {
    'use strict';

    var defaults = {
        "window_top_offset":  30,
        "url":                '/api',
        "highlight_duration": 5000,
        "scroll_duration":    500,
        "slide_duration":     500,
        "max_counter":        30,
        "req_param_key":      'node_id',
        "html_node_toggle":   '<a class="node-toggle node-closed">+</a> ',
        "html_node_closed":   '+',
        "html_node_open":     '-',
        "html_node_show_all": '<a title="open all child nodes" class="node-show-all">a</a> ',
    };

    treejo.create = function(element, options) {
        options = $.extend( {}, defaults, options );

        build_quicklinks();
        build_root_node();

        element.on('click',
                '.node-toggle.node-closed',
                function(event) {
                    node_show( $(event.target).closest('.node') );
                });
        element.on('click',
                '.node-toggle.node-open',
                function(event) {
                    node_hide( $(event.target).closest('.node') );
                });
        element.on('click',
                '.node-show-all',
                function(event) {
                    node_show_all( $(event.target).closest('.node') );
                });
        element.on('click',
                '.node-closer',
                function(event) {
                    var node = $(event.target).closest('.node');
                    node_hide( node );
                    if( !is_visible(node) ) {
                        scroll_to_node( node );
                    }
                    else {
                        highlight_node( node );
                    }
                });

        function node_load_content(node_id) {
            var content_data;
            var ajax_data = {};
            ajax_data[options.req_param_key] = node_id;

            $.ajax({
                url:      options.url,
                async:    false,
                type:     'GET',
                data:     ajax_data,
                dataType: 'json',
                error:    function(jqXHR, textStatus, errorThrown) {
                              console.warn(errorThrown);
                              alert('Ajax Error: ' + textStatus);
                          },
                success:  function( data ) {
                              content_data = data;
                          }
            });
            return content_data;
        }

        function node_show_content(node) {
            var content = node.children('.node-content');
            if ( content.length === 0 ) {
                var data = node_load_content( node.data('node-id') );
                if (typeof data === 'object') {
                    var content = $('<div class="node-content" style="display:none;"></div>');
                    content.append('<div class="node-closer" title="close '+data.name+'"><div></div></div>');
                    $.each( data.child_nodes, function(index, value) {
                        content.append(build_node(value));
                    })
                    node.append(content);
                }
            }
        }

        function node_show_all(nodes) {
            var counter          = 0;
            var continue_loading = 1;

            do {
                if (nodes.length) {
                    nodes.each(
                        function(index, value) {
                            if ( counter >= options.max_counter ) {
                                if (confirm("Do you want to open " + options.max_counter + " more nodes?")) {
                                    counter = 0;
                                }
                                else {
                                    continue_loading = 0;
                                    return false; // stop each() loop
                                }
                            }
                            node_show($(value));
                            counter = counter + 1;
                        }
                    );
                    nodes = nodes.children('.node-content').children('.node').has('.node-panel > .node-heading > .node-closed');
                }
                else {
                    continue_loading = 0;
                }
            } while( continue_loading );
        }

        function node_show(node) {
            node_show_content(node);
            node.children('.node-content').slideDown({ duration: options.slide_duration });
            var node_toggle = node.children('.node-panel').children('.node-heading').children('.node-toggle');
            node_toggle.removeClass('node-closed');
            node_toggle.addClass('node-open');
            node_toggle.html(options.html_node_open);
        }
        function node_hide(node) {
            node.children('.node-content').slideUp({ duration: options.slide_duration });
            var node_toggle = node.children('.node-panel').children('.node-heading').children('.node-toggle');
            node_toggle.removeClass('node-open');
            node_toggle.addClass('node-closed');
            node_toggle.html(options.html_node_closed);
        }

        function find_node_by_path(path) {
            var parts = path.split('.');
            if ( parts.shift() !== '1' ) { // materialized path always starts with '1'
                console.warn('materialized paths always have to begin with "1". ('+ path + ')');
                return;
            }
            var current = element.children('.node').first();
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
        }

        function scroll_to_node(node) {
            $('html, body').animate(
                {
                    scrollTop: node.offset().top - options.window_top_offset
                },
                options.scroll_duration
            );
            highlight_node(node);
        }
        function highlight_node(node) {
            node.addClass('node-highlight');
            setTimeout(
              function() {
                  node.removeClass('node-highlight');
              },
              options.highlight_duration
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

        function build_node(data) {
            var classes = typeof data.classes === 'string'
                          ? ' ' + data.classes
                          : '';
            return '<div data-node-id="' + data.id + '" class="node' + classes + '">'
                 +   '<div class="node-panel">'
                 +     '<div class="node-heading">'
                 +       ( data.has_children /* only show buttons if node has children */
                           ? options.html_node_toggle + options.html_node_show_all
                           : '')
                 +       '<span class="node-title">' + data.title + '</span>'
                 +     '</div>'
                 +     ( data.body !== ''
                         ? '<div class="node-body">' + data.body + '</div>'
                         : '')
                 +   '</div>'
                 + '</div>';
        }
        // looks for a child element with init data for a root node
        // and replaces it with a proper node element.
        function build_root_node() {
            var root_node = element.find('.node-init');
            if ( root_node.length > 0 ) {
                var node = $(
                              build_node({
                                        id:           root_node.data('node-id'),
                                        title:        root_node.data('title'),
                                        body:         root_node.data('body'),
                                        has_children: true
                                      })
                           );
                node.addClass( root_node.removeClass('node-init').attr('class') );
                root_node.replaceWith(node);
            }
        }

        // looks for elements with data for a quicklink
        // and adds a clickhandler for finding a node.
        function build_quicklinks() {
            var quicklinks = element.find('.quicklink-init');
            quicklinks.each( function( index, value ) {
                var val = $(value);
                val.removeClass('quicklink-init');
                val.click(function() { find_node_by_path( String(val.data('path')) ); })
            });
        }

    };

    return treejo;
}( window.treejo = window.treejo || {} ));
