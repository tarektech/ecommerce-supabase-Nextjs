'use client';
import { OrderType } from '@/types';
import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PaymentDistributionChartProps {
  orders: OrderType[];
}

export function PaymentDistributionChart({
  orders,
}: PaymentDistributionChartProps) {
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

    // Group orders by payment method
    const paymentMethods: Record<string, number> = {};

    orders.forEach((order) => {
      const paymentMethod = order.payment_method || 'Other';

      if (!paymentMethods[paymentMethod]) {
        paymentMethods[paymentMethod] = 0;
      }

      paymentMethods[paymentMethod] += order.total;
    });

    const labels = Object.keys(paymentMethods);
    const data = Object.values(paymentMethods);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Payment Amount ($)',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
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
        text: 'Payment Distribution',
        font: {
          size: 16,
        },
      },
    },
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No payment data available</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <Pie options={options} data={chartData} />
    </div>
  );
}
