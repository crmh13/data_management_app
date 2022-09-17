import * as React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { gql, useQuery, useMutation } from '@apollo/client';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import LayoutComponent from '../../components/layout';
import Histories from '../../components/History';
import Title from '../../components/Title';

// データテーブル設定
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

type historyType = {
  id: number;
  date: string;
  changeNum: number;
  changeReason: string;
  comment: string;
  beforeChangeNum?: number;
}

const GET_MANAGEMENT_DATA_AT_ID = gql `
  query GetManagementDataAtId($dataId: Int!) {
    managementDataAtId(data_id: $dataId) {
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

const ADD_HISTORY = gql `
  mutation($dataHistory: HistoryInput!) {
    addHistory(data_history: $dataHistory) {
      id
      management_id
      change_num
      change_reason
      comment
      change_date
    }
  }
`;

const CHANGE_HISTORY = gql `
  mutation($dataHistory: HistoryInput!) {
    changeHistory(data_history: $dataHistory) {
      id
      management_id
      change_num
      change_reason
      comment
      change_date
    }
  }
`;

const CHANGE_CURRENT_NUM = gql `
  mutation($managementData: CurrentNumInput!) {
    changeCurrentNum(management_data: $managementData) {
      id
      data_name
      current_num
    }
  }
`;

const DELETE_HISTORY = gql `
  mutation($id: Int!) {
    deleteHistory(id: $id) {
      id
      management_id
      change_num
      change_reason
      comment
      change_date
    }
  }
`;

type HistoryInput = {
  managementId: number,
  changeDate: string,
  changeNum: number,
  changeReason: string,
  comment?: string,
  currentNum: number,
}

enum DialogType {
  edit = 1,
  delete = 2,
}

const Data: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data, loading, error } = useQuery(GET_MANAGEMENT_DATA_AT_ID, {
    variables: { dataId: Number(id) }
  });

  const [addHistory] = useMutation(ADD_HISTORY, {
    refetchQueries: [{
      query: GET_MANAGEMENT_DATA_AT_ID,
      variables: { dataId: Number(id) }
    }],
  });

  const [changeHistory] = useMutation(CHANGE_HISTORY);
  const [deleteHistory] = useMutation(DELETE_HISTORY);
  const [changeCurrentNum] = useMutation(CHANGE_CURRENT_NUM, {
    refetchQueries: [{
      query: GET_MANAGEMENT_DATA_AT_ID,
      variables: { dataId: Number(id) }
    }],
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<HistoryInput>({
    defaultValues: {
      changeDate: '',
      changeNum: 0,
      changeReason: '',
      comment: '',
    }
  })

  const [pageSize, setPageSize] = React.useState<number>(5);
  const [changeHistories, setChangeHistories] = React.useState([] as historyType[]);
  const [open, setOpen] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState('');
  const [dialogContent, setDialogContent] = React.useState('');
  const [dialogType, setDialogType] = React.useState(0);
  const rows: historyType[] = [];
  const selRows = React.useRef([]);

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

  const { managementDataAtId } = data;
  managementDataAtId.data_history.forEach((history: any) => {
    rows.push({
      id: history.id,
      date: new Date(history.change_date).toLocaleDateString(),
      changeNum: history.change_num,
      changeReason: history.change_reason,
      comment: history.comment
    });
  });

  // CSV出力用のツールバー
  const CustomToolbar = ()  => {
    const year = new Date().getFullYear().toString();
    const month = new Date().getMonth() + 1;
    const monthStr = month.toString().padStart(2, '0');
    const date = new Date().getDate().toString().padStart(2, '0');

    const csvOptions: GridCsvExportOptions = {
      fileName: `${year}${monthStr}${date}_${managementDataAtId.data_name}`,
      utf8WithBom: true,
    };
    return (
      <GridToolbarContainer>
          <GridCsvExportMenuItem options={csvOptions} />
      </GridToolbarContainer>
    );
  }

  const validationRules = {
    addDate: {
      required: '日付を入力してください。',
    },
    addChangeNum: {
      required: '変更値を入力してください。',
    },
    addChangeReason: {
      required: '変更理由を入力してください。',
    },
  }

  const onSubmit: SubmitHandler<HistoryInput> = (data: HistoryInput) => {
    addHistory({
      variables: {
        dataHistory: {
          management_id: Number(id),
          change_date: data.changeDate,
          change_num: Number(data.changeNum),
          change_reason: data.changeReason,
          comment: data.comment,
          current_num: managementDataAtId.current_num + Number(data.changeNum)
        }
      }
    })
    reset();
  }

  // データ行編集
  const changeCell = (v: any) => {
    const rowsIdx = rows.findIndex(d => d.id === v.id);
    const row = rows[rowsIdx];
    const changeColumn: keyof historyType = v.field;
    const changeValue: string | number  = v.value as never;
    // 行を編集しなかった場合は何もしない
    if (row[changeColumn] === changeValue) {
      return;
    }
    row.beforeChangeNum = row.changeNum;
    row[changeColumn] = changeValue;
    const idx = changeHistories.findIndex(d => d.id === v.id);
    if (idx >= 0) {
      changeHistories[idx][changeColumn] = changeValue;
    } else {
      changeHistories.push(row);
    }
    setChangeHistories(changeHistories);
  }

  // 編集ボタン
  const updateHistoryBtn = () => {
    if (changeHistories.length === 0) {
      return;
    }
    setDialogTitle('履歴の編集');
    setDialogContent('履歴を編集します。よろしいですか？');
    setDialogType(DialogType.edit);
    setOpen(true);
  }

  // 削除ボタン
  const deleteHistoryBtn = () => {
    if (selRows.current.length === 0) return;
    setDialogTitle('履歴の削除');
    setDialogContent('履歴を削除します。よろしいですか？');
    setDialogType(DialogType.delete);
    setOpen(true);
  }

  // ダイアログを閉じる
  const dialogClose = () => {
    setOpen(false);
    setChangeHistories([]);
  }

  // ダイアログOK
  const dialogOk = () => {
    let currentNum = managementDataAtId.current_num;
    if (dialogType === DialogType.edit) {
      let changeNum = 0;
      for (const row of changeHistories) {
        if (row.beforeChangeNum) {
          changeNum += row.changeNum - row.beforeChangeNum;
        }
        changeHistory({
          variables: {
            dataHistory: {
              id: row.id,
              management_id: Number(id),
              change_date: row.date.replaceAll('/', '-'),
              change_num: row.changeNum,
              change_reason: row.changeReason,
              comment: row.comment,
            },
          },
        });
      };
      changeCurrentNum({
        variables: {
          managementData: {
            id: Number(id),
            current_num: currentNum + changeNum
          },
        },
      });
    } else {
      for (const row of selRows.current) {
        const history: historyType | undefined = rows.find((v) => v.id === row);
        if (history) {
          currentNum -= history.changeNum;
        }
        deleteHistory({
          variables: { id: row }
        });
      }
      changeCurrentNum({
        variables: {
          managementData: {
            id: Number(id),
            current_num: currentNum,
          },
        },
      });
    }
    dialogClose();
  }

  return (
    <LayoutComponent>
      <Dialog
        open={open}
        onClose={dialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {dialogTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={dialogOk}>はい</Button>
          <Button onClick={dialogClose}>
            いいえ
          </Button>
        </DialogActions>
      </Dialog>
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
            {managementDataAtId.data_name}
          </Title>
          <Typography component="p" variant="h4">
            {managementDataAtId.current_num.toLocaleString()}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Histories>
            <Box component='div' sx={{ p: 2, textAlign: 'right' }}>
              <Button variant="contained" color='primary' onClick={updateHistoryBtn}>編集</Button>
              <Button variant="contained" color='warning' onClick={deleteHistoryBtn} sx={{ml: 1}}>削除</Button>
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
                onSelectionModelChange={(v) => selRows.current = v as never} 
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
                xs: '40ch',
                md: '40ch',
                lg: '25ch'
              }},
            '& .MuiTextField-root.comment': {
              width: {
                xs: '40ch',
                md: '40ch',
                lg: '45ch'
              }},
            }}>
          <Controller
            name="changeDate"
            control={control}
            rules={validationRules.addDate}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                error={errors.changeDate !== undefined}
                helperText={errors.changeDate?.message}
                size="small" />
            )}
          />
          <Controller
            name="changeNum"
            control={control}
            rules={validationRules.addChangeNum}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                error={errors.changeNum !== undefined}
                helperText={errors.changeNum?.message}
                size="small" />
            )}
          />
          <Controller
            name="changeReason"
            control={control}
            rules={validationRules.addChangeReason}
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                error={errors.changeReason !== undefined}
                helperText={errors.changeReason?.message}
                size="small" />
            )}
          />
          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                size="small"
                className='comment' />
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

export default Data
