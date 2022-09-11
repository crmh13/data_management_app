import type { NextPage } from 'next'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import { gql, useQuery, useMutation } from '@apollo/client'
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress'
import LayoutComponent from '../components/layout';
import Types from '../components/Types';
import Title from '../components/Title';

const GET_TYPES = gql `
  query GetTypes {
    types {
      id
      type_name
      management {
        data_name
        current_num
      }
    }
  }
`;

const CREATE_TYPE = gql `
  mutation($typeName: String!) {
    createType(type_name: $typeName) {
      type_name
    }
  }
`;

type InputTypeName = {
  typeName: string
}

const Home: NextPage = () => {
  const { data, loading, error } = useQuery(GET_TYPES);
  const [createType] = useMutation(CREATE_TYPE, {
    refetchQueries: ['GetTypes'],
  });
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<InputTypeName>({
    defaultValues: { typeName: '' }
  })

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
  const { types } = data;

  const validationRules = {
    addType: {
      required: '区分名を入力してください。',
    }
  }

  const onSubmit: SubmitHandler<InputTypeName> = (data: InputTypeName) => {
    createType({
      variables: {
        typeName: data.typeName,
      }
    })
  }
  
  const totalNum = (management: any): number => {
    let num = 0;
    if (management) {
      management.forEach((data: any) => {
        num += data.current_num;
      })
      return num;
    }
    return num;
  }

  return (
    <LayoutComponent>
      {types.map((type: any) => 
        <Grid item xs={12} md={4} lg={3}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 150,
          }}
        >
          <Types title={type.type_name} url={`/type/${type.id}`} num={totalNum(type.management)} />
        </Paper>
      </Grid>
      )}
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
              name="typeName"
              control={control}
              rules={validationRules.addType}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="text"
                  label="区分"
                  error={errors.typeName !== undefined}
                  helperText={errors.typeName?.message}
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

export default Home
