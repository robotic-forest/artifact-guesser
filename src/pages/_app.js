import '@/globals.css'
import axios from 'axios'
import { Toaster } from 'react-hot-toast';
import { SWRConfig } from 'swr'
import GlobalStyles from "@/components/GlobalStyles"

const fetcher = url => axios.get(url).then(res => res.data)

let CyberInvocation; export default CyberInvocation = ({ Component, pageProps }) => {
  const theme =  {
    backgroundColor: '#000000',
    primaryColor: '#4F4F4F',
    textColor: '#ffffff',
    borderRadius: 3,
    borderRadiusRound: 6,
    fontSize: 14
  }
  
  return (
    <SWRConfig value={{ fetcher, onError: err => console.error(err) }}>
      <GlobalStyles theme={theme} />
      <Component {...pageProps} />
      <Toaster position='bottom-center' />
    </SWRConfig>
  ) // -- mamud | dream -- // http://psd.museum.upenn.edu/nepsd-frame.html

}