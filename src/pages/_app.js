import '@/globals.css'
import axios from 'axios'
import { Toaster } from 'react-hot-toast'
import { SWRConfig } from 'swr'
import { GlobalStyles } from "@/components/GlobalStyles"
import { PromiseDialog } from '@/components/dialogs/Dialog'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import { usePreviousRoute } from '@/hooks/usePreviousRoute';
import { trackPageview } from '@/lib/analytics';
import { MultiplayerProvider } from '@/components/multiplayer/context/MultiplayerContext'; // Import MultiplayerProvider
import { GlobalChatProvider } from '@/contexts/GlobalChatContext'; // Import GlobalChatProvider
import io from "socket.io-client"

const fetcher = url => axios.get(url).then(res => res.data)

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:9667', { withCredentials: false })

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

  // Track pageviews on route changes
  const router = useRouter()
  useEffect(() => {
    trackPageview() // Initial pageview
    const handleRouteChange = () => trackPageview()
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => router.events.off('routeChangeComplete', handleRouteChange)
  }, [])
  
  return (
    <SWRConfig value={{ fetcher, onError: err => console.error(err) }}>
      <GlobalStyles theme={t} />
      <MultiplayerProvider> {/* Wrap entire app */}
        <GlobalChatProvider> {/* Wrap inside MultiplayerProvider */}
          <PromiseDialog>
            <ThemeContext.Provider value={{ theme: t, setTheme }}>
              <Component {...pageProps} previousRoute={previousRoute} />
            </ThemeContext.Provider>
          </PromiseDialog>
        </GlobalChatProvider>
      </MultiplayerProvider>
      <Toaster position='bottom-center' />
    </SWRConfig>
  ) // -- mamud | dream -- // http://psd.museum.upenn.edu/nepsd-frame.html
}
