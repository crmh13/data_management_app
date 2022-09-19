import * as React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { gql, useQuery, useMutation } from '@apollo/client';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import {
  DataGrid,
  GridColDef,
  GridCellParams,
  GridToolbarContainer,
  GridCsvExportMenuItem,
  GridCsvExportOptions,
  jaJP,
} from '@mui/x-data-grid';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress'
import { format } from 'date-fns';
import LayoutComponent from '../../components/layout';
import Types from '../../components/Types';
import Histories from '../../components/History';
import PieRechart from '../../components/PieRechart';
import Title from '../../components/Title';
import { DataType } from '../../types/type';

// データテーブル設定
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

type historyType = {
  id: number;
  date: string;
  dataName: string;
  changeNum: number;
  changeReason: string;
  comment: string;
}

const GET_MANAGEMENT_DATA = gql `
  query GetManagementData($typeId: Int!) {
    managementData(type_id: $typeId) {
      id
      data_name
      current_num
      data_history {
        id
        management_id
        change_num
        change_reason
        comment
        change_date
      }
    }
  }
`;

const CREATE_MANAGEMENT_DATA = gql `
  mutation($managementData: DataInput!) {
    createData(management_data: $managementData) {
      id
      type_id
      data_name
      current_num
    }
  }
`;

type DataInput = {
  typeId: number,
  dataName: string,
}


const Type: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data, loading, error } = useQuery(GET_MANAGEMENT_DATA, {
    variables: { typeId: Number(id) }
  });

  const [createData] = useMutation(CREATE_MANAGEMENT_DATA, {
    update (cache, { data: { createData } }) {
      const cacheId = cache.identify(createData);
      if (!cacheId) return;
      cache.modify({
        fields: {
          managementData(dataRefs, { toReference }) {
            return [toReference(cacheId), dataRefs];
          }
        }
      })
    }
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DataInput>({
    defaultValues: { dataName: '' }
  })
  const [pageSize, setPageSize] = React.useState<number>(5);

  if (loading) {
    return (<Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={true}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
    )
  }
  if (error) return <p>エラーが発生しています</p>;

  const { managementData } = data;
  const rows: historyType[] = [];
  managementData.forEach((data: any) => {
    data.data_history.map((history: any) => {
      rows.push({
        id: history.id,
        date: format(new Date(history.change_date), 'yyyy-MM-dd'),
        dataName: data.data_name,
        changeNum: history.change_num,
        changeReason: history.change_reason,
        comment: history.comment
      });
    })
  })

  if (rows) {
    rows.sort((a, b): number => {
      return a.date < b.date ? 1 : -1; 
    })
  }

  const validationRules = {
    addData: {
      required: 'データ名を入力してください。',
    }
  }

  // CSV出力用のツールバー
  const CustomToolbar = ()  => {
    const today = format(new Date(), 'yyyyMMdd');
    const csvOptions: GridCsvExportOptions = {
      fileName: `${today}_${id}.csv`,
      utf8WithBom: true,
    };
    return (
      <GridToolbarContainer>
          <GridCsvExportMenuItem options={csvOptions} />
      </GridToolbarContainer>
    );
  }

  const onSubmit: SubmitHandler<DataInput> = (data: DataInput) => {
    createData({
      variables: {
        managementData: {
          type_id: Number(id),
          data_name: data.dataName,  
        }
      }
    })
    reset();
  }

  return (
    <LayoutComponent>
      {managementData.map((data: any) => 
        <Grid item xs={12} md={4} lg={3} key={data.id}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 150,
            }}
          >
            <Types
              title={data.data_name}
              url={`/data/${data.id}`}
              num={data.current_num}
              id={data.id}
              dataType={DataType.Data}
            />
          </Paper>
        </Grid>
      )}
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 370,
          }}
        >
          <PieRechart data={managementData} />
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
          <Title>追加</Title>
          <Stack component="form" noValidate  onSubmit={handleSubmit(onSubmit)}
            sx={{
              display: 'inline-block',
              '& .MuiTextField-root': {
                mr: 1,
                mb: 1,
                width: {
                  xs: '30ch',
                  md: '50ch',
                  lg: '100ch'
                }},
              }}>
            <Controller
              name="dataName"
              control={control}
              rules={validationRules.addData}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="text"
                  error={errors.dataName !== undefined}
                  helperText={errors.dataName?.message}
                  size="small" />
              )}
            />
            <Button variant="contained" type="submit">
              追加
            </Button>
          </Stack>
      </Grid>
    </LayoutComponent>
    )
};

export default Type
