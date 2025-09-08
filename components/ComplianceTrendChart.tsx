import React, { useEffect, useRef } from 'react';

declare const Chart: any; // Use declare to inform TypeScript about the global Chart object

interface ComplianceTrendChartProps {
  data: number[];
  labels: string[];
}

const ComplianceTrendChart: React.FC<ComplianceTrendChartProps> = ({ data, labels }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      // Destroy previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      
      const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cumplimiento',
            data: data,
            borderColor: '#38bdf8',
            backgroundColor: gradient,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#38bdf8',
            pointHoverBackgroundColor: '#38bdf8',
            pointHoverBorderColor: '#ffffff',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              titleColor: '#cbd5e1',
              bodyColor: '#cbd5e1',
              borderColor: '#334155',
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.raw}%`
              }
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              min: Math.min(...data) > 20 ? Math.max(0, Math.min(...data) - 10) : 0,
              max: 100,
              ticks: {
                color: '#94a3b8',
                callback: (value) => `${value}%`,
              },
              grid: {
                color: 'rgba(51, 65, 85, 0.5)',
                drawBorder: false,
              },
            },
            x: {
              ticks: {
                color: '#94a3b8',
              },
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }

    // Cleanup on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, labels]);

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-xl p-4 sm:p-6 shadow-lg h-80">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Tendencia de Cumplimiento</h3>
      <div className="relative h-full w-full">
        {data.length > 0 ? (
          <canvas ref={chartRef}></canvas>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">No hay suficientes datos para mostrar la tendencia.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceTrendChart;
