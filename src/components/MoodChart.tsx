import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface MoodEntry {
  id: string;
  mood: string;
  note: string;
  created_at: string;
}

interface MoodChartProps {
  entries: MoodEntry[];
}

const COLORS = {
  happy: "#6EE7B7",
  calm: "#93C5FD",
  sad: "#A5B4FC",
  angry: "#F87171",
  tired: "#FCD34D",
  anxious: "#FCA5A5",
  excited: "#F472B6",
  neutral: "#9BA3AF",
};

const MoodChart = ({ entries }: MoodChartProps) => {
  if (entries.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground">
          Add mood entries to see your analytics
        </p>
      </div>
    );
  }

  // Count mood occurrences
  const moodCounts = entries.reduce((acc: Record<string, number>, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});

  // Convert to chart data
  const chartData = Object.entries(moodCounts).map(([mood, count]) => ({
    name: mood.charAt(0).toUpperCase() + mood.slice(1),
    value: count,
    color: COLORS[mood as keyof typeof COLORS] || COLORS.neutral,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
        />
        <Legend
          wrapperStyle={{
            color: "hsl(var(--foreground))",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MoodChart;
