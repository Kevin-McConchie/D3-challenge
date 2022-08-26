// Define SVG size and margins
var svgWidth = 960
var svgHeight = 500

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// set width and height
var width = svgWidth - margin.left - margin.right
var height = svgHeight - margin.top - margin.bottom


// Create an SVG wrapper, append an SVG group that will hold our chart,
// and group the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);


// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare"

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
        d3.max(data, d => d[chosenXAxis]) * 1.1
        ])
        .range([0, width]);
    return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.9,
        d3.max(data, d => d[chosenYAxis]) * 1.1
        ])
        .range([height, 0]);
    return yLinearScale;

}

// function used for updating yAxis var upon click on axis label
function renderX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

function renderY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis) {
    textGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return textGroup;
}

// ############################################
// function used for updating circles group with new tooltip info
function updateToolTip(chosenXAxis, textGroup, circlesGroup) {
    var label;
    if (chosenXAxis === "poverty") {
        label = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        label = "Age:";
    }
    else if (chosenXAxis === "income") {
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
            return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
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
        d.age = +d.age;
        d.income = +d.income;
        d.healthcare = +d.healthcare;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;

    });
    // xLinearScale f
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    // // Create y scale function
    // var yLinearScale = d3.scaleLinear()
    //     .domain([0, d3.max(data, d => d.healthcare)])
    //     .range([height, 0]);


    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // var yAxis = chartGroup.append("g")
    //     .classed("y-axis", true)
    //     .attr("transform", `translate(${width},0 )`)
    //     .call(leftAxis);

    // // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 18)
        .attr("fill", "blue")
        .attr("opacity", ".25")
        .attr("font-size", 12)

    // Create circle labels
    var textGroup = chartGroup.selectAll(".stateText")
        .data(data)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr('dy', 3)
        .attr("font-size", 12)
        .attr("color", "black")
        .text(d => d.abbr);


    // Create group for  x-axis labels
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

    // Create group for  -axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    // append y axis
    var ylabelsGroup = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Mean Healthcare")

    // var healtchareLabel = ylabelsGroup.append("text")
    //     .attr("x", 20)
    //     .attr("y", 0)
    //     .attr("value", "healthcare") // value to grab for event listener
    //     .classed("active", true)
    //     .text("Mean Healthcare");

    // var obesityLabel = ylabelsGroup.append("text")
    //     .attr("x", 40)
    //     .attr("y", 0)
    //     .attr("value", "obesity") // value to grab for event listener
    //     .classed("inactive", true)
    //     .text("Obesity Level");

    // var smokesLabel = ylabelsGroup.append("text")
    //     .attr("x", 60)
    //     .attr("y", 0)
    //     .attr("value", "smokes") // value to grab for event listener
    //     .classed("inactive", true)
    //     .text("Smokes");



    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, textGroup, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;
                chosenYAxis = value;

                // console.log(chosenXAxis)

                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);
                yLinearScale = yScale(data, chosenYAxis);

                // updates x axis with transition
                xAxis = renderX(xLinearScale, xAxis);
                // yAxis = renderY(yLinearScale, yAxis)

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,
                    yLinearScale, chosenYAxis);

                textGroup = renderText(textGroup, chosenXAxis,
                     chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis,textGroup, circlesGroup)

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
                else if (chosenXAxis === "age") {
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
