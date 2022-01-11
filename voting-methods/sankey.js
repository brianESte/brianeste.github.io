// Documentation can be found here: https://github.com/d3/d3-sankey/blob/master/README.md


/*  Sankey diagram prep */
// set the dimensions and margins of the graph
var width = 500,
    height = 300;

// create color scale / list
var color = d3.scaleOrdinal(d3.schemeCategory10);
    //formatNumber = d3.format(",.0f");    // zero decimal places
    
function format(d){ return d + " Votes"; }; // formatNumber


// select the svg tag to hold the diagram
var svg = d3.select("#results");
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom);

// Set the sankey diagram properties
sankey.size([width, height])
    .nodeId(d => d.id)
    .nodeWidth(36)
    .nodePadding(10)         // set node padding to 0
    .nodeSort((a, b) => { return b.value - a.value; })
    .nodeAlign(d3.sankeyCenter);
    // may try to set the links to not criss cross as much... .linkSort()?


// load the data
//d3.json("sankey.json", function (error, graph) {

function build_sankey(data){
    // need to clear previous sankey / clear the svg
    svg.select("g.node-holder").remove();
    svg.select("g.link-holder").remove();

    let graph = sankey(data);
    
    // create node svg-g's
    let nodes = svg.append("g").attr("class", "node-holder")
        .selectAll(".node")
        .data(graph.nodes).enter()
        .append("g")
        .attr("class", "node")
        //.selectAll("rect")
        .attr("transform", d => {   return "translate(" + d.x0 + "," + d.y0 + ")";    });
        
    // add the svg rectangles to the node g's
    nodes.append("rect")
        .attr("height", d => d.y1 - d.y0)
        .attr("width", sankey.nodeWidth())
        .style("fill", d => {   return d.color = color(d.name); })
        //.style("stroke", d => { return d3.rgb(d.color).darker(2); })
        .append("title")
        .text(d => {    return d.name + "\n" + format(d.value); });
    // the svg-title tag is generally rendered as a tooltip (displayed on hover). 

    // add in the title for the nodes
    nodes.append("text")
        .attr("x", -6)
        // set the y position of the text so that it is not pushed off the bottom of the diagram
        .attr("y", d => { return Math.min((d.y1-d.y0)/2, height -d.y0 -7.5); })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(d => d.name)
        .filter(d => { return d.x0 < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    // create svg g's for the links 
    let links = svg.append("g").attr("class", "link-holder")
        .selectAll("path")
        .data(graph.links).enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("fill", "none")
        .attr("stroke", d => d.target.color) 
        .attr("stroke-width", d => d.width)
        .attr("stroke-opacity", 0.5);

    links.append("title")
        .text(d => {    return d.source.name + " → " + d.target.name + "\n" + format(d.value);  });
}
