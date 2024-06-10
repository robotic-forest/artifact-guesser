import '@/globals.css'
import axios from 'axios'
import { Toaster } from 'react-hot-toast'
import { SWRConfig } from 'swr'
import { GlobalStyles } from "@/components/GlobalStyles"
import { PromiseDialog } from '@/components/dialogs/Dialog'
import { createContext, useContext, useEffect, useState } from 'react'
import { usePreviousRoute } from '@/hooks/usePreviousRoute'

const fetcher = url => axios.get(url).then(res => res.data)

export const theme =  {
  backgroundColor: '#000000',
  primaryColor: '#ac9a8c',
  textColor: '#ffffff',
  borderRadius: 3,
  borderRadiusRound: 6,
  fontSize: 14
}

// create theme context
const ThemeContext = createContext(null)

export const useTheme = (localTheme) => {
  const context = useContext(ThemeContext)
  if (!context) return { theme: null, setTheme: null }

  const stringTheme = JSON.stringify(context.theme)
  const stringLocalTheme = JSON.stringify(localTheme || theme)

  useEffect(() => {
    if (stringTheme !== stringLocalTheme) context.setTheme(localTheme || theme)
  }, [stringTheme, stringLocalTheme])
  
  return context
}

let CyberInvocation; export default CyberInvocation = ({ Component, pageProps }) => {
  const previousRoute = usePreviousRoute()
  const [t, setTheme] = useState(theme)
  
  return (
    <SWRConfig value={{ fetcher, onError: err => console.error(err) }}>
      <GlobalStyles theme={t} />
      <PromiseDialog>
        <ThemeContext.Provider value={{ theme: t, setTheme }}>
          <Component {...pageProps} previousRoute={previousRoute} />
        </ThemeContext.Provider>
      </PromiseDialog>
      <Toaster position='bottom-center' />
    </SWRConfig>
  ) // -- mamud | dream -- // http://psd.museum.upenn.edu/nepsd-frame.html
}