#!/usr/bin/env perl
use 5.018;
use warnings;

use Plack::App::File;
use Plack::Builder;
use Plack::Request;
use FindBin qw/ $Bin /;

my $api_app = sub {
    my $env = shift;

    my $req       = Plack::Request->new($env);
    my $node_id   = $req->parameters->{node_id};
    my $num_nodes = 3 + int( rand(4) );            # [3-6]
    my @nodes     = ();

    my $depth = split( /\./, $node_id );    # 1.1.2 => 3, 1.3.4.1 => 4, ...

    # stop delivery of nodes if depth > 5
    if ( $depth <= 5 ) {
        for my $i ( 1 .. $num_nodes ) {
            push( @nodes, '{'
                  . '"id":"' . $node_id . '.' . $i . '",'
                  . '"title":"title-' . $node_id . '.' . $i . '", '
                  . '"body":"body-' . $node_id . '.' . $i . '",'
                  . '"has_children":' . (rand(1) > 0.5 ? 'true' : 'false')
                  . '}');
        }
    }

    my $json =
        '{ "name":"node-'
      . $node_id
      . '", "child_nodes": ['
      . join( ',', @nodes ) . '] }';
    return [ 200, [ 'Content-Type' => 'application/json' ], [$json] ];
};

builder {
    mount '/' => Plack::App::File->new( root => $Bin )->to_app;
    mount '/api' => $api_app;
}
