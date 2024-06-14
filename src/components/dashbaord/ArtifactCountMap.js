import { ArtefactMap } from "@/components/gameui/Map"
import { useRouter } from "next/router"
import { useState } from "react"

export const ArtifactCountMap = ({ artifacts, className }) => {
  const router = useRouter()
  const [hover, setHover] = useState(null)

  // TODO: resolve artifact country names,
  // these numbers arent quite right

  return (
    <div className={className} css={{
      border: '1.5px inset',
      borderColor: '#00000055 #ffffff77 #ffffff77 #00000055',
      height: 'min-content',
    }}>
      {!artifacts && (
        <div className='p-4' css={{
          background: 'var(--backgroundColor)',
        }}>
          Loading Map...
        </div>
      )}

      {artifacts && (
        <div className='h-full w-full overflow-hidden bg-[#8bb9f1] relative'>
          <ArtefactMap artifacts={artifacts} setHover={setHover} onClick={(name) => {
            router.push(`/artifacts?location.country=${name}&imageMode=true`)
          }} />
          {hover && (
            <div className='absolute p-[0px_4px] bg-[#000000dd] text-white' css={{
              bottom: 2,
              right: 2,
              // transform: 'translate(-50%, -100%)',
              zIndex: 1,
              whiteSpace: 'nowrap',
              fontSize: '0.8em'
            }}>
              {hover.name}: {hover.count}
            </div>
          )}
        </div>
      )}
    </div>
  )
}