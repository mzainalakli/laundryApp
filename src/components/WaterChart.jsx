import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getDatabase, ref, onValue } from "firebase/database";

const WaterChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const flowRef = ref(db, 'flow_log');

    onValue(flowRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const formatted = Object.entries(val).map(([time, value]) => ({
          time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          total_air: value
        }));
        setData(formatted);
      }
    });
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-md mt-4 text-white">
      <h2 className="text-lg font-bold mb-2">Grafik Konsumsi Air</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="time" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Line type="monotone" dataKey="total_air" stroke="#00f2ff" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WaterChart;