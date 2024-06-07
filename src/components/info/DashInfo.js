import Link from "next/link"
import { themeCSS } from "../GlobalStyles"
import { IconButton } from "../buttons/IconButton"
import { IoMdEye } from "react-icons/io"
import { Tag } from "../tag/Tag"

export const DashInfo = ({ title, count, url, theme, actions, extraInfo }) => {

  return (
    <div css={themeCSS(theme)}>
      <div className='mb-2' css={{
        background: 'var(--backgroundColorBarelyLight)',
        border: '1px outset',
        borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
      }}>
        <div className='p-3 flex items-center justify-between'>
          <div className='flex items-center'>
            {title}
            <Tag className='ml-2' bold noBorder big color='var(--backgroundColorLight)'>
              {count}
            </Tag>
          </div>
          <div className='flex items-center'>
            <Link href={url}>
              <IconButton>
                <IoMdEye />
              </IconButton>
            </Link>
            {actions}
          </div>
        </div>
        {extraInfo}
      </div>
    </div>
  )
}