import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function LineChartCard({ title, data }) {
  const chartData = {
    labels: data.months,
    datasets: [
      {
        label: "events",
        data: data.events,
        borderColor: "#60A5FA",
        tension: 0.4,
      },
      {
        label: "participants",
        data: data.participants,
        borderColor: "#3B82F6",
        tension: 0.4,
      },
      {
        label: "votes",
        data: data.votes,
        borderColor: "#1D4ED8",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow border mb-10">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <Line data={chartData} />
    </div>
  );
}
