import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

/*
const COLORS = [
  '#FF6384', // Red
  '#36A2EB', // Blue
  '#FFCE56', // Yellow
  '#4BC0C0', // Cyan
  '#9966FF', // Purple
  '#FF9F40', // Orange
  '#6A2135', // Maroon
  '#33FF99', // Green
  // Add more colors as needed
];
*/
const TagsChart = ({ tagsData }) => {
  const chartRef = useRef(null);
  let chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy(); // Destroy previous chart instance
    }

    const labels = tagsData.map((data) => data.tag);
    const data = tagsData.map((data) => data.count);
    // const backgroundColors = COLORS.slice(0, tagsData.length); // Use fixed colors

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Category Count',
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 1,
          },
        ],
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

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy(); // Cleanup on component unmount
      }
    };
  }, [tagsData]);

  return <canvas ref={chartRef} />;
};

export default TagsChart;
