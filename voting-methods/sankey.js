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

// function to sum link values for linkSort()
function reducer(prev, acc){    return prev + acc.value;    }

// Set the sankey diagram properties
sankey.size([width, height])
    .nodeId(d => d.id)
    //.iterations(5)    // not sure how useful this property is
    .nodeWidth(36)
    .nodePadding(10)         // set node padding to 0
    .nodeSort((a, b) => { return b.value - a.value; })
    .linkSort((a, b) => {
        // I would like to use b.target.value to shorten this, but it doesn't seem to be valid
        return b.target.targetLinks.reduce(reducer, 0) - a.target.targetLinks.reduce(reducer, 0) + 
            b.source.sourceLinks.reduce(reducer, 0) - a.source.sourceLinks.reduce(reducer, 0);
    });
    

function build_sankey(data){
    // set the y position of the text so that it is not pushed off the bottom of the diagram
    const node_y = d => Math.min((d.y1-d.y0)/2 + 7, height -d.y0 -7.5);
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
        .text(d => d.name)
        .attr("x", sankey.nodeWidth()/2 + 6)
        .attr("y", node_y)
        //.attr("dy", ".35em")
        .attr("transform-origin", d => `${sankey.nodeWidth()/2 -1}px ${node_y(d) -7}px`)
        .attr("text-anchor", "end");

    // if Exhausted node exists and on mobile:
    if(data.nodes.some(n => n.name == "Exhausted") && window.innerWidth < 500){
        // try to get the exhausted node the smart way. if unable, go robust:
        try{
            var node_ex = graph.nodes.at(-1);
        } catch(error){
            // The mobile ecosia browser doesn't recognize .at() as a valid fn, hence this workaround
            $("#error-panel").html(error);
            var node_ex = graph.nodes[graph.nodes.length-1];    
        }
        
        // if the exhausted node is less than 100 in height:
        if(node_ex.y1 - node_ex.y0 < 100){
            // assign class "exh" to last node
            nodes.filter(":last-child").classed("exh", true);
            //console.log(nodes.filter(":last-child"));  //.attr("class", "exh node");
        } else {
            nodes.filter(":last-child").select("text")
                .attr("style", "transform: translate(0, -39px) rotate(-90deg);");
        }
    }

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
