import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const MonthlyPostsChart = ({ postsPerMonth }) => {
  const chartRef = useRef(null);
  let chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy(); // Destroy previous chart instance
    }

    const labels = Object.keys(postsPerMonth);
    const data = Object.values(postsPerMonth);

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Posts per Month',
            data: data,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.1,
          },
        ],
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy(); // Cleanup on component unmount
      }
    };
  }, [postsPerMonth]);

  return <canvas ref={chartRef} />;
};

export default MonthlyPostsChart;
