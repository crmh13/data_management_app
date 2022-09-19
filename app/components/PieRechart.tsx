import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { PieChart, ResponsiveContainer, Pie } from 'recharts';
import Typography from '@mui/material/Typography';
import Title from './Title';

const createData = (index: number, name: string, value: number) => {
  return { index, name, value };
}

export default function PieRechart(props: any) {
  const data = props.data.map((data: any, index: number) => {
    return createData(index, data.data_name, data.current_num);
  })
  let totalNum = 0;
  for (const d of data) {
    totalNum += d.value;
  }

  const theme = useTheme();

  return (
    <React.Fragment>
      <Title>合計</Title>
      <Typography component="p" variant="h4">
        {totalNum.toLocaleString()}
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
