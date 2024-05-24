import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script data-goatcounter="https://artifactguesser.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
        <meta key="name" name="name" content='Artifact Guesser' />
        <link rel="icon" href="/icon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
