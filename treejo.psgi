#!/usr/bin/env perl
use 5.018;
use warnings;

use Plack::App::File;
use Plack::Builder;
use Plack::Request;
use FindBin qw/ $Bin /;

sub get_node_data {
    my ( $id, $has_children )= @_;
    return '{'
         . '"id":"' . $id . '",'
         . '"title":"title-' . $id . '", '
         . '"body":"body-' . $id . '",'
         . ( rand(1) > 0.6 ? '"classes":"node-danger",' : '' )
         . '"has_children":' . $has_children
         . '}';
}

my $api_app = sub {
    my $env = shift;

    my $req       = Plack::Request->new($env);
    my $node_id   = $req->parameters->{node_id};
    my $num_nodes = 2 + int( rand(4) );     # [2-5]
    my @nodes;

    my $depth = split( /\./, $node_id );    # 1.1.2 => 3, 1.3.4.1 => 4, ...

    for my $i ( 1 .. $num_nodes ) {
        # stop delivery of nodes if depth > 5
        my $has_children = $depth <= 5
                           ? rand(1) > 0.5 ? 'true' : 'false'
                           : 'false';
        push(
            @nodes,
            get_node_data( "$node_id.$i", $has_children )
        );
    }

    my $json = '{'
             . '"name":"node-' . $node_id . '",'
             . '"child_nodes":[' . join( ',', @nodes ) . ']'
             . '}';
    return [ 200, [ 'Content-Type' => 'application/json' ], [$json] ];
};

builder {
    mount '/' => Plack::App::File->new( root => $Bin )->to_app;
    mount '/api' => $api_app;
}
