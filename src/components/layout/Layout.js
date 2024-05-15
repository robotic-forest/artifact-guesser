import Head from "next/head"
import { D } from "../html/D"

export const Layout = ({ title, children, s, c, bg, txt }) => {
  return (
    <>
      <Head>
        <title>{title || 'ad5k'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <D c={`w-full min-h-screen flex justify-center bg-${bg || 'black'} text-${txt || 'white'}`} s={s}>
       <D c={`w-full max-w-screen-lg mx-auto relative ${c}`}>
          {children}
       </D>
      </D>
    </>
  )
}