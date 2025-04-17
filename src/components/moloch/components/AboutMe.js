import { dashboardTheme } from "@/pages/dashboard"
import { createStyles } from "@/components/GlobalStyles"
import { Img } from "@/components/html/Img"
import { SocialMedia } from "./SocialMedia"

export const AboutMe = () => {

  return (
    <div className='flex flex-col pt-4 p-3 w-full items-center' css={createStyles(dashboardTheme)}>
      <div className='mr-4 max-w-[700px] mb-4'>
      <b>Who you are supporting</b>: I'm Sam, or <b>protocodex</b> <SocialMedia style={{ display: 'inline-flex', position: 'relative', top: 2 }} />{' '}
      most places online. I live on a vegan homestead (we just keep farm animals as pets),{' '}
      so funding Artifact Guesser also supports my a horde of adorable goats and chickens.{' '}
      </div>
      <div className='flex flex-wrap items-center'>
        <div className='mr-2'>
          <Img src='/me/menpenelope.jpeg' className='rounded mb-1 w-[110px] min-w-[110px]' css={{
            cursor: 'pointer',
            ':hover': { opacity: 0.7, transition: 'all 0.2s' }
          }} />
          <div className='text-xs text-center'>
            Me, con goat.
          </div>
        </div>
        <div className='mr-2'>
          <Img src='/me/badbabe.jpeg' className='rounded mb-1 w-[164px] min-w-[164px]' css={{
            cursor: 'pointer',
            ':hover': { opacity: 0.7, transition: 'all 0.2s' }
          }} />
          <div className='text-xs text-center'>
            Goat in a box.
          </div>
        </div>
        <div className='mr-2'>
          <Img src='/me/chickens.jpeg' className='rounded mb-1 w-[164px] min-w-[164px]' css={{
            cursor: 'pointer',
            ':hover': { opacity: 0.7, transition: 'all 0.2s' }
          }} />
          <div className='text-xs text-center'>
            Chickens havin a lil drink
          </div>
        </div>
      </div>
    </div>
  )
}