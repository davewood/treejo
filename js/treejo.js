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
        "highlight_duration": 5000,
        "scroll_duration":    500,
        "slide_duration":     500,
        "max_counter":        30,
        "html_node_toggle":   '<a class="node-toggle">+</a> ',
        "html_node_closed":   '+',
        "html_node_open":     '-',
        "html_node_show_all": '<a title="open all child nodes" class="node-show-all">++</a> ',
    };

    treejo.create = function(element, options) {
        options = $.extend( {}, defaults, options );

        build_quicklinks();
        build_root_node();

        element.on('click',
                '.node.node-closed > .node-panel > .node-heading > .node-toggle',
                function(event) {
                    node_show( $(event.target).closest('.node') );
                });
        element.on('click',
                '.node.node-open > .node-panel > .node-heading > .node-toggle',
                function(event) {
                    node_hide( $(event.target).closest('.node') );
                });
        element.on('click',
                '.node > .node-panel > .node-heading > .node-show-all',
                function(event) {
                    node_show_all( $(event.target).closest('.node') );
                });
        element.on('click',
                '.node.node-open > .node-content > .node-closer',
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

        function node_load_content(node) {
            var url = node.data('url');
            if (!url) {
                console.warn('Node has no data-url attribute. Cannot load content.');
                return;
            }
            var content_data;
            $.ajax({
                url:      url,
                async:    false,
                type:     'GET',
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
                var data = node_load_content( node );
                if (data) {
                    var content = $('<div class="node-content" style="display:none;"></div>');
                    content.append('<div class="node-closer" title="close '+data.name+'"><div></div></div>');
                    $.each( data.child_nodes, function(index, value) {
                        content.append(build_node(value));
                    })
                    node.append(content);
                }
            }
        }

        function node_show_all(node) {
            var counter          = 0;
            var continue_loading = 1;
            var nodes            = node;

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
                    nodes = node.find('.node.node-closed');
                }
                else {
                    continue_loading = 0;
                }
            } while( continue_loading );
        }

        function node_show(node) {
            node_show_content(node);
            node.children('.node-content').slideDown({ duration: options.slide_duration });
            node.removeClass('node-closed').addClass('node-open');
            node.children('.node-panel').find('.node-toggle').html(options.html_node_open);
        }
        function node_hide(node) {
            node.children('.node-content').slideUp({ duration: options.slide_duration });
            node.removeClass('node-open').addClass('node-closed');
            node.children('.node-panel').find('.node-toggle').html(options.html_node_closed);
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
            var node_classes = data.classes ? data.classes : [];
            node_classes.push('node');
            if ( data.url ) { node_classes.push('node-closed'); }
            return '<div class="' + node_classes.join(' ') + '"'
                 +   ( data.url ? ' data-url="' + data.url + '"' : '' )
                 +   '>'
                 +   '<div class="node-panel">'
                 +     '<div class="node-heading">'
                 +       ( data.url /* only show buttons if node has children */
                           ? options.html_node_toggle + options.html_node_show_all
                           : '')
                 +       '<span class="node-title">' + data.title + '</span>'
                 +     '</div>'
                 +     ( data.body ? '<div class="node-body">' + data.body + '</div>' : '' )
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
                                        url:   root_node.data('url'),
                                        title: root_node.data('title'),
                                        body:  root_node.data('body'),
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
