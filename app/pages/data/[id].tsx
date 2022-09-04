import * as React from 'react';
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {
  DataGrid,
  GridColDef,
  GridCellParams,
  GridToolbarContainer,
  GridCsvExportMenuItem,
  GridCsvExportOptions,
  jaJP,
} from '@mui/x-data-grid';
import LayoutComponent from '../../components/layout';
import Histories from '../../components/History';
import Title from '../../components/Title';

function CustomToolbar() {
  const csvOptions: GridCsvExportOptions = {
    fileName: 'data.csv',
    utf8WithBom: true,
  };
  return (
    <GridToolbarContainer>
        <GridCsvExportMenuItem options={csvOptions} />
    </GridToolbarContainer>
  );
}

const columns: GridColDef[] = [
  {
    field: 'date',
    headerName: '日付',
    width: 150,
    editable: true,
  },
  {
    field: 'changeNum',
    headerName: '変更値',
    type: 'number',
    width: 150,
    cellClassName: (params: GridCellParams<number>) => {
      if (!params.value) return '';
      if (params.value < 0) return 'negative';
      return '';
    },
    editable: true,
  },
  {
    field: 'changeReason',
    headerName: '変更理由',
    sortable: false,
    width: 300,
    editable: true,
  },
  {
    field: 'comment',
    headerName: 'コメント',
    sortable: false,
    width: 450,
    editable: true,
  },
];

function createData(
  id: number,
  date: string,
  changeNum: number,
  changeReason: string,
  comment: string,
) {
  return { id, date, changeNum, changeReason, comment };
}

const rows = [
  createData(
    0,
    '2022-09-01',
    500,
    'テスト',
    'テストコメント',
  ),
  createData(
    1,
    '2022-09-01',
    -500,
    'テスト',
    'テストコメント',
  ),
  createData(
    2,
    '2022-09-01',
    500,
    'テスト',
    'テストコメント',
  ),
  createData(
    3,
    '2022-09-01',
    5000000,
    'テスト',
    'テストコメント',
  ),
  createData(
    4,
    '2022-09-01',
    500,
    'テスト',
    'テストコメント',
  ),
  createData(
    5,
    '2022-09-01',
    800,
    'テスト',
    'テストコメント',
  ),
  createData(
    6,
    '2022-09-01',
    900,
    'テスト',
    'テストコメント',
  ),
  createData(
    7,
    '2022-08-01',
    100,
    'テスト',
    'テストコメント',
  ),
];

const Data: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [pageSize, setPageSize] = React.useState<number>(5);

  const changeCell = (v: any) => {
    console.log(v);
  }

  const updateHistory = () => {
    
  }

  const deleteHistory = () => {
    
  }

  return (
    <LayoutComponent>
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 150,
          }}
        >
          <Title>
            テスト口座1
          </Title>
          <Typography component="p" variant="h4">
            3,024
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Histories>
            <Box component='div' sx={{ p: 2, textAlign: 'right' }}>
              <Button variant="contained" color='primary' onClick={updateHistory}>編集</Button>
              <Button variant="contained" color='warning' onClick={deleteHistory} sx={{ml: 1}}>削除</Button>
            </Box>
            <div style={{ height: 411, width: '100%' }}>
              <DataGrid
                sx={{
                  '.negative': { color: 'red' }
                }}
                localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                rows={rows}
                columns={columns}
                pageSize={pageSize}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                rowsPerPageOptions={[5, 10, 25]}
                onCellEditCommit={changeCell}
                checkboxSelection
                disableSelectionOnClick
                components={{
                  Toolbar: CustomToolbar,
                }}
              />
            </div>
          </Histories>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Box
          component="form"
          autoComplete="off"
          sx={{
            '& .MuiTextField-root': {
              mr: 1,
              mb: 1,
              width: {
                xs: '40ch',
                md: '40ch',
                lg: '25ch'
              }},
            '& .MuiTextField-root.comment': {
              width: {
                xs: '40ch',
                md: '40ch',
                lg: '45ch'
              } },
            }}
        >
          <Title>追加</Title>
          <TextField required id="type" size="small" type="date" />
          <TextField required id="type" label="変更値" size="small" type="number" />
          <TextField required id="type" label="変更理由" size="small" />
          <TextField id="type" label="コメント" size="small" className='comment' />
          <Button variant="contained">
            追加
          </Button>
        </Box>
      </Grid>
    </LayoutComponent>
    )
};

export default Data
