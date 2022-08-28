import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { gql, useQuery } from '@apollo/client'

const GET_TYPES = gql `
  query GetTypes {
    types {
      id
      type_name
    }
  }
`;

const Home: NextPage = () => {
  const { data, loading, error } = useQuery(GET_TYPES);
  if (loading) return <p>ローディング中です</p>;
  if (error) return <p>エラーが発生しています</p>;

  const { types } = data;
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {types.map((type: {id: number; type_name: string;}) => (
          <div key={type.id}>Name: {type.type_name}</div>
        ))}
      </main>
    </div>
  );
};

export default Home
