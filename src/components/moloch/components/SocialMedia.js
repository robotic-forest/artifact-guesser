import { IconButton } from "@/components/buttons/IconButton"
import { BsYoutube } from "react-icons/bs"

export const SocialMedia = ({ style }) => {

  return (
    <div className='flex items-center' css={style}>
      <IconButton tooltip='Follow on instagram' css={{
        color: '#ff0000',
        '&:hover': {
          filter: 'brightness(0.8)'
        }
      }}>
        <img src='/instagram.svg' css={{ width: 16, height: 16 }} />
      </IconButton>
      <IconButton className='ml-1' tooltip='Visit Youtube Channel' css={{
        color: '#ff0000'
      }}>
        <BsYoutube />
      </IconButton>
    </div>
  )
}