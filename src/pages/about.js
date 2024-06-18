import { Layout } from "@/components/layout/Layout"
import { artifactsTheme } from "./artifacts"
import { IconGenerator } from "@/components/art/IconGenerator"
import { PiRedditLogoFill } from "react-icons/pi"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { ArtifactCountMap } from "@/components/dashbaord/ArtifactCountMap"
import { SiKofi } from "react-icons/si"
import { MenuButton } from "@/components/layout/components/MobileNav"
import { Collosi } from "@/components/dashbaord/Collosi"

export default () => {
  const { artifacts } = useArtifacts({ total: true })

  return (
    <Layout title='Artifacts List' theme={artifactsTheme} contentCSS={{
      fontFamily: 'monospace',
      background: 'linear-gradient(180deg, var(--backgroundColor), var(--backgroundColorDark))',
      minHeight: '100vh',
    }}>
      <h3 className='flex mt-3 font-bold justify-center text-center w-full' css={{
        fontSize: '1.1rem',
        '@media (max-width: 600px)': {
          fontSize: '1.1rem',
          marginTop: 8,
          padding: '0 2rem'
        }
      }}>
        <div className='mr-4 mt-1' css={{
          '@media (max-width: 600px)': { display: 'none' }
        }}>
          <IconGenerator />
        </div>
        About Artifact Guesser
        <div className='ml-4 mt-1' css={{
          transform: 'scaleX(-1)',
          '@media (max-width: 600px)': { display: 'none' }
        }}>
          <IconGenerator />
        </div>
      </h3>

      <div className='mt-4'>
        <div className='w-full flex justify-center my-2'>
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
        <div className='w-full flex justify-center my-2'>
          <div className='my-3 p-2 pb-0 rounded w-[fit-content] inline-flex items-center flex-wrap justify-end'
          css={{ background: '#f1d18b' }}>
            <span className='mr-2 mb-2'>
              Want to help support this project?{' '}
              All donations go toward development, server costs, and occasionally goat-treats.{' '}
            </span>
            <MenuButton
              theme={{
                backgroundColor: '#e7ba56',
                primaryColor: '#e7ba56',
                textColor: 'black'
              }} 
              url='https://ko-fi.com/protocodex'
              target='_blank'
              style={{
                width: 'fit-content',
                marginBottom: 4
              }}
            >
              <SiKofi className='mr-2' />
              Donate Here
            </MenuButton>
          </div>
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
          <li>
            <b>3D Artifacts!</b> Preview:
            <Collosi className='flex my-2' />
          </li>
        </ul>
        <div className='my-2'>
          <b>Brainstorming</b>:
        </div>
        <ul className='list-disc ml-8'>
          <li>Detect Forgery Mode - instead of, or perhaps additionally to, guessing date/location,{' '}
          determine if a piece is authentic.</li>
        </ul>
        <div className='my-3 p-2 rounded w-[fit-content]' css={{
          background: 'var(--backgroundColorDark)'
        }}>
          To add more, please head to the <b>#feature-requests</b> channel in the{' '}
          <a href='https://discord.gg/MvkqPTdcwm' className='text-blue-500 hover:underline'>
            Discord
          </a>
          .
        </div>
        <div className='mt-8 mb-1'><b>Current Artifacts in the DB by country</b> (zoomable, click to country to view its list):</div>
        <div className='w-[1000px] max-w-[100%]'>
          <ArtifactCountMap artifacts={artifacts?.byCountry} />
        </div>
        <div className='my-3 flex items-center'>
          <IconGenerator className='mr-2' />
          <IconGenerator className='mr-2' />
          <IconGenerator className='mr-2' />
        </div>
      </div>
    </Layout>
  )
}