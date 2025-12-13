import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

export default function BarChartCard({ title, data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Capacity",
        data: data.capacity,
        backgroundColor: "#93C5FD",
      },
      {
        label: "Participants",
        data: data.participants,
        backgroundColor: "#3B82F6",
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow border mb-10">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <Bar data={chartData} />
    </div>
  );
}
