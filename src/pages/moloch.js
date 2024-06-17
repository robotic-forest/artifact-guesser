import { Layout } from "@/components/layout/Layout"
import { Moloch } from "@/components/moloch/Moloch"
import useUser from "@/hooks/useUser"

const molochTheme = {
  primaryColor: '#71b8cf',
  backgroundColor: '#cf7171',
  textColor: '#000000'
}

export default () => {
  const { user } = useUser()

  return (
    <Layout title='Moloch' theme={molochTheme} contentCSS={{ fontFamily: 'monospace' }}>
      <div className='mb-3 flex items-center' css={{
         '@media (max-width: 600px)': { marginLeft: 32 },
         marginLeft: !user?.isLoggedIn ? 32 : 0
      }}>
        Moloch
      </div>
      
      <Moloch />
    </Layout>
  )
}