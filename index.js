require("./index.css");
require("./index.js");
require.context("./", false, /^\.\/.*\.html/);
var fileSaver = require("./bower_components/file-saver/FileSaver.js");

var Raven  = require("./bower_components/raven-js/dist/raven.js");
Raven.config('https://c1404b96be204c03be5725b9194d2de8@biobio-monitor.tamu.edu/9').install()

var d3 = require("./bower_components/d3/d3.js");
var margin = {top: -5, right: -5, bottom: -5, left: -5},
    width = $("#right_col").width() + 20 - margin.left - margin.right,
    mapped_parameters = [
        'node_color',
        'node_stroke_color',
        'node_text_color',
        'node_border_thickness',
        'link_stroke',
        'link_thickness',
        'unfocused_opacity',
    ],
    height = $(window).height() - margin.top - margin.bottom
    default_config = {
        node_color: '#ebd9b2',
        node_stroke_color: '#d6b161',
        node_text_color: '#000000',
        node_border_thickness: 1,

        link_stroke: '#000000',
        link_thickness: 1,
        unfocused_opacity: 30,

        font_family: 'Ubuntu Mono, monospace',
        node_height: 20,
        node_width: 80,
        node_padding: 5,
    },
    graph = {
        config: default_config
    },
    node_color_node = $("#node_color"),
    node_stroke_color_node = $("#node_stroke_color"),
    node_text_color_node = $("#node_text_color"),
    node_border_thickness_node = $("#node_border_thickness"),
    link_stroke_node = $("#link_stroke"),
    link_thickness_node = $("#link_thickness"),
    container = null,
    simulation = null,
    dirty = false;

var zoom = d3.zoom()
    .scaleExtent([0.2, 10])
    .on("zoom", zoomed);

var drag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

var positionOfNode = function(graph, id){
    if(isNaN(parseInt(id))){
        //Sometimes passed object
        id = id.id;
    }
    for(var i in graph.nodes){
        if(parseInt(graph.nodes[i].id) === id){
            return graph.nodes[i];
        }
    }
}

var processGalaxyWorkflowToGraph = function(ga){
    graph = {
        'meta': {
            'name': ga.name,
            'annotation': ga.annotation,
            'uuid': ga.uuid,
        },
        'links': [],
        'nodes': [],
    };

    for(var i in ga.steps){
        var step = ga.steps[i];
        step.x = step.position.left;
        step.y = step.position.top;
        step.focus = true;
        if(Math.random() > 0.4){
            step.focus = false;
        }
        graph.nodes.push(step);

        for(var j in ga.steps[i].input_connections){
            if(Array.isArray(ga.steps[i].input_connections[j])){
                for(var k in ga.steps[i].input_connections[j]){
                    var source = parseInt(i);
                    var target = ga.steps[i].input_connections[j][k].id;

                    if(target && source){
                        graph.links.push({
                            source: {
                                id: source,
                                x: step.position.left / 4,
                                y: step.position.top / 4,
                            },
                            target: target,
                        })
                    }
                }
            }else{
                var source = parseInt(i);
                var target = ga.steps[i].input_connections[j].id;

                if(typeof target !== 'undefined' && typeof source !== 'undefined'){
                    graph.links.push({
                        source: source,
                        target: target,
                    })
                }
            }
        }
    }
    return graph;
}


function hexToRgb(hex) {
    // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb/11508164#11508164
    var bigint = parseInt(hex.substring(1), 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r, g, b]
}

function save(){
    if(dirty){
        console.log("Saving");
        console.log(graph.config);
        sessionStorage.setItem('graph', JSON.stringify(graph));
        //Materialize.toast('Saved', 1000)
        dirty = false;
    }
}

function restore(){
    graph = JSON.parse(sessionStorage.getItem('graph'));

    for(var idx in mapped_parameters){
        $("#" + mapped_parameters[idx]).val(graph.config[mapped_parameters[idx]])
    }
    dirty = false;
}

$("#node_color")            .on('input', function(event){ graph.config.node_color = event.target.value;            dirty = true; })
$("#node_stroke_color")     .on('input', function(event){ graph.config.node_stroke_color = event.target.value;     dirty = true; })
$("#node_text_color")       .on('input', function(event){ graph.config.node_text_color = event.target.value;       dirty = true; })
$("#node_border_thickness") .on('input', function(event){ graph.config.node_border_thickness = event.target.value; dirty = true; })
$("#link_stroke")           .on('input', function(event){ graph.config.link_stroke = event.target.value;           dirty = true; /* this one updates some non-ticking params */ })
$("#link_thickness")        .on('input', function(event){ graph.config.link_thickness = event.target.value;        dirty = true; })
$("#unfocused_opacity")     .on('input', function(event){ graph.config.unfocused_opacity = event.target.value;     dirty = true; })

function draw(){
    $("svg").empty();

    var svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
        .call(zoom);

    var defs = d3.select('svg')
        .append('defs');

    defs.append('marker')
        .attr('orient', 'auto')
        .attr('refX', '0.0')
        .attr('refY', '0.0')
        .attr('id', 'Arrow')
        .attr('style', 'overflow:visible')
        .append('path')
        .attr('style', "fill-rule:evenodd;stroke-linejoin:round;fill:" + graph.config.link_stroke + ";fill-opacity:1")
        .attr('d',"M 8.7185878,4.0337352 L -2.2072895,0.016013256 L 8.7185884,-4.0017078 C 6.9730900,-1.6296469 6.9831476,1.6157441 8.7185878,4.0337352 z ")
        .attr('transform', 'scale(0.6)')
        ;

    var grad_dec = defs.append('linearGradient')
        .attr('id', 'grad_dec');
    grad_dec.append('stop')
        .attr('style', 'stop-color:' + graph.config.link_stroke + ';stop-opacity:1')
        .attr('offset', '0.3')
    grad_dec.append('stop')
        .attr('style', 'stop-color:' + graph.config.link_stroke + ';stop-opacity:' + graph.config.unfocused_opacity / 100)
        .attr('offset', '0.5')

    var grad_inc = defs.append('linearGradient')
        .attr('id', 'grad_inc');
    grad_inc.append('stop')
        .attr('style', 'stop-color:' + graph.config.link_stroke + ';stop-opacity:' + graph.config.unfocused_opacity / 100)
        .attr('offset', '0.5')
    grad_inc.append('stop')
        .attr('style', 'stop-color:' + graph.config.link_stroke + ';stop-opacity:1')
        .attr('offset', '0.7')
    //<linearGradient
       //inkscape:collect="always"
       //id="linearGradient4371">
      //<stop
         //style="stop-color:#000000;stop-opacity:1;"
         //offset="0"
         //id="stop4373" />
      //<stop
         //style="stop-color:#000000;stop-opacity:0;"
         //offset="1"
         //id="stop4375" />
    //</linearGradient>


    var rect = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all");

    container = svg.append("g");

    var cachedData = {};
    simulation = d3.forceSimulation();

    var link = container.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("marker-start", "url(#Arrow)")
        ;

    var node_group = container.append("g")
        .attr("class", "nodes")
        .selectAll("rect")
        .data(graph.nodes)
        .enter()
        .append("g").call(
            d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        )
        .on("click", function(d){
            cachedData[d.id].focus = !cachedData[d.id].focus;
            tmpnode = positionOfNode(graph, d.id)
            tmpnode.focus = cachedData[d.id].focus
            dirty = true;
            save();
        })
        ;


    var node = node_group
        .append("rect")
        .attr("height", graph.config.node_height + 2 * graph.config.node_padding)
        .attr("width", graph.config.node_width + 2 * graph.config.node_padding)
        ;

    var labels = node_group
        .append("text")
        .attr("class", "labels")
        .text(function(d){ return d.name; })
        ;

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked)
        ;

    function ticked() {
        link
            .attr("d", function(d){
                target = positionOfNode(graph, d.target)
                source = positionOfNode(graph, d.source)
                if(cachedData[d.target]){
                    tx = target.x + cachedData[d.target].width;
                } else {
                    tx = 0;
                }
                ty = target.y + graph.config.node_height / 2;
                if(!source.x){
                    sx = 0;
                }else{
                    sx = source.x;
                }
                sy = source.y + graph.config.node_height / 2;
                if(!tx || !ty || !sx || !sy){
                    return 'M100,100'
                }

                cp1x = undefined;
                cp2x = undefined;

                if(sx > tx + 30){
                    cp1x = cp2x = ((sx + tx) / 2);
                }else{
                    diff = Math.min((tx - sx + 45), 30);
                    cp1x = (sx - diff)
                    cp2x = (tx + diff)
                }

                data = 'M' + sx + ',' + sy + 'C' + cp1x +',' + sy + ' ' + cp2x +',' + ty + ' ' + tx +',' + ty
                return data;
            })
            //.attr("stroke", graph.config.link_stroke)
            .attr("stroke", function(d){
                target = positionOfNode(graph, d.target)
                source = positionOfNode(graph, d.source)

                if((cachedData[source.id]) && (cachedData[target.id])){
                    if(cachedData[source.id].focus && cachedData[target.id].focus){
                        return graph.config.link_stroke;
                    } else if (cachedData[source.id].focus && !cachedData[target.id].focus){
                        return 'url(#grad_inc)'
                    } else if (!cachedData[source.id].focus && cachedData[target.id].focus){
                        return 'url(#grad_dec)'
                    } else {
                        var rgb  = hexToRgb(graph.config.link_stroke)
                        return 'rgba(' + rgb[0] / 255 + ','  + rgb[1] / 255 + ','  + rgb[2] / 255 + ',' + graph.config.unfocused_opacity / 100 + ')';
                    }
                }
                return 'black';
            })
            .attr("stroke-width", graph.config.link_thickness)
            //.attr("opacity", function(d){
                //target = positionOfNode(graph, d.target)
                //source = positionOfNode(graph, d.source)

                //if((cachedData[source.id] && cachedData[source.id].focus) && (cachedData[target.id] && cachedData[target.id].focus)){
                    //return 1
                //}
                //return graph.config.unfocused_opacity / 100;
            //})
            ;

        node
            .attr("fill",   graph.config.node_color)
            .attr("stroke", graph.config.node_stroke_color)
            .attr("stroke-width", graph.config.node_border_thickness)
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; })
            .attr("opacity", function(d){
                if(cachedData[d.id] && cachedData[d.id].focus){
                    return 1
                }
                return graph.config.unfocused_opacity / 100;
            })
            ;

        labels
            .attr("stroke", function(d){
                cachedData[d.id] = {
                    width: this.getComputedTextLength() + 2 * graph.config.node_padding,
                    focus: (cachedData[d.id]) ? cachedData[d.id].focus : d.focus,
                }
                d3.select(this.parentNode.children[0]).attr('width', cachedData[d.id].width);
            })
            .attr("font-family", graph.config.font_family)
            .attr("fill", graph.config.node_text_color)
            .attr("opacity", function(d){
                if(cachedData[d.id].focus){
                    return 1
                }
                return graph.config.unfocused_opacity / 100;
            })
            .attr("x", function(d) { return d.x + graph.config.node_padding; })
            .attr("y", function(d) { return d.y + 15 + graph.config.node_padding; });//TODO
    }
};

function zoomed(x) {
    tx = d3.event.transform;
    txf = "translate(" + tx.x + " " + tx.y + ") scale(" + tx.k + ")";
    container.attr("transform", txf);
    //$("#position").text(parseInt(tx.x) + ", " + parseInt(tx.y));
}

function dragstarted(d) {
    dirty = true;
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x; d.fy = d.y;
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    d.fx = null;
    d.fy = null;
    d3.select(this).classed("dragging", false);
    save();
}

function load(){
    console.log("Loading")
    if (sessionStorage.getItem("graph") === null) {
        console.log("No stored graph")
        d3.json("ex.ga", function(error, loadedGraph){
            if (error){
                Materialize.toast(error, 4000)
                throw error;
            }
            graph = processGalaxyWorkflowToGraph(loadedGraph);
            graph.config = default_config;
            save();
            draw();
        })
    } else {
        console.log("Restoring")
        restore();
        draw();
    }
}

load();

$("#left_col").height($(window).height() + 15);
$("#left_col_contents").height( $(window).height() - $("#logo").height() - 20 + 15)
$("#download").click(function(){
    var blob = new Blob(
        [$("#svg_container").html()],
        {type: "image/svg+xml"});
    fileSaver.saveAs(blob, "workflow_plot.svg");
});

$("#uploaded_workflow").on('change', function(evt){
    var file = evt.target.files[0]
    var reader = new FileReader();

    reader.onloadend = function(event) {
        if (event.target.readyState == FileReader.DONE) { // DONE == 2
            try{
                var data = JSON.parse(event.target.result);
                graph = null;
                graph = processGalaxyWorkflowToGraph(data);
                graph.config = default_config;
                sessionStorage.setItem('graph', JSON.stringify(graph));
                sessionStorage.setItem('graph', JSON.stringify(graph));
                Materialize.toast('Saved', 1000)
                draw();
            } catch(ex) {
                  Materialize.toast('Failed to parse JSON', 4000) // 4000 is the duration of the toast
            }
        }
    };

    var blob = file.slice(0, file.size);
    reader.readAsBinaryString(blob);

});

$("#upload").click(function(){
    $("#uploaded_workflow")[0].click();
});

$("#help").click(function(){
    int(); // intentional
});

$(window).on('load resize', function(){
    height = $(window).height() - margin.top - margin.bottom
    $("#left_col").height($(window).height() + 15);
    $("#left_col_contents").height( $(window).height() - $("#logo").height() - 20 + 15)

    d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .select("rect")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
});
