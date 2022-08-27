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

// function used for updating axes var upon click on axis label
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
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return textGroup;
}

// ############################################
// function used for updating circles and text groups with new tooltip info and axes
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
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

    var ylabel;
    if (chosenYAxis === "healthcare") {
        ylabel = "Healthcare:";
    }
    else if (chosenYxis === "obesity") {
        ylabel = "Obesity:";
    }
    else if (chosenYAxis === "smokes") {
        ylabel = "Smokes:";
    }

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

// Bring in data from data.csv
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

    // LinearScales
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // create x & y axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 18)
        .attr("fill", "red")
        .attr("opacity", "1")
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
        .text(d => d.abbr);

    // Create label group for  x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("Poverty Rating Level");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Average Age in Years");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Mean Income in $");

    // Create labels group for  y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left / 4}, ${height / 2})`)
        .classed("axis-text", true);

    var healtchareLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 0 - 20)
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Mean Healthcare");

    var obesityLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 0 - 40)
        .attr("transform", "rotate(-90)")
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obesity Level");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 0 - 60)
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokers");

    // update tooltip when selected
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function (aText) {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderX(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,
                    yLinearScale, chosenYAxis);

                textGroup = renderText(textGroup, xLinearScale, chosenXAxis,
                    yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("aText", true)
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("aText", true)
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("aText", true)
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("aText", true)
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("aText", true)
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("aText", true)
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("aText", true)
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("aText", true)
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("aText", true)
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    // Create group for  y-axis labels
    ylabelsGroup.selectAll("text")
        .on("click", function ("aText") {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = value;

                // updates x scale for new data
                yLinearScale = yScale(data, chosenYAxis);

                // updates x axis with transition
                yAxis = renderY(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,
                    yLinearScale, chosenYAxis);

                textGroup = renderText(textGroup, xLinearScale, chosenXAxis,
                    yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)

                // changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    healtchareLabel
                        .classed("aText", true)
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("aText", true)
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("aText", true)
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "obesity") {
                    healtchareLabel
                        .classed("aText", true)
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("aText", true)
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("aText", true)
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healtchareLabel
                        .classed("aText", true)
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("aText", true)
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("aText", true)
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});
