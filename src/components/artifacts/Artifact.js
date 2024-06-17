import { formatDate, formatDateRange } from "@/lib/artifactUtils"
import { centroids } from "@/lib/getProximity"
import { MapInteractionCSS } from 'react-map-interaction'
import { ArtifactOverview } from "./components/ArtifactOverview"
import { IconButton } from "../buttons/IconButton"
import { ArtifactSource } from "./components/ArtifactSource"
import { useEffect, useState } from "react"
import { ImmersiveDialog } from "../dialogs/ImmersiveDialog"
import Link from "next/link"
import { useRouter } from "next/router"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { MasonryLayout } from "../layout/MasonryLayout"
import { ArtifactImage } from "./list/components.js/ArtifactImage"
import { BiLinkExternal, BiRefresh, BiWorld } from "react-icons/bi"
import { GiAmphora } from "react-icons/gi"
import { LoadingArtifact } from "../loading/LoadingArtifact"
import useUser from "@/hooks/useUser"
import { LuScroll } from 'react-icons/lu'
import { PiEyeFill } from "react-icons/pi"

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

  // map values
  const [value, setValue] = useState(defaultMapValue)

  // Handle image loading
  const [loadingComplete, setLoadingComplete] = useState(false)

  // Handle expansion
  const [expandDescription, setExpandDescription] = useState(false)
  const [expandReferences, setExpandReferences] = useState(false)

  const averageTime = Math.round((a.time.start + a.time.end) / 2)
  const centroid = centroids.find(c => c.name === a.location.country)
  const latLng = centroid && `${centroid.latitude},${centroid.longitude}`

  return (
    <>
      {immersive && (
        <ImmersiveDialog value={value} setValue={setValue} visible closeDialog={() => setImmersive(false)}>
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

          <MapInteractionCSS maxScale={100} value={value} onChange={v => setValue(v)}>
            <ImageView
              imgs={a.images.external}
              setLoadingComplete={setLoadingComplete}
              loadingComplete={loadingComplete}
            />
          </MapInteractionCSS>

          <div className='absolute bottom-1 right-1 z-10 flex items-center'>
            <IconButton tooltip='Reset View' onClick={() => setValue(defaultMapValue)} css={{
              background: 'black',
              color: 'white',
              border: '1px solid #ffffff55',
              '&:hover': {
                background: '#343434',
                color: 'white'
              },
              outline: 0,
              marginRight: 4
            }}>
              <BiRefresh />
            </IconButton>
            <div className='mr-1 p-[1px_6px_1.5px] rounded text-white bg-black border border-white/30'>
              {a.images.external.length} {a.images.external.length > 1 ? 'images' : 'image'}
            </div>
            <button
              onClick={() => setImmersive(true)}
              className='p-[2px_12px] rounded inline-flex border border-white/30'
              css={{
                background: 'var(--primaryColor)',
                '&:hover': {
                  background: 'var(--primaryColorLight)',
                },
              }}
            >
              <PiEyeFill className='mr-2 relative top-[3px]' />
              View immersively
            </button>
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
              {a.description && (
                <>
                  <div className='mt-3 mb-1 opacity-70'>
                    Description
                  </div>
                  <div className='p-2 mb-6 rounded' css={{
                    background: 'var(--backgroundColorBarelyLight)',
                  }}>
                    <div dangerouslySetInnerHTML={{
                      __html: (expandDescription || a.description.split('<br><br>').length <= 3)
                        ? a.description
                        : a.description.split('<br><br>').slice(0, 3).join('<br><br>')
                    }} />
                    {a.description.split('<br><br>').length > 3 && (
                      <div className='mt-3 flex justify-end'>
                        <button
                          onClick={() => setExpandDescription(ed => !ed)}
                          className='p-[2px_12px] rounded inline-flex'
                          css={{
                            background: 'var(--primaryColor)',
                            '&:hover': {
                              background: 'var(--primaryColorLight)',
                            },
                            '& svg': {
                              color: 'var(--primaryColorVeryDark)',
                              fill: 'var(--primaryColor)',
                            }
                          }}
                        >
                          <LuScroll className='mr-2 relative top-[3px]' />
                          {expandDescription ? 'Read less' : 'Read more'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {a.references?.length > 0 && (
                <div className='mb-6'>
                  <div className='mb-1 opacity-70'>
                    References
                  </div>
                  <div>
                    {a.references.slice(0, 4).map((ref, i) => (
                      <div className='p-2 mb-1 rounded' css={{
                        background: 'var(--backgroundColorBarelyLight)',
                      }}>
                        <div key={i} dangerouslySetInnerHTML={{ __html: ref }} />
                      </div>
                    ))}
                  </div>
                  {a.references.length > 4 && (
                    <>
                      {expandReferences && (
                        <div>
                          {a.references.slice(4).map((ref, i) => (
                            <div className='p-2 mb-1 rounded' css={{
                              background: 'var(--backgroundColorBarelyLight)',
                            }}>
                              <div key={i} dangerouslySetInnerHTML={{ __html: ref }} />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className='flex justify-end'>
                        <button
                          onClick={() => setExpandReferences(ed => !ed)}
                          className='p-[2px_12px] rounded inline-flex'
                          css={{
                            background: 'var(--backgroundColorSlightlyLight)',
                            '&:hover': {
                              background: 'var(--backgroundColorLight)',
                            },
                            '& svg': {
                              color: 'var(--primaryColorVeryDark)',
                              fill: 'var(--primaryColor)',
                            }
                          }}
                        >
                          <LuScroll className='mr-2 relative top-[3px]' />
                          {expandReferences ? 'Hide references' : 'Show all references'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
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
            {a.wikiDataUrl && (
              <div className='mb-1 opacity-70'>
                Meta
              </div>
            )}
            {a.wikiDataUrl && (
              <>
                <div className='mb-6'>
                  <Link
                    href={a.wikiDataUrl}
                    className='p-2 flex justify-between items-center'
                    target='_blank'
                    css={{
                      background: 'var(--backgroundColor)',
                      '&:hover': {
                        color: 'var(--textColor)' ,
                        background: 'var(--backgroundColorBarelyLight)',
                      },
                      border: '1px outset',
                      borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
                      transition: 'color 0.2s, background 0.2s'
                    }}
                  >
                    <div className='flex items-center'>
                      <img
                        src='https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikidata-logo.svg'
                        width={20}
                        className="mr-3"
                      />
                      Wiki Data Entry
                    </div>
                    <BiLinkExternal className="mr-1 opacity-70" />
                  </Link>
                </div>
              </>
            )}
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

const defaultMapValue = {
  scale: 1,
  translation: { x: 0, y: 0 }
}

const ImageView = ({ imgs, setLoadingComplete, loadingComplete }) => {
  const [loaded, setLoaded] = useState(0)
  const [errorImgs, setErrorImgs] = useState([])

  const renderImgs = imgs.filter(img => !errorImgs.includes(img))

  useEffect(() => {
    if (renderImgs?.length === loaded && setLoadingComplete) {
      setLoadingComplete(true)
    }
  }, [loaded, renderImgs])

  return (
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
              opacity: (loadingComplete || !setLoadingComplete) ? 1 : 0,
              display: errorImgs.includes(img) ? 'none' : 'block',
            }}
            onLoad={() => setLoaded(l => l + 1)}
            onError={() => {
              setErrorImgs(ei => [...ei, img])
            }}
          />
        ))}
      </MasonryLayout>
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