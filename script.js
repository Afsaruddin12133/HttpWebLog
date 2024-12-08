let requestCount = 0;
let getRequests = 0;
let postRequests = 0;
let avgResponseTime = 0;
let requestLogs = [];
let ipCount;
let otherRequests = 0;

// Initialize charts
let requestTypeChart;
let responseTimeChart;
const totalRequest = document.getElementById('totalRequest');
const averageResponseTime = document.getElementById('avgResponseTime');
const getRequest = document.getElementById('getRequests');
const postRequest = document.getElementById('postRequests');
const otherRequest = document.getElementById('otherRequests');
const ipArrayDiv  = document.getElementById('ipArray');

function initializeCharts() {
    const requestTypeChartCtx = document.getElementById('requestTypeChart').getContext('2d');
    const responseTimeChartCtx = document.getElementById('responseTimeChart').getContext('2d');

    requestTypeChart = new Chart(requestTypeChartCtx, {
        type: 'pie',
        data: {
            labels: ['GET', 'POST', 'Other'],
            datasets: [{
                data: [getRequests, postRequests, requestCount - getRequests - postRequests],
                backgroundColor: ['#FF5733', '#33FF57', '#3357FF'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
        },
    });

    responseTimeChart = new Chart(responseTimeChartCtx, {
        type: 'line',
        data: {
            labels: requestLogs.map(log => log.clientIP),
            datasets: [{
                label: 'Response Time (ms)',
                data: requestLogs.map(log => log.responseTime),
                borderColor: '#FF5733',
                backgroundColor: 'rgba(255, 87, 51, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Client IPs',
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Response Time (ms)',
                    },
                    min: 0,
                },
            },
        },
    });
}

function fetchMetrics() {
    fetch('http://localhost:8080/metrics')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            requestCount = data.totalRequests;
            getRequests = data.getRequests;
            postRequests = data.postRequests;
            avgResponseTime = data.avgResponseTime;
            otherRequests = data.otherRequests;
            ipCount = data.ipCount;
            requestLogs = data.requestLogs;
            
            totalRequest.innerHTML = `Total Request Made : ${requestCount}`;
            getRequest.innerHTML = `Get : ${getRequests}`;
            postRequest.innerHTML = `Post: ${postRequests}`;
            otherRequest.innerHTML = `Other: ${otherRequests}`;

            averageResponseTime.innerHTML = `Average Response Time : ${avgResponseTime.toFixed(2)} ms`;

            
            let htmlContent = "<ul>";
            for (const [ip, count] of Object.entries(ipCount)) {
                htmlContent += `<li>${ip}  = ${count}</li>`;
            }
            htmlContent += "</ul>";

            
            ipArrayDiv.innerHTML = htmlContent;
            
            updateCharts();
            updateTable();
        })
        .catch(error => {
            console.error('Error fetching metrics:', error);
        });
}

function updateCharts() {
    requestTypeChart.data.datasets[0].data = [
        getRequests,
        postRequests,
        requestCount - getRequests - postRequests
    ];
    requestTypeChart.update();

    responseTimeChart.data.labels = requestLogs.map(log => log.clientIP);
    responseTimeChart.data.datasets[0].data = requestLogs.map(log => log.responseTime);
    responseTimeChart.update();
}

function updateTable() {
    const tableBody = document.getElementById('requestTable').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear current rows

    requestLogs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.method}</td>
            <td>${log.responseTime}</td>
            <td>${log.clientIP}</td>
        `;
        tableBody.appendChild(row);
        console.log(log);
        
    });
}

function simulateRequest(method) {
    fetch(`http://localhost:8080/`, {
        method: method,
    }).then(fetchMetrics);
}

initializeCharts();
setInterval(fetchMetrics, 1000);
