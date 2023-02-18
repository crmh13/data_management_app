import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import Title from './Title';

function createData(month: string, num?: number) {
  return { month, num };
}

type monthlyAggregation = {
  month: string;
  num: number;
}

export default function LineRechart(props: any) {
  const data: monthlyAggregation[] = props.data.map((data: any) => {
    return createData(format(new Date(data.aggregate_date), 'MM月'), data.aggregate_num);
  })
  data.reverse();
  const theme = useTheme();

  return (
    <React.Fragment>
      <Title>月次集計</Title>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 24,
          }}
        >
          <XAxis
            dataKey="month"
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          >
          </YAxis>
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="num"
            stroke={theme.palette.primary.main}
          />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
}