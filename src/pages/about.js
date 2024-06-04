import { Layout } from "@/components/layout/Layout"
import { artifactsTheme } from "./artifacts"
import { IconGenerator } from "@/components/art/IconGenerator"


export default () => {

  return (
    <Layout title='Artifacts List' theme={artifactsTheme} contentCSS={{ fontFamily: 'monospace' }}>
      <h3 className='flex mt-3 font-bold justify-center text-center w-full' css={{
        fontSize: '1.1rem',
        '@media (max-width: 600px)': {
          fontSize: '1.1rem',
          marginTop: 8,
          padding: '0 2rem'
        }
      }}>
        <div className='mr-4' css={{
          '@media (max-width: 600px)': { display: 'none' }
        }}>
          <IconGenerator />
        </div>
        About Artifact Guesser
        <div className='ml-4' css={{
          transform: 'scaleX(-1)',
          '@media (max-width: 600px)': { display: 'none' }
        }}>
          <IconGenerator />
        </div>
      </h3>

      <div className='mt-4'>
        Artifact Guesser is a game where you guess the country and date of an artifact.{' '}
        Development stage is currently in <b>alpha</b>.
        <div>
          The data used for the artifacts is originally from the{' '}
          <a href='https://www.metmuseum.org/' target='_blank' className='text-blue-500 hover:underline'>
            Metropolitan Museum of Art
          </a>, as they provide a very nice{' '}
          <a href='https://metmuseum.github.io/' target='_blank' className='text-blue-500 hover:underline'>
            API
          </a> to access their collection, with more sources (such as the Harvard Museum, the British Museum, etc) to be added as development progresses.
        </div>
        <div className='my-2'>
          <b>Feature Requests so far</b> (to be implemented soon):
        </div>
        <ul className='list-disc ml-8'>
          <li>Make the map expandable/contractable</li>
          <li>Improve timeline on desktop</li>
          <li>Timed round function</li>
          <li>Game Modes (Eras, Continents, types of Artifact, etc)</li>
        </ul>
        <div className='my-2'>
          <b>BIG Future Features</b>:
        </div>
        <ul className='list-disc ml-8'>
          <li>Multiplayer!</li>
          <li>Map shows world/empires as they were when adjusting timeline date</li>
        </ul>
        <div className='my-3 p-2 rounded w-[fit-content]' css={{
          background: 'var(--backgroundColorBarelyDark)'
        }}>
          To add more, please head to the <b>#feature-requests</b> channel in the{' '}
          <a href='https://discord.gg/TaS779hh' className='text-blue-500 hover:underline'>
            Discord
          </a>
          .
        </div>
      </div>
    </Layout>
  )
}