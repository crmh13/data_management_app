import * as React from 'react';
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
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
import Types from '../../components/Types';
import Histories from '../../components/History';
import PieRechart from '../../components/PieRechart';
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
  { field: 'date', headerName: '日付', width: 150 },
  { field: 'dataName', headerName: '管理データ名', width: 150 },
  {
    field: 'changeNum',
    headerName: '変更値',
    type: 'number',
    width: 150,
    cellClassName: (params: GridCellParams<number>) => {
      if (!params.value) return '';
      if (params.value < 0) return 'negative';
      return '';
    }
  },
  {
    field: 'changeReason',
    headerName: '変更理由',
    sortable: false,
    width: 300,
  },
  {
    field: 'comment',
    headerName: 'コメント',
    sortable: false,
    width: 350,
  },
];

// Generate Order Data
function createData(
  id: number,
  date: string,
  dataName: string,
  changeNum: number,
  changeReason: string,
  comment: string,
) {
  return { id, date, dataName, changeNum, changeReason, comment };
}

const rows = [
  createData(
    0,
    '2022-09-01',
    'テスト口座1',
    -500,
    'テスト',
    'テストコメント',
  ),
  createData(
    1,
    '2022-09-01',
    'テスト口座1',
    500,
    'テスト',
    'テストコメント',
  ),
  createData(
    2,
    '2022-09-01',
    'テスト口座1',
    500,
    'テスト',
    'テストコメント',
  ),
  createData(
    3,
    '2022-09-01',
    'テスト口座1',
    5000000,
    'テスト',
    'テストコメント',
  ),
  createData(
    4,
    '2022-09-01',
    'テスト口座2',
    500,
    'テスト',
    'テストコメント',
  ),
  createData(
    5,
    '2022-09-01',
    'テスト口座2',
    800,
    'テスト',
    'テストコメント',
  ),
  createData(
    6,
    '2022-09-01',
    'テスト口座2',
    900,
    'テスト',
    'テストコメント',
  ),
  createData(
    7,
    '2022-08-01',
    'テスト口座2',
    100,
    'テスト',
    'テストコメント',
  ),
];

const Type: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [pageSize, setPageSize] = React.useState<number>(5);

  return (
    <LayoutComponent>
      <Grid item xs={12} md={4} lg={3}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 150,
          }}
        >
          <Types title='テスト口座1' url='/data/1' />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} lg={3}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 150,
          }}
        >
          <Types title='テスト口座2' url='/data/2' />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 350,
          }}
        >
          <PieRechart />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Histories>
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
                xs: '30ch',
                md: '50ch',
                lg: '100ch'
              }},
            }}
        >
          <Title>追加</Title>
          <TextField required id="type" size="small" />
          <Button variant="contained">
            追加
          </Button>
        </Box>
      </Grid>
    </LayoutComponent>
    )
};

export default Type
