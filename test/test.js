var assert = require('chai').assert;
var history = require('../history.js');

describe('History', function(){
    describe('#data()', function(){
        it('should return the history contents', function(){
            history.graphHistory = [1, 2, 3];
            history.historyIdx = 3;
            assert.deepEqual(
                {'g': [1,2,3], 'h': 3},
                history.data()
            )
        });
    });
    describe('#reset()', function(){
        it('should reset the history contents to empty', function(){
            history.graphHistory = [1, 2, 3];
            history.historyIdx = 3;
            assert.deepEqual(
                {'g': [1,2,3], 'h': 3},
                history.data()
            )
            history.reset();
            assert.deepEqual(
                {'g': [], 'h': 0},
                history.data()
            )
        });
    });
    describe('#restore()', function(){
        it('should load new data into the history', function(){
            assert.deepEqual(
                {'g': [], 'h': 0},
                history.data()
            )
            history.restore({'g': [1,2,3], 'h': 3});
            assert.deepEqual(
                {'g': [1,2,3], 'h': 3},
                history.data()
            )
        })
    });

    describe('#canGoBack()', function(){
        it('should let us know if we can safely undo', function(){
            history.restore({'g': [1,2,3], 'h': 3});
            assert.equal(true, history.canGoBack())
            assert.equal(true, history.canGoBack(3))
            assert.equal(false, history.canGoBack(4))
            history.historyIdx = 5;
            assert.deepEqual({'g': [1,2,3], 'h': 5},history.data())
            assert.equal(true, history.canGoBack(3))
            assert.equal(false, history.canGoBack(4))
            assert.equal(false, history.canGoBack(5))
        })
    });

    describe('#pushHistory()', function(){
        it('should let us know if we can add elements to history', function(){
            history.restore({'g': [], 'h': 0});
            assert.deepEqual({'g': [], 'h': 0},history.data())
            history.pushHistory(['test', 'someData'])
            assert.deepEqual({'g': [['test', 'someData']], 'h': 1},history.data())
        })
    });

    describe('#applyHistoryActionToGraph()', function(){
        it('should let us know if we can add elements to history', function(){
            graph = {
                config: {
                    'test': 2
                },
                nodes: [
                    {id: 1, x:0, y:0, focus:false},
                    {id: 2, x:0, y:0, focus:true},
                ]
            };

            graph2 = history.applyHistoryActionToGraph(history.clone(graph), ['graph.config.test', 4])
            refGraph2 = history.clone(graph);
            refGraph2.config.test = 4;
            assert.deepEqual(refGraph2, graph2)

            graph3 = history.applyHistoryActionToGraph(
                history.clone(graph),
                ['focus', [1, true]]
            )
            refGraph3 = history.clone(graph);
            refGraph3.nodes[0].focus = true;
            assert.deepEqual(refGraph3, graph3)

            graph4 = history.applyHistoryActionToGraph(
                history.clone(graph),
                ['point', [1, 42, 42]]
            )
            refGraph4 = history.clone(graph);
            refGraph4.nodes[0].x = 42;
            refGraph4.nodes[0].y = 42;
            assert.deepEqual(refGraph4, graph4)
        })
    });

    describe('#applyHistoryToGraph()', function(){
        it('should let us know if history application works', function(){
            graph = {
                config: {
                    'test': 2
                },
                nodes: [
                    {id: 1, x:0, y:0, focus:false},
                    {id: 2, x:0, y:0, focus:true},
                ]
            };

            reference = {
                config: {
                    'test': 2
                },
                nodes: [
                    {id: 1, x:42, y:42, focus:true},
                    {id: 2, x:-42, y:-42, focus:true},
                ]
            };

            history.restore({'g': [], 'h': 0});
            assert.deepEqual({'g': [], 'h': 0},history.data())

            history.pushHistory(['focus', [1, true]])
            history.pushHistory(['point', [1, 42, 42]])
            history.pushHistory(['focus', [1, false]])
            history.pushHistory(['point', [2, -42, -42]])
            history.pushHistory(['focus', [1, true]])

            output = history.applyHistoryToGraph(
                graph,
                history.graphHistory
            );
            assert.deepEqual(reference, output);
        })
    });

    describe('#goBack()', function(){
        it('should let us know if going back works', function(){
            origGraph = {
                nodes: [
                    {id: 1, x:0, y:0, focus:false},
                ]
            };

            // Clean out history
            history.reset(); assert.deepEqual({'g': [], 'h': 0},history.data())

            // Create an operation, apply it (we know this will work)
            op1 = ['focus', [1, true]];
            history.pushHistory(op1);

            graph8 = history.applyHistoryToGraph(
                history.clone(origGraph),
                history.graphHistory
            );
            graph8ref = {
                nodes: [
                    {id: 1, x:0, y:0, focus:true},
                ]
            };
            assert.deepEqual(graph8ref, graph8);

            graph8_back_1 = history.goBack(origGraph, 1);
            assert.deepEqual(origGraph, graph8_back_1);

            // Cannot go back further
            graph8_back_2 = history.goBack(origGraph, 2);
            assert.deepEqual(undefined, graph8_back_2);

            op2 = ['point', [1, 42, -42]];
            history.pushHistory(op2);

            graph9 = history.applyHistoryToGraph(
                history.clone(origGraph),
                history.graphHistory
            );
            graph9ref = {
                nodes: [
                    {id: 1, x:42, y:-42, focus:true},
                ]
            };
            assert.deepEqual(graph9ref, graph9);

            graph9_back_1 = history.goBack(origGraph, 1);
            assert.deepEqual(graph8ref, graph9_back_1);

            // Cannot go back further
            graph9_back_2 = history.goBack(origGraph, 2);
            assert.deepEqual(origGraph, graph9_back_2);
        })
    });
});
