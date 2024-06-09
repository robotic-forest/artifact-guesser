import { Layout } from "@/components/layout/Layout"
import { artifactsTheme } from "./artifacts"
import { IconGenerator } from "@/components/art/IconGenerator"
import { PiRedditLogoFill } from "react-icons/pi"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { ArtifactCountMap } from "@/components/dashbaord/ArtifactCountMap"

export default () => {
  const { artifacts } = useArtifacts({ total: true })

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
        <div className='w-full flex justify-center mb-4'>
          <div className='my-3 p-2 px-3 rounded w-[fit-content] flex items-center flex-wrap' css={{
            background: 'var(--backgroundColorBarelyLight)'
          }}>
            <PiRedditLogoFill className='mr-2' />
            Join the subreddit at
            <a href='https://reddit.com/r/artifactguesser' className='text-blue-500 hover:underline ml-1'>
              /r/artifactguesser
            </a>!
          </div>
        </div>
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
        <div className='mt-4 mb-2'>
          <b>Feature Requests so far</b> (to be implemented soon):
        </div>
        <ul className='list-disc ml-8'>
          <li>Make the map expandable/contractable</li>
          <li>Improve timeline on desktop</li>
          <li>Timed round function</li>
          <li>
            <b>New Game Modes</b>: Continent Modes, Country Modes (timeline only), Era Modes (timeline constrained between set dates, ie. BC only, AD only, etc),{' '}
            medium modes (ie. only bronze artifacts), artifact types (swords, coins, etc), artifact subjects (frogs, dragons, etc)
          </li>
        </ul>
        <div className='my-2'>
          <b>BIG Future Features</b>:
        </div>
        <ul className='list-disc ml-8'>
          <li>Multiplayer!</li>
          <li>Map shows world/empires as they were when adjusting timeline date</li>
        </ul>
        <div className='my-2'>
          <b>Brainstorming</b>:
        </div>
        <ul className='list-disc ml-8'>
          <li>Detect Forgery Mode - instead of, or perhaps additionally to, guessing date/location,{' '}
          determine if a piece is authentic.</li>
        </ul>
        <div className='my-3 p-2 rounded w-[fit-content]' css={{
          background: 'var(--backgroundColorBarelyDark)'
        }}>
          To add more, please head to the <b>#feature-requests</b> channel in the{' '}
          <a href='https://discord.gg/MvkqPTdcwm' className='text-blue-500 hover:underline'>
            Discord
          </a>
          .
        </div>
        <div className='mb-1'><b>Current Artifacts in the DB by country</b> (zoomable, click to country to view its list):</div>
        <div className='w-[1000px] max-w-[100%]'>
          <ArtifactCountMap artifacts={artifacts?.byCountry} />
        </div>
      </div>
    </Layout>
  )
}