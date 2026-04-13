import { GiGreekSphinx } from "react-icons/gi"
import { BiQuestionMark } from "react-icons/bi"
import { BsDiscord } from "react-icons/bs"
import { FaTrophy } from "react-icons/fa"
import { IoMdHome } from "react-icons/io"
import Link from "next/link"
import { MenuIconButton } from "../layout/Layout"
import { Tag } from "../tag/Tag"

export const DailyHeader = () => {
  return (
    <div className='fixed flex items-start m-1 top-0 left-0 text-sm z-[10]' css={{
      '@media (max-width: 600px)': { display: 'block' }
    }}>
      <div className='flex items-center mb-1'>
        <div className='flex items-center bg-black text-white p-[0px_7px_0px_5px] rounded-[4px] h-[24px] overflow-hidden'>
          <GiGreekSphinx className='mr-2' />
          <span className='mt-[1px]'>Artifact Guesser</span>
        </div>
        <Tag className='ml-1.5' css={{ height: 24, padding: '3px 6px', lineHeight: '18px' }} bold color='#4f95ff'>
          Today's Run
        </Tag>
      </div>
      <div className='flex items-center'>
        <Link href='/'>
          <MenuIconButton
            className='ml-1.5'
            css={{
              border: '1px solid #00000033',
              '@media (max-width: 600px)': { marginLeft: 0 }
            }}
            tooltip='Resume Personal Game'
            theme={{
              textColor: '#000000',
              primaryColor: '#7dddc3',
              backgroundColor: '#7dddc3'
            }}
          >
            <IoMdHome />
          </MenuIconButton>
        </Link>
        <Link href='https://discord.gg/MvkqPTdcwm'>
          <MenuIconButton className='ml-1.5' css={{ border: '1px solid #ffffff33' }} tooltip='Join Discord' theme={{
            textColor: '#ffffff',
            primaryColor: '#5562ea',
            backgroundColor: '#5562ea'
          }}>
            <BsDiscord />
          </MenuIconButton>
        </Link>
        <Link href='/about'>
          <MenuIconButton className='ml-1.5' tooltip='About' css={{ border: '1px solid #ffffff66' }}>
            <BiQuestionMark />
          </MenuIconButton>
        </Link>
      </div>
    </div>
  )
}
