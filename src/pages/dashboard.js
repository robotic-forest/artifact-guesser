import { IconGenerator } from "@/components/art/IconGenerator";
import { Statistics } from "@/components/dashbaord/Statistics";
import { Layout } from "@/components/layout/Layout";
import { MdDashboard } from "react-icons/md";
import { GlobalChat } from "@/components/chat/GlobalChat";
import { LobbyBrowser } from "@/components/multiplayer/LobbyBrowser";

export const dashboardTheme = {
  backgroundColor: '#78c9ab',
  primaryColor: '#96a1f7',
  textColor: '#000000',
};

const DashboardPage = () => {

  return (
    <Layout title='Dashboard' theme={dashboardTheme} contentCSS={{
      fontFamily: 'monospace',
      background: 'linear-gradient(180deg, var(--backgroundColor), var(--backgroundColorDark))',
      minHeight: '100vh',
    }}>
      <div className='mb-3 mt-[3px] flex items-center justify-between' css={{
         '@media (max-width: 600px)': { marginLeft: 32, marginRight: 32 },
      }}>
        <div className='flex items-center'>
          <MdDashboard className='mr-2'/>
          Dashbaord
        </div>
        <div className='flex items-center'>
          <IconGenerator className='mr-2' />
          <IconGenerator className='mr-2' />
          <IconGenerator className='mr-2' />
        </div>
      </div>
      <Statistics />
      <div css={{
        position: 'fixed',
        bottom: 8,
        left: 48,
      }}>
        <GlobalChat notFixed showHeader backgroundColor='var(--backgroundColorDark)' />
        <LobbyBrowser backgroundColor='var(--backgroundColorDark)' />
      </div>
    </Layout>
  );
};

export default DashboardPage;
