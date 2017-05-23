$(document).ready(function() {
    treejo.create(
        $('#mytreejo1'),
        {
            'html_node_reload':   'r',
        }
    );
    treejo.create(
        $('#mytreejo2'),
        {
            'html_node_showall':  '',
            'html_node_opened':   'v',
            'html_node_closed':   '&gt;',
            'highlight_duration': 9999,
            'slide_duration':     1000
        }
    );
});
