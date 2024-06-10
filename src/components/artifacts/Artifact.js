import { formatDate, formatDateRange } from "@/lib/artifactUtils"
import { centroids } from "@/lib/getProximity"
import { MapInteractionCSS } from 'react-map-interaction'
import { ArtifactOverview } from "./components/ArtifactOverview"
import { IconButton } from "../buttons/IconButton"
import { ArtifactSource } from "./components/ArtifactSource"
import { FaExpand } from "react-icons/fa"
import { useState } from "react"
import { IoChevronBack } from "react-icons/io5"
import { ImmersiveDialog } from "../dialogs/ImmersiveDialog"
import Link from "next/link"
import { useRouter } from "next/router"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { MasonryLayout } from "../layout/MasonryLayout"
import { ArtifactImage } from "./list/components.js/ArtifactImage"

export const Artifact = ({ artifact: a }) => {
  const router = useRouter()
  const [immersive, setImmersive] = useState(false)
  const { artifacts: relatedArtifacts } = useArtifacts({
    filter: {
      'location.country': a.location.country,
      'time.start': { $gte: a.time.start - 10 },
      'time.end': { $lte: a.time.end + 10 },
    },
    paginate: {
      defaultPageSize: 12
    }
  })

  console.log(relatedArtifacts)

  const averageTime = Math.round((a.time.start + a.time.end) / 2)
  const centroid = centroids.find(c => c.name === a.location.country)
  const latLng = centroid && `${centroid.latitude},${centroid.longitude}`

  return (
    <>
      {immersive && (
        <ImmersiveDialog visible closeDialog={() => setImmersive(false)}>
          <div className='flex flex-wrap w-screen'>
            {a.images.external?.length > 0 && a.images.external.map(img => (
              <img key={img} src={img} css={{ height: 500 }} />
            ))}
          </div>
        </ImmersiveDialog>
      )}
      <div>
        <div className='flex flex-wrap w-full h-[500px] bg-black relative'>
          <div className='absolute top-1 left-1.5 z-10 hidden items-center' css={{
            '@media (min-width: 768px)': {
              display: 'flex'
            }
          }}>
            <IconButton onClick={() => router.back()} css={{
              background: 'black',
              color: 'white',
              border: '1px solid #ffffff55',
              '&:hover': {
                background: '#343434',
                color: 'white'
              }
            }}>
              <IoChevronBack />
            </IconButton>
            <div className='ml-1 p-[1px_6px_1.5px] rounded text-white bg-black border border-white/30'>
              {a.name}, {a?.location.country}, {formatDateRange(a?.time.start, a?.time.end)}
            </div>
          </div>

          <div className='absolute top-[11px] left-[40px] z-10 flex items-center' css={{
            '@media (min-width: 768px)': {
              display: 'none'
            }
          }}>
            <IconButton size={26} onClick={() => router.back()} css={{
              background: 'black',
              color: 'white',
              '&:hover': {
                background: '#343434',
                color: 'white'
              }
            }}>
              <IoChevronBack className='relative left-[-1px]' />
            </IconButton>
            <div className='ml-1 p-[2px_6px_2.5px] rounded text-white bg-black border border-white/30'>
              {a.name}
            </div>
          </div>

          <MapInteractionCSS maxScale={100}>
            <div className='flex flex-wrap w-screen'>
              {a.images.external?.length > 0 && a.images.external.map(img => (
                <img key={img} src={img} css={{ height: 400 }} />
              ))}
            </div>
          </MapInteractionCSS>

          <div className='absolute bottom-1 right-1 z-10 flex items-center'>
            <IconButton tooltip='Expand' onClick={() => setImmersive(true)} css={{
              background: 'black',
              color: 'white',
              border: '1px solid #ffffff55',
              '&:hover': {
                background: '#343434',
                color: 'white'
              },
              outline: 0
            }}>
              <FaExpand />
            </IconButton>
          </div>
        </div>

        <div className='grid grid-cols-[3fr_2fr] w-full h-full flex-grow' css={{
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          <div css={{ padding: 10 }}>
            <ArtifactOverview artifact={a} />
            <div className='mt-3 mb-1 opacity-70'>
              Context
            </div>
            <div className='p-2 rounded' css={{
              background: 'var(--backgroundColorBarelyLight)',
            }}>
              Adding context information to artifacts is a work in progress. Click the source link for most of the good info on this object.
            </div>
          </div>

          <div className='p-2' css={{
            background: 'var(--backgroundColorBarelyDark)',
          }}>
            <div className='mb-1 opacity-70'>
              Source
            </div>
            <ArtifactSource source={a.source} style={{ marginBottom: 8 }} />
            <div className='mb-1 opacity-70 flex items-center'>
              The world at that time
            </div>
            <div className='h-[300px] w-full relative' css={{
              border: '1.5px inset',
              borderColor: '#00000055 #ffffff77 #ffffff77 #00000055',
            }}>
              <div className='absolute top-1 right-1 border border-white/30 bg-black text-white p-[1px_6px] rounded-[3px] text-sm'>
                {formatDate(averageTime)}
              </div>
              <iframe
                src={`https://www.runningreality.org/?notimeline&nobox&nocontrols#01/01/${averageTime}&${latLng}`}
                sandbox="allow-same-origin allow-scripts"
                width="100%"
                height="100%"
              />
              <div className='absolute bottom-1 right-1 z-10 flex items-center'>
                <Link href={`https://www.runningreality.org/#01/01/${averageTime}&${latLng}&zoom=6`} target='_blank'>
                  <IconButton tooltip='Explore' css={{
                    background: 'black',
                    color: 'white',
                    border: '1px solid #ffffff55',
                    '&:hover': {
                      background: '#343434',
                      color: 'white'
                    },
                    outline: 0
                  }}>
                    <FaExpand />
                  </IconButton>
                </Link>
              </div>
            </div>
            <div className='mb-1 opacity-70 flex justify-end'>
              <a href='https://www.runningreality.org/projects/' target='_blank'>runningreality.org</a>
            </div>
          </div>
        </div>
      </div>

      <div css={{
        background: 'var(--backgroundColorSlightlyDark)',
      }}>
        {relatedArtifacts?.length> 0 && (
          <MasonryLayout
            gutter={0}
            breaks={{
              default: 6,
              600: 2,
              900: 3,
              1200: 4,
              1600: 5
            }}
          >
            {relatedArtifacts.map(row => (
              <ArtifactImage key={row._id} artifact={row} noTumbnail />
            ))}
          </MasonryLayout>
        )}
      </div>
    </>
  )
}