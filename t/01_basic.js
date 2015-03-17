QUnit.test( "basic treejo functionality.", function( assert ) {

    // mock ajax request
    jQuery.ajax = function(args) {
        var url = args.url;
        var req_param = 'node_id='
        var index_of_node_id = String(url).indexOf( req_param );
        var node_id = String(url).substr( index_of_node_id + req_param.length );

        var child_nodes = String(node_id).split('.').length > 3
        ? [{
                "title": "title-"+node_id+".1",
                "body": "body-"+node_id+".1",
            }]
            : [{
                "title": "title-"+node_id+".1",
                "body": "body-"+node_id+".1",
            }, {
                "title": "title-"+node_id+".2",
                "body": "body-"+node_id+".2",
                "url": "/api?node_id="+node_id+".2"
            }, {
                "title": "title-"+node_id+".3",
                "classes": ["node-danger"],
            }, {
                "title": "title-"+node_id+".4",
                "body": "body-"+node_id+".4",
                "has_children": false
            }];
        var content_data = {
            name: 'id' + node_id,
            child_nodes: child_nodes
        };
        args.success(content_data);
    };

    assert.ok( typeof(treejo) !== "undefined", "treejo loaded." );
    assert.ok( typeof(treejo.create) === "function", "treejo.create is a function." );

    var tree = $('<div id="mytreejo">'
               +   '<button class="quicklink-init" data-path="1.3">goto 1.3</button>'
               +   '<div class="node-init" data-url="/api?node_id=1" data-title="root title" data-body="root body"></div>'
               + '</div>');
    treejo.create(tree);
    var node = tree.find('.node');
    assert.ok( node, "root node has been initialized." );
    assert.ok( node.children('.node-content').length === 0, 'node-content does not exist.' );

    var node_heading = node.children('.node-panel').children('.node-heading');
    node_heading.children('.node-toggle').click();
    var node_content = node.children('.node-content');
    assert.ok( node_content.length === 1, 'node-content has been appended.' );
    var new_nodes = node_content.children('.node');
    assert.ok( new_nodes.length === 4, '4 nodes have been loaded.' );

    var first_child_node = new_nodes.filter('.node-closed').first();
    var first_child_node_heading = first_child_node.children('.node-panel').children('.node-heading');
    first_child_node_heading.find('.node-toggle').click();
    assert.ok( first_child_node.hasClass('node-open'), 'node has .node-open class.' );

    tree.children('button').click();
    assert.ok(
        $( new_nodes.get(2) ).hasClass('node-highlight'),
        'node 1.3 is highlighted after clicking quicklink.'
    );

    assert.ok(tree.find('.node.node-closed').length > 0, 'there are closed nodes.');
    node_heading.find('.node-show-all').click();
    assert.ok(tree.find('.node.node-closed').length === 0, 'all nodes are opened after clicking nodes_show_all.');

    var node_with_body = tree.find('.node[data-url="/api?node_id=1.2"]');
    assert.ok(
            node_with_body.children('.node-panel').children('.node-body').length === 1,
            'node 1.2 has a body element.'
    );
    var node_without_body = tree.find('.node[data-url="/api?node_id=1.3"]');
    assert.ok(
            node_without_body.children('.node-panel').children('.node-body').length === 0,
            'node 1.3 has no body element.'
    );
});
