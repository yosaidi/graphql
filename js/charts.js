// js/charts.js

/**
 * Creates an SVG container for a D3.js chart.
 * @param {string} containerId - The ID of the DOM element to append the SVG to.
 * @param {number} width - The width of the SVG.
 * @param {number} height - The height of the SVG.
 * @param {object} margin - An object with top, right, bottom, left margins.
 * @returns {object} The D3 selection for the SVG group element.
 */
function createSvgContainer(containerId, width, height, margin) {
    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    return svg;
}

/**
 * Renders the XP over time line chart using D3.js.
 * @param {string} containerId - The ID of the DOM element to render the chart in.
 * @param {Array<object>} data - The transaction data.
 */
export function renderXpOverTimeChart(containerId, data) {
    // Chart dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = createSvgContainer(containerId, width, height, margin);

    // Parse dates and cumulative XP
    let cumulativeXp = 0;
    const processedData = data.map(d => ({
        date: new Date(d.createdAt),
        value: cumulativeXp += d.amount
    }));

    // Create scales
    const x = d3.scaleTime()
        .domain(d3.extent(processedData, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.value)])
        .range([height, 0]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
        .datum(processedData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.date))
            .y(d => y(d.value))
        );
}

/**
 * Renders the audit ratio pie chart using D3.js.
 * @param {string} containerId - The ID of the DOM element to render the chart in.
 * @param {object} auditData - An object with totalUp and totalDown properties.
 */
export function renderAuditRatioChart(containerId, auditData) {
    // Chart dimensions
    const width = 450;
    const height = 450;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(containerId)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const data = {
        ' audits done': auditData.totalUp,
        ' audits received': auditData.totalDown
    };

    // Create color scale
    const color = d3.scaleOrdinal()
        .domain(Object.keys(data))
        .range(["#98abc5", "#8a89a6"]);

    // Create pie generator
    const pie = d3.pie()
        .value(d => d[1]);

    const data_ready = pie(Object.entries(data));

    // Create arc generator
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Build the pie chart
    svg.selectAll('slices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data[0]))
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

    // Add labels
    svg.selectAll('slices')
        .data(data_ready)
        .enter()
        .append('text')
        .text(d => d.data[0])
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", 15);
}
