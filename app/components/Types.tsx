import * as React from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from './Title';

interface TypesProps {
  url?: string;
  title?: string;
  num?: number;
  children?: React.ReactNode;
}

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

export default function Types(props: TypesProps) {
  return (
    <React.Fragment>
      <Title>
        <Link color="primary" href={props.url}>{props.title}</Link>
      </Title>
      <Typography component="p" variant="h4">
        {props.num?.toLocaleString()}
      </Typography>
      <Typography component="div" align="right">
        <Link color="primary" href="#" onClick={preventDefault}>
          編集
        </Link>
        &nbsp;
        <Link color="primary" href="#" onClick={preventDefault}>
          削除
        </Link>
      </Typography>
    </React.Fragment>
  );
}
