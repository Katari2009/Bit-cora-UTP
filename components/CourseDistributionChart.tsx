import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface CourseDistributionChartProps {
  data: number[];
  labels: string[];
}

const CHART_COLORS = [
  '#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#22c55e', '#6366f1', '#ec4899'
];

const CourseDistributionChart: React.FC<CourseDistributionChartProps> = ({ data, labels }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cumplimiento',
            data: data,
            backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
            borderColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
            borderWidth: 1,
            borderRadius: 4,
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
                label: (context: any) => `${context.dataset.label}: ${context.raw}%`
              }
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                color: '#94a3b8',
                callback: (value: string | number) => `${value}%`,
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

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, labels]);

  const hasRecords = data.some(d => d > 0);

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-xl p-4 sm:p-6 shadow-lg h-80">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Distribución por Curso</h3>
       <div className="relative h-full w-full">
        {hasRecords ? (
          <canvas ref={chartRef}></canvas>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">No hay registros para mostrar la distribución.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDistributionChart;