import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta key="name" name="name" content='Artifact Guesser' />
        <link rel="icon" href="/icon-sm.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
        {/* GoatCounter — kept alongside internal analytics for parallel sanity checking */}
        <script
          data-goatcounter="https://artifactguesser.goatcounter.com/count"
          async
          src="//gc.zgo.at/count.js"
        />
      </body>
    </Html>
  )
}
