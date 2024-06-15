import { Statistics } from "@/components/dashbaord/Statistics"
import { Layout } from "@/components/layout/Layout"
import { MdDashboard } from "react-icons/md"

export const dashbaordTheme = {
  backgroundColor: '#78c9ab',
  primaryColor: '#96a1f7',
  textColor: '#000000',
}

export default () => {

  return (
    <Layout title='Dashboard' theme={dashbaordTheme} contentCSS={{ fontFamily: 'monospace' }}>
      <div className='mb-3 mt-[3px] flex items-center' css={{
         '@media (max-width: 600px)': { marginLeft: 32 },
      }}>
        <MdDashboard className='mr-2'/>
        Dashbaord
      </div>
      <Statistics />
    </Layout>
  )
}