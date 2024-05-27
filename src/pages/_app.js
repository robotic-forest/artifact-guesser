import '@/globals.css'
import axios from 'axios'
import { Toaster } from 'react-hot-toast';
import { SWRConfig } from 'swr'
import { GlobalStyles } from "@/components/GlobalStyles"
import { PromiseDialog } from '@/components/dialogs/Dialog';

const fetcher = url => axios.get(url).then(res => res.data)

export const theme =  {
  backgroundColor: '#000000',
  primaryColor: '#ac9a8c',
  textColor: '#ffffff',
  borderRadius: 3,
  borderRadiusRound: 6,
  fontSize: 14
}

let CyberInvocation; export default CyberInvocation = ({ Component, pageProps }) => {
  
  return (
    <SWRConfig value={{ fetcher, onError: err => console.error(err) }}>
      <GlobalStyles theme={theme} />
      <PromiseDialog>
        <Component {...pageProps} />
      </PromiseDialog>
      <Toaster position='bottom-center' />
    </SWRConfig>
  ) // -- mamud | dream -- // http://psd.museum.upenn.edu/nepsd-frame.html
}