import { Layout } from "@/components/layout/Layout"
import { ResumeGameButton } from "@/components/layout/components/ResumeGameButton"
import { artifactsTheme } from "./artifacts"
import { IconGenerator } from "@/components/art/IconGenerator"


export default () => {

  return (
    <Layout title='Artifacts List' theme={artifactsTheme} contentCSS={{ width: '100vw' }} noNav>
      <div className='fixed top-1 left-1'>
        <ResumeGameButton />
      </div>


      <div className='w-screen flex flex-col items-center font-mono'>
        <h3 className='flex text-2xl mt-4 font-bold text-center max-w-[80vw]'>
          <div className='mr-4'>
            <IconGenerator />
          </div>
          About Artifact Guesser
          <div className='ml-4' css={{ transform: 'scaleX(-1)' }}>
            <IconGenerator />
          </div>
        </h3>

        <div className='mt-4 w-[1200px] max-w-[calc(100vw-2rem)]'>
          Artifact Guesser is a game where you guess the country and date of an artifact.{' '}
          <div className='my-2'>
            <b>Feature Requests so far</b> (to be implemented soon):
          </div>
          <ul className='list-disc ml-8'>
            <li>Make the map expandable/contractable</li>
            <li>Improve timeline on desktop</li>
            <li>Timed round function</li>
            <li>Multiplayer! (this will take some time lol)</li>
          </ul>
          <div className='my-2'>
            To add more, please head to the <b>#feature-requests</b> channel in the{' '}
            <a href='https://discord.gg/TaS779hh' className='text-blue-500 hover:underline'>
              Discord
            </a>
            .
          </div>
        </div>
      </div>
    </Layout>
  )
}