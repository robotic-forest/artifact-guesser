import { useQuery } from "@/hooks/useQuery"
import { IconGenerator } from "../art/IconGenerator"

export const Lobby = ({ clients }) => {
  const { query } = useQuery()
  const lobby = query.lobby

  return (
    <div className='mt-4 w-full'>
      <div className='flex justify-between'>
        <div>
          {capitalize(lobby)} Lobby
        </div>
      </div>
      <div className='mt-1 p-1 pb-0 pr-0 text-sm flex flex-wrap' css={{
        background: `var(--backgroundColorBarelyDark)`,
        borderRadius: 3
      }}>
        {clients?.map(c => 
          <div className='p-[3px_8px] flex items-center justify-between mr-1 mb-1 rounded-[4px] overflow-hidden min-w-[fit-content]' css={{
            border: '1px solid var(--backgroundColorSlightlyDark)',
            background: 'var(--backgroundColorSlightlyLight)',
            boxShadow: 'rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(0 0 0 / 12%) ' +
              '0px 0px 0px 0px, rgb(0 0 0 / 0%) 0px 0px 0px 0px, rgb(64 68 82 / 8%) 0px 2px 5px 0px',
          }}>
            <IconGenerator className='mr-2' />
            <b>{c.username}</b>
          </div>
        )}
      </div>
    </div>
  )
}

export const capitalize = s => s[0].toUpperCase() + s.slice(1)