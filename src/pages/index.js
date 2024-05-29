import { Game } from "@/components/game/Game"
import Head from "next/head"

export default () => {

  return (
    <>
      <Head>
        <title>Artifact Guesser</title>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1, width=device-width" />
        <meta key="name" name="name" content='Artifact Guesser' />
        <meta key="description" name="description" content='Guess the date and location of artifacts.' />
        <meta key="ogTitle" property="og:title" content='Artifact Guesser' />
        <meta key="ogDesription" property="og:description" content='Guess the date and location of artifacts.' />
        <meta key="ogUrl" property="og:url" content='https://artifactguesser.com' />
        <link rel="icon" href='/icon-sm.png' />
      </Head>
      <Game />
    </>
  )
}