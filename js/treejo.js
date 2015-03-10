/*
 * treejo v0.001
 * (c) 2015 David Schmidt <davewood@gmx.at>
 * Artistic License 2.0 (see LICENSE file for details)
 * */

(function( treejo, undefined ) {
    'use strict';

    var options = {
        "selector":           '#treejo',
        "window_top_offset":  30,
        "url":                '/api',
        "highlight_duration": 5000,
        "scroll_duration":    500,
        "slide_duration":     500,
        "max_counter":        30,
        "req_param_key":      'node_id',
        "html_node_toggle":   '<div class="node-toggle node-closed">+</div> ',
        "html_node_closed":   '+',
        "html_node_open":     '-',
        "html_node_show_all": '<div title="open all child nodes" class="node-show-all">a</div> '
    };

    function build_node(data) {
        return '<div data-node-id="' + data.id + '" class="node">'
             +   '<div class="node-panel">'
             +     '<div class="node-panel-header">'
             +     ( data.has_children /* only show buttons if node has children */
                     ? options.html_node_toggle + options.html_node_show_all
                     : '')
             +       data.title
             +     '</div>'
             +     ( data.body !== ''
                     ? '<div class="node-panel-body">' + data.body + '</div>'
                     : '')
             +   '</div>'
             + '</div>';
    }

    function node_load(node) {
        var node_id = node.data('node-id');

        var content = node.children('.node-content');
        if ( content.length === 0 ) {
            var data = {};
            data[options.req_param_key] = node.data('node-id');
            content = $('<div class="node-content" style="display:none;"></div>');
            $.ajax({
                url:      options.url,
                async:    false,
                type:     'GET',
                data:     data,
                dataType: 'json',
                error:    function(jqXHR, textStatus, errorThrown) { console.warn(errorThrown); alert('Ajax Error: ' + textStatus); },
                success:  function( data ) {
                              content.append('<div class="node-closer" title="close '+data.name+'"><div></div></div>');
                              $.each( data.child_nodes, function(index, value) {
                                  content.append(build_node(value));
                              })
                          }
            });
            node.append(content);
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
                nodes = nodes.children('.node-content').children('.node').has('.node-panel > .node-panel-header > .node-closed');
            }
            else {
                continue_loading = 0;
            }
        } while( continue_loading );
    }

    function node_show(node) {
        node_load(node);
        node.children('.node-content').slideDown({ duration: options.slide_duration });
        var node_toggle = node.children('.node-panel').children('.node-panel-header').children('.node-toggle');
        node_toggle.removeClass('node-closed');
        node_toggle.addClass('node-open');
        node_toggle.html(options.html_node_open);
    }
    function node_hide(node) {
        node.children('.node-content').slideUp({ duration: options.slide_duration });
        var node_toggle = node.children('.node-panel').children('.node-panel-header').children('.node-toggle');
        node_toggle.removeClass('node-open');
        node_toggle.addClass('node-closed');
        node_toggle.html(options.html_node_closed);
    }

    treejo.find_node_by_path = function(path) {
        var parts = path.split('.');
        if ( parts.shift() !== '1' ) { // materialized path always starts with '1'
            console.warn('materialized paths always have to begin with "1". ('+ path + ')');
            return;
        }
        var current = $(options.selector + ' > .node').first();
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

    // looks for a child element with init data for a root node
    // and replaces it with a proper node element.
    function build_root_node(tree) {
        var root_node = tree.children('.node-init');
        if ( root_node.length > 0 ) {
            var node = build_node({
                                    id:           root_node.data('node-id'),
                                    title:        root_node.data('title'),
                                    body:         root_node.data('body'),
                                    has_children: true
                                  });
            root_node.replaceWith(node);
        }
    }

    treejo.init = function(_options) {
        $.extend( options, _options ); /* override options */

        var tree = $(options.selector);
        if ( tree.length === 0 ) {
            console.warn('No elements found using selector: "' + options.selector + '"');
        }
        else {
            build_root_node(tree);

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
                    '.node-show-all',
                    function(event) {
                        node_show_all( $(event.target).closest('.node') );
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
