import useSwr from "swr";
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/styles/Home.module.css'
import fetcher from "../utils/fetcher";
import { GetServerSideProps, NextPage } from "next";
import getGoogleOAuthURL from "../utils/getGoogleUrl";
import Link from "next/link";

const inter = Inter({ subsets: ['latin'] })

interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _v: number;
  session: string;
  iat: number;
  exp: number;
}

export default function Home({ fallbackData }: { fallbackData: User } ) {
  const { data, error } = useSwr<User | null>(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/me`, fetcher, { fallbackData });

  if(data) {
    return <div className={styles.text}>Welcome! {data.name}</div>
  }

  console.log(data);

  return (
    <>
      <Head>
        <title>Landing Page</title>
        <meta name="description" content="tomdoestech landing page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.center}>
          <a href={getGoogleOAuthURL()} className={styles.text}>Login with Google</a>
          <div className={styles.text}>Please Login.</div>
        </div>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await fetcher(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/me`, context.req.headers);

  return { props: { fallbackData: data } };
}
