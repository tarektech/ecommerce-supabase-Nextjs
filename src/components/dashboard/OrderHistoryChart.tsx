'use client';
import { OrderType } from '@/types';
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface OrderHistoryChartProps {
  orders: OrderType[];
}

export function OrderHistoryChart({ orders }: OrderHistoryChartProps) {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: any[];
  }>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    if (!orders || orders.length === 0) {
      setChartData({
        labels: [],
        datasets: [],
      });
      return;
    }

    // Group orders by month
    const ordersByMonth: Record<string, { total: number; count: number }> = {};

    orders.forEach((order) => {
      if (!order.created_at) return;

      const date = new Date(order.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;

      if (!ordersByMonth[key]) {
        ordersByMonth[key] = { total: 0, count: 0 };
      }

      ordersByMonth[key].total += order.total;
      ordersByMonth[key].count += 1;
    });

    // Sort by date (get last 6 months if available)
    const sortedEntries = Object.entries(ordersByMonth)
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6); // Get last 6 months

    const labels = sortedEntries.map(([month]) => month);
    const totals = sortedEntries.map(([_, data]) => data.total);
    const counts = sortedEntries.map(([_, data]) => data.count);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Order Amount ($)',
          data: totals,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgba(53, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Order Count',
          data: counts,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    });
  }, [orders]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Order History',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No order data available</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <Bar options={options} data={chartData} />
    </div>
  );
}
