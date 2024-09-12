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
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

   useEffect(() => {
        fetch('/src/Assets/AllData.xlsx')  
            .then(response => response.arrayBuffer()) 
            .then(buffer => {
                const workbook = XLSX.read(buffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                let jsonData = XLSX.utils.sheet_to_json(worksheet);

                jsonData = jsonData.slice(0, 50); 

                jsonData.sort((a: any, b: any) => b['Statistical Period'] - a['Statistical Period']);

                setData(jsonData);
                setLoading(false);
            });
    }, []); 

    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    
    const convertExcelDateTime = (serial: number) => {
        const utc_days = Math.floor(serial - 25569); 
        const utc_value = utc_days * 86400; 
        const fractional_day = serial - Math.floor(serial) + 0.0000001;
        const total_seconds = Math.floor(utc_value + fractional_day * 86400);
        const date = new Date(total_seconds * 1000); 
        return date.toISOString().replace('T', ' ').substring(0, 16); // Format as "YYYY-MM-DD HH:mm"
    };

    const labels = data.map((row: any) => convertExcelDateTime(row['Statistical Period']));
    const exportData = data.map((row: any) => row['Export (kWh)']);
    const consumedData = data.map((row: any) => row['Consumed (kWh)']);
    const revenueData = data.map((row: any) => row['Revenue (PKR)']);

    const energyData = {
        labels: labels,
        datasets: [
            {
                label: 'Energy Exported (kWh)', 
                data: exportData, 
                borderColor: '#00d084', 
                backgroundColor: 'rgba(0, 208, 132, 0.2)', 
                fill: true, 
                pointHoverRadius: 7, 
                hoverBorderWidth: 2, 
            },
            {
                label: 'Energy Consumed (kWh)', 
                data: consumedData, 
                borderColor: '#ff5c93', 
                backgroundColor: 'rgba(255, 92, 147, 0.2)', 
                fill: true, 
                pointHoverRadius: 7, 
                hoverBorderWidth: 2, 
            }
        ]
    };

    const revenueDataSet = {
        labels: labels,
        datasets: [
            {
                label: 'Revenue (PKR)', 
                data: revenueData, 
                backgroundColor: 'rgba(0, 123, 255, 0.5)', 
                borderColor: '#007bff', 
                borderWidth: 1, 
                hoverBorderWidth: 2, 
            }
        ]
    };

    const chartOptions = {
        responsive: true, 
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'white' 
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
                    }
                }
            },
            title: {
                display: true, 
                text: 'Energy Overview', 
                color: 'white' 
            }
        },
        scales: {
            x: {
                ticks: { color: 'white', maxRotation: 45, minRotation: 45 }, 
                grid: { color: 'rgba(255, 255, 255, 0.1)' } 
            },
            y: {
                ticks: { color: 'white' }, 
                grid: { color: 'rgba(255, 255, 255, 0.1)' } 
            }
        }
    };

    return (
        <div className="container mx-auto px-8 py-8 flex flex-col items-center bg-[#1a1a1a] min-h-screen text-white">
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
