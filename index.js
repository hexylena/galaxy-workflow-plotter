require("./bower_components/google-material-icons/dist/material-icons-font.min.css");
require("./bower_components/Materialize/dist/css/materialize.min.css");
require("./index.css");
require("./bower_components/jquery/dist/jquery.js");
require("./bower_components/Materialize/dist/js/materialize.min.js");
require("./bower_components/d3/d3.min.js");
require("./bower_components/file-saver/FileSaver.js");
require("./index.js");
require.context("./", false, /^\.\/.*\.html/);


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
    dirty = false;

var zoom = d3.zoom()
    .scaleExtent([0.2, 10])
    .on("zoom", zoomed);

var drag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
    .call(zoom);

var rect = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all");

var container = svg.append("g");

var cachedData = {};
var simulation = d3.forceSimulation();

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
        step.x = step.position.left / 5;
        step.y = step.position.top / 5;
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

function save(){
    if(dirty){
        console.log("Saving");
        console.log(graph.config);
        sessionStorage.setItem('graph', JSON.stringify(graph));
    }
    dirty = false;
}

function restore(){
    graph = JSON.parse(sessionStorage.getItem('graph'));

    for(var idx in mapped_parameters){
        $("#" + mapped_parameters[idx]).val(graph.config[mapped_parameters[idx]])
    }
    console.log(graph);
    dirty = false;
}

$("#node_color")            .on('input', function(event){ graph.config.node_color = event.target.value; dirty = true; })
$("#node_stroke_color")     .on('input', function(event){ graph.config.node_stroke_color = event.target.value; dirty = true; })
$("#node_text_color")       .on('input', function(event){ graph.config.node_text_color = event.target.value; dirty = true; })
$("#node_border_thickness") .on('input', function(event){ graph.config.node_border_thickness = event.target.value; dirty = true; })
$("#link_stroke")           .on('input', function(event){ graph.config.link_stroke = event.target.value; dirty = true; })
$("#link_thickness")        .on('input', function(event){ graph.config.link_thickness = event.target.value; dirty = true; })
$("#unfocused_opacity")     .on('input', function(event){ graph.config.unfocused_opacity = event.target.value; dirty = true; })

d3.json("ex.ga", function(error, loadedGraph) {
    if (error) throw error;

    var obj = JSON.parse(sessionStorage.getItem('user')); // An object :D

    if (sessionStorage.getItem("graph") === null) {
        graph = processGalaxyWorkflowToGraph(loadedGraph);
        graph.config = default_config;
        save();
    } else {
        restore()
    }

    var link = container.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("stroke", "black")
        .attr("fill", "none")
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

    //function brushmove(target, type, selection, sourceEvent){
        //console.log(selection[0])
    //}

    //var brush = d3.brush()
        //;

    //svg.append("g")
        //.attr("class", "brush")
        //.call(d3.brush().on("brush", brushmove).on("end", brushmove))
        //;

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked)
        ;

    //simulation.force("link")
        //.links(graph.links);

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
                sx = source.x;
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
            .attr("stroke", graph.config.link_stroke)
            .attr("stroke-width", graph.config.link_thickness)
            ;

        node
            .attr("fill",   graph.config.node_color)
            .attr("stroke", graph.config.node_stroke_color)
            .attr("stroke-width", graph.config.node_border_thickness)
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });

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
});

function dottype(d) {
  d.x = +d.x;
  d.y = +d.y;
  return d;
}

function zoomed(x) {
    tx = d3.event.transform;
    txf = "translate(" + tx.x + " " + tx.y + ") scale(" + tx.k + ")";
    container.attr("transform", txf);
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

$("#left_col").height($(window).height())
$("#left_col_contents").height( $(window).height() - $("#logo").height() - 20 )
$("#download").click(function(){
    var blob = new Blob(
        [$("#svg_container").html()],
        {type: "image/svg+xml"});
    saveAs(blob, "workflow_plot.svg");
});
