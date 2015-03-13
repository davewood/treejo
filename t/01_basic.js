QUnit.test( "treejo loaded.", function( assert ) {
    assert.ok( typeof(treejo) !== "undefined", "ok" );
});
QUnit.test( "treejo create is a function.", function( assert ) {
    assert.ok( typeof(treejo.create) === "function", "ok" );
});
