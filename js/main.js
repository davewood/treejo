$(document).ready(function() {
    treejo.create(
        $('#mytreejo1'),
        { "highlight_duration": 2000 }
    );
    treejo.create(
        $('#mytreejo2'),
        { 'html_node_show_all': '<a title="open all child nodes" class="node-show-all">++</a> ' }
    );
});
