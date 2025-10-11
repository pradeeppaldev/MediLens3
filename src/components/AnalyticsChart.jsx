import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsChart = () => {
  const data = [
    { name: 'Jan', scans: 400, analyses: 240 },
    { name: 'Feb', scans: 300, analyses: 139 },
    { name: 'Mar', scans: 200, analyses: 980 },
    { name: 'Apr', scans: 278, analyses: 390 },
    { name: 'May', scans: 189, analyses: 480 },
    { name: 'Jun', scans: 239, analyses: 380 },
  ];

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Analytics</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="scans" fill="#6366f1" name="Image Scans" />
            <Bar dataKey="analyses" fill="#0d9488" name="AI Analyses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;