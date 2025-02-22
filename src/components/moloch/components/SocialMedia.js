import { IconButton } from "@/components/buttons/IconButton"
import Link from "next/link"
import { BsYoutube } from "react-icons/bs"

export const SocialMedia = ({ style }) => {

  return (
    <div className='flex items-center' css={style}>
      <Link href='https://www.instagram.com/technomoloch/' target='_blank'>
        <IconButton tooltip='Follow on instagram' css={{
          color: '#ff0000',
          '&:hover': {
            filter: 'brightness(0.8)'
          }
        }}>
          <img src='/instagram.svg' css={{ width: 16, height: 16 }} />
        </IconButton>
      </Link>
      <Link href='https://www.youtube.com/@technomoloch' target='_blank'>
        <IconButton className='ml-1' tooltip='Visit Youtube Channel' css={{
          color: '#ff0000'
        }}>
          <BsYoutube />
        </IconButton>
      </Link>
    </div>
  )
}