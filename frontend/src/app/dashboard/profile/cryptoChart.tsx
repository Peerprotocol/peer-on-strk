"use client";
import { Line } from 'react-chartjs-2';
import { ChartOptions, ChartData, Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface CryptoChartProps {
  data: ChartData<'line'>;
  options: ChartOptions<'line'>;
}

const CryptoChart: React.FC<CryptoChartProps> = ({ data, options }) => {
  return <Line data={data} options={options} />;
};

export default CryptoChart;
