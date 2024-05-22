import Link from "next/link"

export const DashInfo = ({ title, count, url }) => {

  return (
    <Link href={url} css={{ textDecoration: 'none', '&:hover': { color: 'var(--textColor)' } }}>
      <div className='p-3 border border-white/20 rounded mr-2 mb-2
          w-[260px] max-w-[calc(100vw_-_72px)] flex items-center justify-between cusrsor-pointer cursor-pointer hover:bg-white/10'
        >
        <div className='flex items-center'>
          {title}
        </div>
        <div>
          {count}
        </div>
      </div>
    </Link>
  )
}