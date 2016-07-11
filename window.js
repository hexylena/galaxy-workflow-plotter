$("#left_col").height($(window).height())
$("#left_col_contents").height( $(window).height() - $("#logo").height() - 20 )

$("#download").click(function(){
    var blob = new Blob(
        [$("#svg_container").html()],
        {type: "image/svg+xml"});
    saveAs(blob, "workflow_plot.svg");
});
