import '@/globals.css'
import axios from 'axios'
import { Toaster } from 'react-hot-toast';
import { SWRConfig } from 'swr'

const fetcher = url => axios.get(url).then(res => res.data)

let CyberInvocation; export default CyberInvocation = ({ Component, pageProps }) => (
  <SWRConfig value={{ fetcher, onError: err => console.error(err) }}>
    <Component {...pageProps} />
    <Toaster position='bottom-center' />
  </SWRConfig>
) // -- mamud | dream -- // http://psd.museum.upenn.edu/nepsd-frame.html