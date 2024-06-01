import Link from "next/link"
import { themeCSS } from "../GlobalStyles"
import { IconButton } from "../buttons/IconButton"
import { IoMdEye } from "react-icons/io"
import { Tag } from "../tag/Tag"

export const DashInfo = ({ title, count, url, theme, actions }) => {

  return (
    <div css={themeCSS(theme)}>
      <div className='p-3 pl-4 rounded-lg mr-2 mb-2
        w-[260px] max-w-[calc(100vw_-_72px)] flex items-center justify-between cusrsor-pointer'
        css={{
          background: 'var(--backgroundColorBarelyLight)',
        }}
      >
        <div className='flex items-center'>
          {title}
          <Tag className='ml-2' bold noBorder big color='var(--backgroundColorLight)'>
            {count}
          </Tag>
        </div>
        <div className='flex items-center'>
          <Link href={url}>
            <IconButton tooltip='View'>
              <IoMdEye />
            </IconButton>
          </Link>
          {actions}
        </div>
      </div>
    </div>
  )
}