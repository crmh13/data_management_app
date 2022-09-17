import * as React from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { gql, useMutation } from '@apollo/client';
import Title from './Title';
import { DataType } from '../types/type';

interface TypesProps {
  url?: string;
  title?: string;
  num?: number;
  id?: number;
  dataType?: number;
  children?: React.ReactNode;
}

const CHANGE_TYPE = gql `
  mutation($type: TypeInput!) {
    changeType(type: $type) {
      id
      type_name
    }
  }
`;

const DELETE_TYPE = gql `
  mutation($id: Int!) {
    deleteType(id: $id) {
      id
    }
  }
`;

const DELETE_DATA = gql `
  mutation($id: Int!) {
    deleteData(id: $id) {
      id
    }
  }
`;

const CHANGE_MANAGEMENT_DATA = gql `
  mutation($managementData: DataInput!) {
    changeData(management_data: $managementData) {
      id
      type_id
      data_name
      current_num
    }
  }
`;

type InputName = {
  name: string
}

export default function Types(props: TypesProps) {
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState('');
  const [changeType] = useMutation(CHANGE_TYPE);
  const [changeData] = useMutation(CHANGE_MANAGEMENT_DATA);
  const [deleteType] = useMutation(DELETE_TYPE, {
    refetchQueries: ['GetTypes'],
  });
  const [deleteData] = useMutation(DELETE_DATA, {
    refetchQueries: ['GetManagementData'],
  });

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<InputName>({
    defaultValues: { name: props.title }
  })

  const validationRules = {
    change: {
      required: '入力してください。',
    }
  }

  const updateClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (props.dataType === DataType.Type) {
      setDialogTitle('区分編集');
    }
    if (props.dataType === DataType.Data) {
      setDialogTitle('データ名編集');
    }
    setOpenEdit(true);
  }

  const onSubmit: SubmitHandler<InputName> = (data: InputName) => {
    if (props.dataType === DataType.Type) {
      changeType({
        variables: {
          type: {
            id: props.id,
            type_name: data.name,
          },
        },
      });
    }
    if (props.dataType === DataType.Data) {
      changeData({
        variables: {
          managementData: {
            id: props.id,
            data_name: data.name,
          },
        },
      });
    }
    setOpenEdit(false);
  };

  const deleteClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (props.dataType === DataType.Type) {
      setDialogTitle('区分削除');
    }
    if (props.dataType === DataType.Data) {
      setDialogTitle('データ削除');
    }
    setOpenDelete(true);
  }

  const dataDelete = () => {
    if (props.dataType === DataType.Type) {
      deleteType({
        variables: { id: props.id }
      });
    }
    if (props.dataType === DataType.Data) {
      deleteData({
        variables: { id: props.id }
      });
    }
    setOpenDelete(false);
  }

  const handleClose = () => {
    setOpenEdit(false);
    setOpenDelete(false);
  };

  return (
    <React.Fragment>
      <Dialog open={openEdit} onClose={handleClose}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <Stack component="form" noValidate  onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Controller
                name="name"
                control={control}
                rules={validationRules.change}
                render={({ field }) => (
                  <TextField
                    {...field}
                    autoFocus
                    margin="dense"
                    id="name"
                    type="text"
                    error={errors.name !== undefined}
                    fullWidth
                    variant="standard"
                  />
                )}
              />
          </DialogContent>
          <DialogActions>
            <Button type="submit">編集</Button>
            <Button onClick={handleClose}>キャンセル</Button>
          </DialogActions>
        </Stack>
      </Dialog>
      <Dialog open={openDelete} onClose={handleClose}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            削除します。よろしいですか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={dataDelete}>削除</Button>
          <Button onClick={handleClose}>キャンセル</Button>
        </DialogActions>
      </Dialog>
      <Title>
        <Link color="primary" href={props.url}>{props.title}</Link>
      </Title>
      <Typography component="p" variant="h4">
        {props.num?.toLocaleString()}
      </Typography>
      <Typography component="div" align="right">
        <Link color="primary" href="#" onClick={updateClick}>
          <EditIcon />
        </Link>
        &nbsp;
        <Link color="primary" href="#" onClick={deleteClick}>
          <DeleteIcon />
        </Link>
      </Typography>
    </React.Fragment>
  );
}
