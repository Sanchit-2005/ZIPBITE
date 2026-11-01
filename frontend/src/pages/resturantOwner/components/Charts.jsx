import React from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
export default function Charts({data}) {
  return (
    <div>
      <ResponsiveContainer width="100%" height="100%" aspect={500 / 300}>
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#d884c6" />
            

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
