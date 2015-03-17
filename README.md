Status
======

Experimental, API unstable.

Name
====

treejo.js - a javascript component for viewing tree-structured data.


Synopsis
=======

```
    <!-- load jquery.js and treejo.js -->
    <script src="/jquery.min.js"></script>
    <script src="/treejo.js"></script>
    <!-- load your treejo stylesheet -->
    <link href="/treejo.css" rel="stylesheet">

    <div id="mytreejo">
        <!-- insert a root node -->
        <div class="node-init" data-url="/api?node_id=1" data-title="root title" data-body="root body"></div>
    </div>

    <script type="text/javascript">
        $(document).ready(function() {
            treejo.create( $('#mytreejo') );
        });
    </script>
```


Description
===========

**lazy loading**  
branches are loaded via ajax on demand when the user opens a node.  
treejo makes a HTTP request for each node it is loading.

**load entire branches recursively**

**quicklinks**  
find and jump to node according to materialized path

**encapsulation**  
put multiple treejo trees on a single page



Options
=======

```
"window_top_offset":  30,
"highlight_duration": 5000,
"scroll_duration":    500,
"slide_duration":     500,
"max_counter":        30,
"html_node_toggle":   '<a class="node-toggle">+</a> ',
"html_node_closed":   '+',
"html_node_open":     '-',
"html_node_show_all": '<a title="open all child nodes" class="node-show-all">++</a> ',
```


Demo
====

`plackup treejo.psgi`  
GET http://localhost:5000/index.html

`load_node_content(node)` expects a JSON response formatted like this
```
{
    "name":"parent_node_name",
    "child_nodes": [
                     {
                        "title":        "title-1.2.1",
                        "body":         "body-1.2.1",
                        "url":   "/api?node_id=1.2.1
                     },
                     {
                        "title": "title-1.2.2",
                        "body":  "body-1.2.2"
                     },
                     {
                        "title": "title-1.2.3",
                        "body":  "body-1.2.3"
                     }
                   ]
}
```
