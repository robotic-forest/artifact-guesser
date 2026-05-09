import useSWR from 'swr'
import { themeCSS } from "../GlobalStyles"
import { GiWaxTablet } from "react-icons/gi"
import { FaArrowUp, FaRegComment } from "react-icons/fa"

export const behistunTheme = {
  backgroundColor: '#cb788a',
  primaryColor: '#cb788a',
  textColor: '#000000',
}

const fetcher = (url) => fetch(url).then(r => r.json())

const formatAge = (postedAt) => {
  const ms = Date.now() - new Date(postedAt).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}

export const Behistun = () => {
  const { data } = useSWR('/api/admin/reddit-posts', fetcher, { refreshInterval: 60000 })
  const posts = data?.posts || []

  return (
    <div css={themeCSS(behistunTheme)}>
      <div className='mb-2' css={{
        background: 'var(--backgroundColorBarelyLight)',
        border: '1px outset',
        borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
      }}>
        <div className='p-3 pb-2 flex items-center justify-between'>
          <div className='flex items-center'>
            <GiWaxTablet className='mr-2 scale-x-[-1]' />
            <b className='mr-2'>Behistun</b>
            <a href='https://reddit.com/user/protocodex' className='underline mr-2' target='_blank'>
              u/protocodex
            </a>
            Reddit Posts
          </div>
          <div className='text-xs opacity-60'>{posts.length}</div>
        </div>
        {posts.length > 0 ? (
          <div className='m-1 mt-0 p-1 pb-0 text-xs' css={{
            background: `var(--backgroundColorGhostDark)`,
            borderRadius: 3
          }}>
            {posts.map(p => <RedditPost key={p.redditId} post={p} />)}
          </div>
        ) : (
          <div className='m-1 mt-0 p-3 text-xs italic opacity-60' css={{
            background: `var(--backgroundColorGhostDark)`,
            borderRadius: 3
          }}>
            No posts yet.
          </div>
        )}
      </div>
    </div>
  )
}

const RedditPost = ({ post }) => (
  <a
    href={post.permalink}
    target='_blank'
    rel='noopener noreferrer'
    className='block mb-1 p-2 rounded'
    css={{
      background: 'var(--backgroundColorSlightlyLight)',
      border: '1px solid var(--backgroundColorSlightlyDark)',
      color: 'var(--textColor)',
      transition: 'filter 0.2s',
      '&:hover': { filter: 'brightness(1.1)' },
    }}
  >
    <div className='flex items-center justify-between mb-1'>
      <div css={{ fontWeight: 600 }}>r/{post.subreddit}</div>
      <div className='opacity-60'>{formatAge(post.postedAt)} ago</div>
    </div>
    <div className='mb-1'>{post.title}</div>
    <div className='flex items-center gap-3 opacity-80'>
      <span className='flex items-center'>
        <FaArrowUp className='mr-1' size={10} />
        {post.score ?? 0}
      </span>
      <span className='flex items-center'>
        <FaRegComment className='mr-1' size={10} />
        {post.numComments ?? 0}
      </span>
      {post.upvoteRatio != null && (
        <span className='opacity-60'>{Math.round(post.upvoteRatio * 100)}%</span>
      )}
    </div>
  </a>
)
