'use client';
import { OrderType } from '@/types';
import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OrderStatusChartProps {
  orders: OrderType[];
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth: number;
}

export function OrderStatusChart({ orders }: OrderStatusChartProps) {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: ChartDataset[];
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

    // Group orders by status
    const orderStatuses: Record<string, number> = {};

    orders.forEach((order) => {
      const status =
        order.status.charAt(0).toUpperCase() + order.status.slice(1);

      if (!orderStatuses[status]) {
        orderStatuses[status] = 0;
      }

      orderStatuses[status] += 1;
    });

    const labels = Object.keys(orderStatuses);
    const data = Object.values(orderStatuses);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Orders',
          data,
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)', // Delivered
            'rgba(54, 162, 235, 0.5)', // Shipped
            'rgba(255, 206, 86, 0.5)', // Processing
            'rgba(255, 99, 132, 0.5)', // Cancelled
            'rgba(153, 102, 255, 0.5)', // Pending
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(153, 102, 255, 1)',
          ],
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
        text: 'Order Status Distribution',
        font: {
          size: 16,
        },
      },
    },
    cutout: '50%',
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No order status data available</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <Doughnut options={options} data={chartData} />
    </div>
  );
}
