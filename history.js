module.exports = {
    graphHistory: [],
    historyIdx: 0,

    clone: function(obj){
        return JSON.parse(JSON.stringify(obj));
    },

    reset: function(){
        this.graphHistory = [];
        this.historyIdx = 0;
    },

    data: function(){
        return {
            'h': this.historyIdx,
            'g': this.graphHistory,
        };
    },

    restore: function(data){
        this.graphHistory = data.g;
        this.historyIdx = data.h;
    },

    canGoBack: function(steps){
        if(steps === undefined){
            steps = 1
        }

        if(steps > this.graphHistory.length){
            return false;
        }
        return this.historyIdx - steps >= 0;
    },

    pushHistory: function(data){
        key = data[0];
        value = data[1];
        if(this.historyIdx !== this.graphHistory.length){
            // Otherwise we have gone back in history, need to slice and dice.
            this.graphHistory = this.graphHistory.slice(0, this.historyIdx);
        }
        // If our history idx is length, then safe to push
        this.graphHistory.push([key, value]);
        this.historyIdx = this.graphHistory.length;
    },

    applyHistoryActionToGraph: function(g, historyAction){
        // g assumed to be safe to mutate
        key = historyAction[0];
        val = historyAction[1];
        if(key.startsWith("graph.config.")){
            g.config[key.substring(13)] = val;
        } else if (key === "focus") {
            for(var x in g.nodes){
                if(g.nodes[x].id == val[0]){
                    g.nodes[x].focus = val[1];
                    break;
                }
            }
            //g.nodes[val[0]] = val[1];
        } else if (key === "translate") {
            // TODO?
        } else if (key === "point"){
            for(var x in g.nodes){
                if(g.nodes[x].id == val[0]){
                    g.nodes[x].x = val[1];
                    g.nodes[x].y = val[2];
                    break;
                }
            }
        } else {
            console.log("Do not know how to handle " + key);
        }
        return g
    },

    applyHistoryToGraph: function (g, h){
        console.log("Rebuilding graph from history. Applying " + h.length + " ops");
        var clonedOrigGraph = this.clone(g);
        for(var i = 0; i < h.length; i++){
            clonedOrigGraph = this.applyHistoryActionToGraph(
                clonedOrigGraph,
                h[i]
            );
        }
        return clonedOrigGraph
    },

    goBack: function(graph, steps){
        if(steps === undefined){
            steps = 1
        }
        // Exit early if asking too much
        if(!this.canGoBack(steps)){
            return;
        }
        hIdx = this.historyIdx - steps;
        tmpHist = this.clone(this.graphHistory);
        tmpHist = tmpHist.slice(0, hIdx);
        tmpGraph = this.clone(graph);
        g = this.applyHistoryToGraph(tmpGraph, tmpHist)
        return g;
    },
};
