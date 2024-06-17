import { Layout } from "@/components/layout/Layout"

const molochTheme = {
  primaryColor: '#71b8cf',
  backgroundColor: '#cf7171',
  textColor: '#000000'
}

export default () => {

  return (
    <Layout title='Moloch' theme={molochTheme} contentCSS={{ fontFamily: 'monospace' }}>
      <div className='mb-3 flex items-center' css={{
         '@media (max-width: 600px)': { marginLeft: 32 },
      }}>
        Moloch
      </div>
      init
    </Layout>
  )
}