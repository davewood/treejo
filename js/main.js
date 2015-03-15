$(document).ready(function() {
    treejo.create( $('#mytreejo1') );
    treejo.create(
        $('#mytreejo2'),
        {
            'html_node_show_all': '<a title="open all child nodes" class="node-show-all">open all</a> ',
            'html_node_toggle':   '<a class="node-toggle">&gt;</a> ',
            'html_node_open':     'v',
            'html_node_closed':   '&gt;',
            'highlight_duration': 9999
        }
    );
});
