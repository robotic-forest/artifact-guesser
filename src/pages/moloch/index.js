import { Layout } from "@/components/layout/Layout"
import { Moloch } from "@/components/moloch/Moloch"

export const molochTheme = {
  primaryColor: '#71b8cf',
  backgroundColor: '#cf7171',
  textColor: '#000000'
}

export default () => {

  return (
    <Layout title='Moloch' theme={molochTheme} contentCSS={{
      fontFamily: 'monospace',
      padding: 0
    }}>
      <Moloch />
    </Layout>
  )
}