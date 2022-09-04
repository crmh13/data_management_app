import * as React from 'react';
import Title from './Title';

interface HistoryDataProps {
  children?: React.ReactNode;
}

export default function Histories(props: HistoryDataProps) {

  return (
    <React.Fragment>
      <Title>履歴</Title>
      {props.children}
    </React.Fragment>
  );
}
