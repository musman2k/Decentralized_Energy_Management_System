import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import * as XLSX from 'xlsx';
import 'chartjs-plugin-annotation';

// Register necessary components with ChartJS to enable charts functionality
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard: React.FC = () => {
    // useState hooks to manage data and loading states
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // useEffect hook to load the Excel file when the component is first rendered
    useEffect(() => {
        // Fetch the Excel file from the specified path
        fetch('/src/Assets/AllData.xlsx')  // Adjust the path to your Excel file if necessary
            .then(response => response.arrayBuffer()) // Convert the response to an array buffer
            .then(buffer => {
                // Read the buffer using XLSX to parse the Excel file
                const workbook = XLSX.read(buffer, { type: 'array' });
                // Get the first sheet in the workbook
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                // Convert the sheet data to JSON format
                let jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Limit the number of data points to 50 for performance reasons
                jsonData = jsonData.slice(0, 50); // Load only the first 50 rows

                // Sort the data by 'Statistical Period' in descending order (latest first)
                jsonData.sort((a: any, b: any) => b['Statistical Period'] - a['Statistical Period']);

                // Set the processed data into the state and stop the loading indicator
                setData(jsonData);
                setLoading(false);
            });
    }, []); // Empty dependency array means this effect runs only once after the initial render

    // Display a loading spinner while data is being fetched and processed
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Function to convert Excel date-time serial numbers to JavaScript Date objects
    const convertExcelDateTime = (serial: number) => {
        const utc_days = Math.floor(serial - 25569); // Convert serial number to days since 1st Jan 1900
        const utc_value = utc_days * 86400; // Convert days to seconds since epoch
        const fractional_day = serial - Math.floor(serial) + 0.0000001; // Handle fractional part of the day
        const total_seconds = Math.floor(utc_value + fractional_day * 86400);
        const date = new Date(total_seconds * 1000); // Convert to milliseconds and create a Date object
        return date.toISOString().replace('T', ' ').substring(0, 16); // Format as "YYYY-MM-DD HH:mm"
    };

    // Extract labels (date-time) and data points for the charts from the sorted data
    const labels = data.map((row: any) => convertExcelDateTime(row['Statistical Period']));
    const exportData = data.map((row: any) => row['Export (kWh)']);
    const consumedData = data.map((row: any) => row['Consumed (kWh)']);
    const revenueData = data.map((row: any) => row['Revenue (PKR)']);

    // Data object for energy metrics chart (exported and consumed energy)
    const energyData = {
        labels: labels,
        datasets: [
            {
                label: 'Energy Exported (kWh)', // Label for the exported energy dataset
                data: exportData, // Data points for exported energy
                borderColor: '#00d084', // Green line color
                backgroundColor: 'rgba(0, 208, 132, 0.2)', // Light green fill under the line
                fill: true, // Fill the area under the line
                pointHoverRadius: 7, // Size of points on hover
                hoverBorderWidth: 2, // Border width of points on hover
            },
            {
                label: 'Energy Consumed (kWh)', // Label for the consumed energy dataset
                data: consumedData, // Data points for consumed energy
                borderColor: '#ff5c93', // Pink line color
                backgroundColor: 'rgba(255, 92, 147, 0.2)', // Light pink fill under the line
                fill: true, // Fill the area under the line
                pointHoverRadius: 7, // Size of points on hover
                hoverBorderWidth: 2, // Border width of points on hover
            }
        ]
    };

    // Data object for revenue chart
    const revenueDataSet = {
        labels: labels,
        datasets: [
            {
                label: 'Revenue (PKR)', // Label for the revenue dataset
                data: revenueData, // Data points for revenue
                backgroundColor: 'rgba(0, 123, 255, 0.5)', // Semi-transparent blue bars
                borderColor: '#007bff', // Blue border for bars
                borderWidth: 1, // Border width of bars
                hoverBorderWidth: 2, // Border width of bars on hover
            }
        ]
    };

    // Chart options for customizing the look and feel of the charts
    const chartOptions = {
        responsive: true, // Make the charts responsive to screen size
        plugins: {
            legend: {
                position: 'top' as const, // Position the legend at the top
                labels: {
                    color: 'white' // Set the text color of the legend to white
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        // Customize the tooltip to display values with commas for readability
                        return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
                    }
                }
            },
            title: {
                display: true, // Display a title above the chart
                text: 'Energy Overview', // Title text
                color: 'white' // Set the title color to white
            }
        },
        scales: {
            x: {
                ticks: { color: 'white', maxRotation: 45, minRotation: 45 }, // Rotate the x-axis labels for better readability
                grid: { color: 'rgba(255, 255, 255, 0.1)' } // Light grid lines for the x-axis
            },
            y: {
                ticks: { color: 'white' }, // Set the y-axis labels color to white
                grid: { color: 'rgba(255, 255, 255, 0.1)' } // Light grid lines for the y-axis
            }
        }
    };

    return (
        <div className="container mx-auto px-8 py-8 flex flex-col items-center bg-[#1a1a1a] min-h-screen text-white">
            {/* Display key metrics for total energy exported, consumed, and total revenue */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="p-4 bg-[#2a2a2a] rounded-lg text-center">
                    <h2 className="text-xl font-semibold text-[#0ff]">Total Energy Exported</h2>
                    <p className="text-2xl font-bold">{exportData.reduce((a: number, b: number) => a + b, 0).toLocaleString()} kWh</p>
                </div>
                <div className="p-4 bg-[#2a2a2a] rounded-lg text-center">
                    <h2 className="text-xl font-semibold text-[#0ff]">Total Energy Consumed</h2>
                    <p className="text-2xl font-bold">{consumedData.reduce((a: number, b: number) => a + b, 0).toLocaleString()} kWh</p>
                </div>
                <div className="p-4 bg-[#2a2a2a] rounded-lg text-center">
                    <h2 className="text-xl font-semibold text-[#0ff]">Total Revenue</h2>
                    <p className="text-2xl font-bold">{revenueData.reduce((a: number, b: number) => a + b, 0).toLocaleString()} PKR</p>
                </div>
            </div>

            {/* Display energy production and consumption graph side by side with revenue graph */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-8">
                <div className="p-4 bg-[#2a2a2a] rounded-lg">
                    <Line data={energyData} options={chartOptions} />
                </div>
                <div className="p-4 bg-[#2a2a2a] rounded-lg">
                    <Bar data={revenueDataSet} options={chartOptions} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
