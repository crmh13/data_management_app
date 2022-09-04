import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { PieChart, ResponsiveContainer, Pie } from 'recharts';
import Typography from '@mui/material/Typography';
import Title from './Title';

const data = [
  {
    index: 0,
    name: 'テスト口座1',
    value: 1000,
  },
  {
    index: 2,
    name: 'テスト口座2',
    value: 2000,
  }
];

export default function PieRechart() {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Title>合計</Title>
      <Typography component="p" variant="h4">
        3,000
      </Typography>
      <ResponsiveContainer>
        <PieChart
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 24,
          }}
        >
          <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={100} fill={theme.palette.primary.main} label/>
        </PieChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
}
