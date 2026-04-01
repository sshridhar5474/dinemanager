import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function UsageChart({ data }) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <BarChart width={400} height={250} data={chartData}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" />
    </BarChart>
  );
}