import Link from "next/link"
import { themeCSS } from "../GlobalStyles"

export const DashInfo = ({ title, count, url, theme }) => {

  return (
    <div css={themeCSS(theme)}>
      <Link href={url} css={{ textDecoration: 'none', '&:hover': { color: 'var(--textColor)' } }}>
        <div className='p-3 px-4 rounded mr-2 mb-2
            w-[260px] max-w-[calc(100vw_-_72px)] flex items-center justify-between cusrsor-pointer cursor-pointer'
            css={{
              background: 'var(--backgroundColorBarelyLight)',
              '&:hover': { background: 'var(--backgroundColorSlightlyLight)' }
            }}
          >
          <div className='flex items-center'>
            {title}
          </div>
          <div>
            <b>{count}</b>
          </div>
        </div>
      </Link>
    </div>
  )
}