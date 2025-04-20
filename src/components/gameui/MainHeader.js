import { GiAmphora, GiGreekSphinx } from "react-icons/gi"
import Link from "next/link"
import { MenuIconButton } from "../layout/Layout"
import { artifactsTheme } from "@/pages/artifacts"
import { BiQuestionMark } from "react-icons/bi"
import { BsDiscord } from "react-icons/bs"
import { FaTrophy } from "react-icons/fa"
import { Tag } from "../tag/Tag"
import { modes } from "./ModeButton"
import { useGame } from "../game/GameProvider"
import { useState } from "react"
import { LeaderBoard } from "./LeaderBoard"

export const MainHeader = () => {
  const { game } = useGame()
  const [leaderBoardOpen, setLeaderBoardOpen] = useState(false)

  return (
    <>
      <div className='fixed flex items-start m-1 top-0 left-0 text-sm z-[10]' css={{
        '@media (max-width: 600px)': { display: 'block' }
      }}>
        <div className='flex items-center mb-1'>
          <div className='flex items-center bg-black text-white p-[0px_7px_0px_5px] rounded-[4px] h-[24px] overflow-hidden'>
            <GiGreekSphinx className='mr-2' />
            <span className='mt-[1px]'>Artifact Guesser</span>
          </div>
          {game?.mode && (
            <Tag className='ml-1.5' css={{ height: 24, padding: '3px 6px 2px' }} bold color={modes[game.mode].color}>
              {game.mode}
            </Tag>
          )}
        </div>
        <div className='flex items-center'>
          <MenuIconButton
            className='ml-1.5'
            css={{
              border: '1px solid #00000033',
              '@media (max-width: 600px)': { marginLeft: 0 }
            }}
            tooltip='Highscores'
            theme={{
              textColor: '#000000',
              primaryColor: '#c9ae5f',
              backgroundColor: '#c9ae5f'
            }}
            onClick={() => setLeaderBoardOpen(lbo => !lbo)}
          >
            <FaTrophy />
          </MenuIconButton>
          <Link href='https://discord.gg/MvkqPTdcwm'>
            <MenuIconButton className='ml-1.5' css={{ border: '1px solid #ffffff33' }} tooltip='Join Discord' theme={{
              textColor: '#ffffff',
              primaryColor: '#5562ea',
              backgroundColor: '#5562ea'
            }}>
              <BsDiscord />
            </MenuIconButton>
          </Link>
          <Link href='/artifacts?imageMode=true'>
            <MenuIconButton className='ml-1.5' css={{ border: '1px solid #00000033' }} tooltip='View Artifact Database' theme={artifactsTheme}>
              <GiAmphora />
            </MenuIconButton>
          </Link>
          <Link href='/about'>
            <MenuIconButton className='ml-1.5' tooltip='About' css={{
              border: '1px solid #ffffff66'
            }}>
              <BiQuestionMark />
            </MenuIconButton>
          </Link>
        </div>
      </div>

      {leaderBoardOpen && (
        <LeaderBoard
          onClose={() => setLeaderBoardOpen(false)}
          mode={game?.mode}
          timer={game?.timer}
          rounds={game?.rounds}
        />
      )}
    </>
  )
}