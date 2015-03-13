QUnit.test( "basic treejo functionality.", function( assert ) {

    // mock ajax request
    jQuery.ajax = function(args) {
        var node_id = args.data.node_id;
        var child_nodes = String(node_id).split('.').length > 3
        ? [{
                "id": node_id+".1",
                "title": "title-"+node_id+".1",
                "body": "body-"+node_id+".1",
                "has_children": false
            }]
            : [{
                "id": node_id+".1",
                "title": "title-"+node_id+".1",
                "body": "body-"+node_id+".1",
                "has_children": false
            }, {
                "id": node_id+".2",
                "title": "title-"+node_id+".2",
                "body": "body-"+node_id+".2",
                "has_children": true
            }, {
                "id": node_id+".3",
                "title": "title-"+node_id+".3",
                "body": "body-"+node_id+".3",
                "classes": "node-danger",
                "has_children": false
            }, {
                "id": node_id+".4",
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
               +   '<div class="node-init" data-node-id="1" data-title="root title" data-body="root body"></div>'
               + '</div>');
    treejo.create(tree);
    var node = tree.find('.node');
    assert.ok( node, "root node has been initialized." );
    assert.ok( node.children('.node-content').length === 0, 'node-content does not exist.' );
    node.children('.node-panel').children('.node-heading').children('.node-toggle').click();
    var node_content = node.children('.node-content');
    assert.ok( node_content.length === 1, 'node-content has been appended.' );
    var new_nodes = node_content.children('.node');
    assert.ok( new_nodes.length === 4, '4 nodes have been loaded.' );

    tree.find('button').click();
    assert.ok(
        $( new_nodes.get(2) ).hasClass('node-highlight'),
        'node 1.3 is highlighted after clicking quicklink.'
    );
});
