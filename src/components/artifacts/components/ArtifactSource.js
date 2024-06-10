import Link from "next/link"
import { BiLinkExternal } from "react-icons/bi"
import { GiGreekTemple } from "react-icons/gi"

export const ArtifactSource = ({ source, style }) => {

  return (
    <Link href={source.url} className='p-2 flex justify-between items-center' target='_blank' css={{
      background: 'var(--backgroundColor)',
      '&:hover': {
        color: 'var(--textColor)' ,
        background: 'var(--backgroundColorBarelyLight)',
      },
      border: '1px outset',
      borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
      transition: 'color 0.2s, background 0.2s',
      ...style
    }}>
      <div className='flex items-center'>
        <GiGreekTemple className='mr-2 relative top-[-1px]' />
        {source.name}
      </div>
      <BiLinkExternal className="mr-1 opacity-70" />
    </Link>
  )
}