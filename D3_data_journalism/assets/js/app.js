// Define SVG size and margins
var svgWidth = 960
var svgHeight = 500

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right
var height = svgHeight - margin.top - margin.bottom


// Create an SVG wrapper, append an SVG group that will hold our chart,
// and group the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// console.log(svg);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
// console.log(chartGroup);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;

}

// function used for updating yAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

// function used for updating circles group with new tooltip info
function updateToolTip(chosenXAxis, circlesGroup) {
    var label;
    if (chosenXAxis === "poverty") {
        label = "Poverty:";
    }
    else if(chosenXAxis === "age") {
        label = "Age:";
    }
    else if(chosenXAxis === "income") {
        label = "Income:";
    }
    
    // var ylabel;
    // if (chosenYAxis === "healthcare") {
    //     ylabel = "Healthcare:";
    // }
    // else if(chosenYxis === "obesity") { 
    //     ylabel = "Obesity:";
    // }
    // else if(chosenYAxis === "smokes") {
    //     ylabel = "Smokes:";
    // }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .style("color", "black")
        .style("background", 'white')
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .html(function (d) {
            return (`${d.abbr}<br>${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });
    return circlesGroup;
}

d3.csv("assets/data/data.csv").then(function (data, err) {
    if (err) throw err;

    // parse data
    data.forEach(function (d) {
        d.poverty = +d.poverty;
        d.povertyMoe = +d.povertyMoe;
        d.age = +d.age;
        d.ageMoe = +d.ageMoe;
        d.income = +d.income;
        d.incomeMoe = +d.incomeMoe;
        d.healthcare = +d.healthcare;
        d.healthcareLow = +d.healthcareLow;
        d.healthcareHigh = +d.healthcareHigh;
        d.obesity = +d.obesity;
        d.obesityLow = +d.obesityLow;
        d.obesityHigh = +d.obesityHigh;
        d.smokes = +d.smokes;
        d.smokesLow = +d.smokesLow;
        d.smokesHigh = +d.smokesHigh;
    });
    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.healthcare)])
        .range([height, 0]);

        // ### fix this ###
    // var yLinearScale = xScale(data, chosenYAxis); 

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);

    // ### fix this ###
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

        // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 18)
        .attr("fill", "orange")
        .attr("opacity", ".25");

    // Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("Poverty Rating Level");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Average Age in Years");

        var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Mean Income in $");


    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Mean Healthcare");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if(chosenXAxis === "age"){
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    }
            }
        });
}).catch(function (error) {
    console.log(error);
});
