import { formatDate, formatDateRange } from "@/lib/artifactUtils"
import { centroids } from "@/lib/getProximity"
import { MapInteractionCSS } from 'react-map-interaction'
import { ArtifactOverview } from "./components/ArtifactOverview"
import { IconButton } from "../buttons/IconButton"
import { ArtifactSource } from "./components/ArtifactSource"
import { FaExpand } from "react-icons/fa"
import { useEffect, useState } from "react"
import { ImmersiveDialog } from "../dialogs/ImmersiveDialog"
import Link from "next/link"
import { useRouter } from "next/router"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { MasonryLayout } from "../layout/MasonryLayout"
import { ArtifactImage } from "./list/components.js/ArtifactImage"
import { BiWorld } from "react-icons/bi"
import { GiAmphora } from "react-icons/gi"
import { LoadingArtifact } from "../loading/LoadingArtifact"
import useUser from "@/hooks/useUser"

export const Artifact = ({ artifact: a, previousRoute }) => {
  const { user } = useUser()
  const router = useRouter()
  const [immersive, setImmersive] = useState(false)
  const { artifacts: relatedArtifacts, isValidating } = useArtifacts({
    filter: {
      'excludeId': a._id,
      'location.country': { $regex: a.location.country, $options: 'i' },
      'startDateAfter': a.time.start - 10,
      'endDateBefore': a.time.end + 10,
    },
    paginate: {
      defaultPageSize: 12
    }
  })

  // Handle image loading
  const [loadingComplete, setLoadingComplete] = useState(false)

  const averageTime = Math.round((a.time.start + a.time.end) / 2)
  const centroid = centroids.find(c => c.name === a.location.country)
  const latLng = centroid && `${centroid.latitude},${centroid.longitude}`

  return (
    <>
      {immersive && (
        <ImmersiveDialog visible closeDialog={() => setImmersive(false)}>
          <ImageView imgs={a.images.external} />
        </ImmersiveDialog>
      )}
      <div>
        <div className='flex flex-wrap w-full h-[50vh] min-h-[500px] bg-black relative'>
          <div className='absolute top-1 left-1.5 z-10 flex items-center' css={{
            padding: user?.isLoggedIn ? 0 : '8px 0 0 40px',
            '@media (max-width: 768px)': {
              padding: '8px 0 0 40px',
            }
          }}>
            <IconButton onClick={() => router.push(previousRoute?.includes('/artifacts?') ? previousRoute : '/artifacts')} css={{
              background: 'black',
              color: 'white',
              border: '1px solid #ffffff55',
              '&:hover': {
                background: '#343434',
                color: 'white'
              },
              marginRight: 4
            }}>
              <GiAmphora />
            </IconButton>
            <div className='p-[1px_6px_1.5px] rounded text-white bg-black border border-white/30 hidden' css={{
              '@media (min-width: 768px)': {
                display: 'flex'
              }
            }}>
              {a.name}, {a?.location.country}, {formatDateRange(a?.time.start, a?.time.end)}
            </div>
          </div>

          {!loadingComplete && <LoadingArtifact className='absolute' />}

          <MapInteractionCSS maxScale={100}>
            <ImageView imgs={a.images.external} setLoadingComplete={setLoadingComplete} />
          </MapInteractionCSS>

          <div className='absolute bottom-1 right-1 z-10 flex items-center'>
            <div className='mr-1 p-[1px_6px_1.5px] rounded text-white bg-black border border-white/30'>
              {a.images.external.length} {a.images.external.length > 1 ? 'images' : 'image'}
            </div>
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
          <div className='p-[10px] flex flex-col justify-between'>
            <div>
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
            <div className='relative top-1' css={{
              '@media (max-width: 768px)': {
                display: 'none'
              }
            }}>
              <RelatedArtifactsTitle artifact={a} />
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
                    <BiWorld />
                  </IconButton>
                </Link>
              </div>
            </div>
            <div className='mb-1 opacity-70 flex justify-end'>
              <a href='https://www.runningreality.org/projects/' target='_blank'>runningreality.org</a>
            </div>
            <div className='relative top-1' css={{
              '@media (min-width: 768px)': {
                display: 'none'
              }
            }}>
              <RelatedArtifactsTitle artifact={a} />
            </div>
          </div>
        </div>

      </div>
      <div css={{
        background: 'var(--backgroundColorSlightlyDark)',
        flexGrow: 1
      }}>
        {relatedArtifacts?.length> 0 ? (
          <MasonryLayout
            gutter={0}
            breaks={{
              default: 6,
              600: 2,
              900: 3,
              1200: 4,
              1600: 5
            }}
            noCalc
          >
            {relatedArtifacts.map(row => (
              <ArtifactImage key={row._id} artifact={row} />
            ))}
          </MasonryLayout>
        ) : !isValidating && (
          <div className='p-4 text-center opacity-70'>
            No related artifacts found.
          </div>
        )}
      </div>
    </>
  )
}

const ImageView = ({ imgs, setLoadingComplete }) => {
  const [loaded, setLoaded] = useState(0)

  useEffect(() => {
    if (imgs?.length === loaded && setLoadingComplete) {
      setLoadingComplete(true)
    }
  }, [loaded])

  return (
    <>
      {/* <div className='flex flex-wrap w-screen'>
        {imgs?.length > 0 && imgs.map(img => (
          <img key={img} src={img} css={{ height: 400 }} />
        ))}
      </div> */}
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
          {imgs?.length > 0 && imgs.map(img => (
            <img
              key={img}
              src={img}
              css={{
                opacity: imgs?.length === loaded ? 1 : 0,
                transition: 'all 0.4s ease-in'
              }}
              onLoad={() => setLoaded(l => l + 1)}
            />
          ))}
        </MasonryLayout>
    </>
  )
}

const RelatedArtifactsTitle = ({ artifact: a }) => {
  const relatedArtifactsHref = `/artifacts?location.country=${a?.location.country}` +
    `&startDateAfter=${a.time.start - 10}&endDateBefore=${a.time.end + 10}` +
    '&imageMode=true&__noTrack'

  return (
    <div className='flex items-center'>
      <span className='opacity-70 relative top-[1px]'>Related Artifacts</span>
      <Link href={relatedArtifactsHref}>
        <IconButton tooltip='View in Artifacts DB' className='ml-2'>
          <GiAmphora />
        </IconButton>
      </Link>
    </div>
  )
}