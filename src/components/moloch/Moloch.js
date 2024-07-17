import { molochTheme } from "@/pages/support"
import { IconGenerator } from "../art/IconGenerator"
import { AboutMe } from "./components/AboutMe"
import { FuturePlans } from "./components/FuturePlans"
import { PlanSelector } from "./components/PlanSelector"
import { PrimaryAsk } from "./components/PrimaryAsk"
import { createStyles } from "@/components/GlobalStyles"

export const Moloch = ({ isDialog }) => {

  return (
    <div className='flex flex-col items-center' css={{
      minHeight: isDialog ? null : '100vh',
      ...createStyles(molochTheme)
    }}>
      <h2 className='flex mt-3 font-bold justify-center text-center w-full' css={{
        fontSize: '1.5rem',
        '@media (max-width: 600px)': {
          marginTop: 8,
          padding: '0 2rem'
        }
      }}>
        <div className='mr-4 mt-1' css={{
          '@media (max-width: 600px)': { display: 'none' }
        }}>
          <IconGenerator />
        </div>
        <b>Supporting Artifact Guesser</b>
        <div className='ml-4 mt-1' css={{
          transform: 'scaleX(-1)',
          '@media (max-width: 600px)': { display: 'none' }
        }}>
          <IconGenerator />
        </div>
      </h2>

      <div className='text-base flex flex-col w-full items-center'>
        <PrimaryAsk isDialog={isDialog} />
        <FuturePlans />
        <AboutMe />
      </div>
      <PlanSelector />
    </div>
  )
}