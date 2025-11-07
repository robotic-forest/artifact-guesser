import { formatDate } from "@/lib/artifactUtils"
import { centroids } from "@/lib/getProximity"
import { MapInteractionCSS } from 'react-map-interaction'
import { ArtifactOverview } from "./components/ArtifactOverview"
import { IconButton } from "../buttons/IconButton"
import { ArtifactSource } from "./components/ArtifactSource"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useArtifacts } from "@/hooks/artifacts/useArtifacts"
import { MasonryLayout } from "../layout/MasonryLayout"
import { ArtifactImage } from "./list/components.js/ArtifactImage"
import { BiExpand, BiLinkExternal, BiRefresh, BiWorld } from "react-icons/bi"
import { GiAmphora } from "react-icons/gi"
import { LoadingArtifact } from "../loading/LoadingArtifact"
import { LuScroll } from 'react-icons/lu'
import { DetailsItemAlt } from "../info/Details"
import { ArtifactNav } from "./components/ArtifactNav"
import { themeCSS } from "../GlobalStyles"
import { theme } from "@/pages/_app"
import useMeasure from "react-use-measure"
import { Artifact3D } from "../art/Artifact3D"
import { Immersive2D } from "./components/Immersive2D"
import { Immersive3D } from "./components/Immersive3D"
import { BuyMerch } from "./components/BuyMerch"

export const Artifact = ({ artifact: a, roundSummary }) => {
  const [ref, bounds] = useMeasure()
  const { height: windowHeight, width: windowWidth } = bounds

  const [relatedArtifactSettings, setRelatedArtifactSettings] = useState({
    startDateAfter: a.time.start - 10,
    endDateBefore: a.time.end + 10,
  })

  const { artifacts: relatedArtifacts, isValidating } = useArtifacts({
    filter: {
      'excludeId': a._id,
      'location.country': { $regex: a.location.country, $options: 'i' },
      'startDateAfter': relatedArtifactSettings.startDateAfter,
      'endDateBefore': relatedArtifactSettings.endDateBefore,
    },
    paginate: {
      defaultPageSize: 12
    }
  })

  useEffect(() => {
    if (!isValidating && relatedArtifacts?.length === 0) {
      console.log('No related artifacts found. Expanding search range.')
      setRelatedArtifactSettings({
        ...relatedArtifactSettings,
        startDateAfter: a.time.start - 100,
        endDateBefore: a.time.end + 100,
      })
    }
  }, [isValidating, relatedArtifacts])
  
  // Image Map values
  const [value, setValue] = useState(defaultMapValue)

  const [immersive, setImmersive] = useState(false)
  useEffect(() => {
    if (value.scale > 2 && !(immersive === '2D')) setImmersive('2D')
    if (value.scale <= 2 && (immersive === '2D')) setImmersive(false)
  }, [value])

  // Handle image loading
  const [loadingComplete, setLoadingComplete] = useState(false)

  // Handle expansion
  const [expandDescription, setExpandDescription] = useState(false)
  const [expandReferences, setExpandReferences] = useState(false)

  const averageTime = Math.round((a.time.start + a.time.end) / 2)
  const centroid = centroids.find(c => c.name === a.location.country)
  const latLng = centroid && `${centroid.latitude},${centroid.longitude}`

  // temp until 3d features are added, just to showcase the ram of Amun
  const is3D = a._id === '66880eb60da993fab0ffff8d'

  return immersive ? (
    immersive === '3D'
      ? <Immersive3D {...{ setImmersive, roundSummary }} />
      : <Immersive2D {...{ value, setValue, setImmersive, roundSummary, artifact: a }} />
  ) : (
    <div className='flex flex-col min-h-screen'>
      <div>
        <div
          className='flex flex-wrap w-full min-h-[500px] bg-black relative overflow-hidden'
          css={{
            height: is3D ? '40vh' : immersive ? '90vh' : '50vh',
          }}
          ref={ref}
        >
          {!roundSummary && <ArtifactNav artifact={a} />}

          <div css={{
            width: '100%',
            height: '100%',
            display: is3D ? 'grid' : 'block',
            gridTemplateColumns: '2fr 3fr',
            overflow: 'hidden'
          }}>
            {is3D && (
              <div css={{
                borderRight: '1px solid #ffffff55',
                position: 'relative',
              }}>
                <Artifact3D
                  url='/3D/ram-amun.glb'
                  canvasStyle={{
                    width: '100%',
                    height: '100%',
                  }}
                  scale={1}
                  cameraPosition={[5, 5, 5]}
                />
                <div className='absolute bottom-1 left-1 z-10 flex items-center'>
                  <IconButton tooltip='View Fullscreen' onClick={() => setImmersive('3D')} css={{
                    background: 'black',
                    color: 'white',
                    border: '1px solid #ffffff55',
                    '&:hover': {
                      background: '#343434',
                      color: 'white'
                    },
                    outline: 0
                  }}>
                    <BiExpand />
                  </IconButton>
                </div>
              </div>
            )}
            <div className='relative h-full'>
              {!loadingComplete && <LoadingArtifact className='absolute' />}
              <MapInteractionCSS maxScale={100} value={value} onChange={v => setValue(v)}>
                <ImageView
                  revealImage
                  imgs={a.images.external}
                  loadingComplete={loadingComplete}
                  setLoadingComplete={bounds => {
                    const h = bounds.height
      
                    if (h) {
                      if (h < windowHeight) {
                        const newY = (windowHeight - h) / 2
                        if (!loadingComplete && value.translation.y !== newY) {
                          setValue(() => ({ scale: 1, translation: { x: 0, y: newY } }))
                        }
                      } else {
                        const newScale = windowHeight / h
                        const newX = (windowWidth - (bounds.width * newScale)) / 2
                        if (!loadingComplete && value.scale !== newScale) {
                          setValue(() => ({ scale: newScale, translation: { x: newX, y: 0 } }))
                        }
                      }
                      
                      setLoadingComplete(true)
                    }
                  }}
                />
              </MapInteractionCSS>
            </div>
          </div>

          <div className='absolute pb-1 pr-1 bottom-0 left-0 z-10 flex items-end w-[fit-content]' css={{
            ...(roundSummary ? { paddingLeft: 4 } : { paddingRight: 4 })
          }}>
            <BuyMerch artifact={a} className='ml-2 mb-2' type='babel' />
            {/* <div className='flex items-center'>
              <div className='mr-1 p-[1px_6px_1.5px] rounded text-white bg-black border border-white/30'>
                {a.images.external.length} {a.images.external.length > 1 ? 'images' : 'image'}
              </div>
              <IconButton tooltip='Reset View' onClick={() => setValue(defaultMapValue)} css={{
                background: 'black',
                color: 'white',
                border: '1px solid #ffffff55',
                '&:hover': {
                  background: '#343434',
                  color: 'white'
                },
                outline: 0
              }}>
                <BiRefresh />
              </IconButton>
            </div> */}
          </div>

            <div className='absolute bottom-1 right-1 z-10 flex items-end' css={themeCSS(theme)}>
              {roundSummary}
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
                  <div className='mt-4 mb-1' css={{
                    color: 'var(--textLowOpacity)'
                  }}>
                    Description
                  </div>
                  <div className='pl-2.5 p-2 mb-6 rounded text-sm' css={{
                    background: 'var(--backgroundColorSlightlyLight)',
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

              {a?.dimensions && (
                <DetailsItemAlt mb={20} label='Dimensions' value={a?.dimensions} />
              )}

              {a.references?.length > 0 && (
                <div className='mb-6'>
                  <div className='mb-1' css={{ color: 'var(--textLowOpacity)' }}>
                    References
                  </div>
                  <div>
                    {a.references.slice(0, 4).map((ref, i) => {
                      const regex = /<i>(.*?)<\/i>/
                      const match = ref.match(regex)?.[1]

                      return (
                        <Link
                          href={`https://archive.org/search?query=${encodeURIComponent(match)}`}
                          target='_blank'
                          className='inline-flex p-2 px-3 mb-1 rounded'
                          css={{
                            background: 'var(--backgroundColorBarelyLight)',
                            '&:hover': {
                              color: 'var(--textColor)',
                              background: 'var(--backgroundColorSlightlyLight)',
                            }
                          }}
                        >
                          <div key={i} dangerouslySetInnerHTML={{ __html: ref }} />
                        </Link>
                      )
                    })}
                  </div>
                  {a.references.length > 4 && (
                    <>
                      {expandReferences && (
                        <div>
                          {a.references.slice(4).map((ref, i) => (
                            <div className='p-2 px-3 mb-1 rounded' css={{
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
            <div className='mb-1' css={{ color: 'var(--textLowOpacity)' }}>
              Source
            </div>
            <ArtifactSource source={a.source} style={{ marginBottom: 8 }} />
            <div className='mb-1 flex items-center' css={{ color: 'var(--textLowOpacity)' }}>
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
            <div className='mb-1 flex justify-end' css={{ color: 'var(--textLowOpacity)' }}>
              <a href='https://www.runningreality.org/projects/' target='_blank'>runningreality.org</a>
            </div>
            {a.wikiDataUrl && (
              <div className='mb-1' css={{ color: 'var(--textLowOpacity)' }}>
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
    </div>
  )
}

export const defaultMapValue = {
  scale: 1,
  translation: { x: 0, y: 0 }
}

// Added onImageLoaded and revealImage props for multiplayer sync
// Added onAllImagesLoaded for single-player "all loaded" signal
export const ImageView = ({
  imgs,
  setLoadingComplete, // For layout adjustments
  onError,
  onImageLoaded, // For multiplayer server emit
  revealImage, // For multiplayer server signal
  onAllImagesLoaded // For single-player signal
}) => {
  const [ref, bounds] = useMeasure()
  const [loadedCount, setLoadedCount] = useState(0)
  const [errorImgs, setErrorImgs] = useState([])
  const [imageLoadEventSent, setImageLoadEventSent] = useState(false); // Multiplayer flag
  const [allLoaded, setAllLoaded] = useState(false); // Single-player flag/state

  const renderImgs = imgs?.filter(img => !errorImgs.includes(img)) || [];
  const totalImages = renderImgs.length;

  // Reset state when images change (new round)
  useEffect(() => {
    setLoadedCount(0);
    setErrorImgs([]);
    setImageLoadEventSent(false);
    setAllLoaded(false); // Reset all loaded state
  }, [imgs]); // Dependency on imgs array reference

  // Effect to handle completion
  useEffect(() => {
    // Ensure we have images and all have attempted to load (success or error)
    if (totalImages > 0 && (loadedCount + errorImgs.length) === totalImages) {
      // Call setLoadingComplete for layout adjustments (can be called multiple times if bounds change)
      setLoadingComplete && setLoadingComplete(bounds);

      // Set internal state for single-player opacity transition
      setAllLoaded(true);
      // Call single-player callback if provided
      onAllImagesLoaded && onAllImagesLoaded();

      // Multiplayer: Only call onImageLoaded (server emit) ONCE per image set load
      if (!imageLoadEventSent) {
        onImageLoaded && onImageLoaded(); // Signal multiplayer server
        setImageLoadEventSent(true); // Prevent re-emitting
      }
    }
    // Dependencies: counts, total, bounds, callbacks
  }, [loadedCount, errorImgs.length, totalImages, bounds, setLoadingComplete, onAllImagesLoaded, onImageLoaded, imageLoadEventSent]);

  // Effect to handle all images failing
  useEffect(() => {
    if (imgs?.length > 0 && imgs.length === errorImgs.length) {
      onError && onError()
    }
  }, [imgs, errorImgs, onError])

  // Determine opacity: Use internal `allLoaded` state for single-player,
  // fallback to `revealImage` prop for multiplayer if `onAllImagesLoaded` isn't provided.
  const containerOpacity = onAllImagesLoaded ? (allLoaded ? 1 : 0) : (revealImage ? 1 : 0);

  return (
    // Apply opacity and transition to the container
    <div
      ref={ref}
      css={{
        padding: 32,
        opacity: containerOpacity,
        transition: 'opacity 0.5s ease-in-out', // Smooth transition
      }}
    >
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
              // Individual image display is handled by Masonry, hide only if error
              display: errorImgs.includes(img) ? 'none' : 'block',
              // Opacity is now handled by the parent div
            }}
            onLoad={() => setLoadedCount(l => l + 1)}
            onError={() => {
              // Avoid adding duplicates if onError fires multiple times for the same image
              setErrorImgs(ei => ei.includes(img) ? ei : [...ei, img]);
            }}
          />
        ))}
      </MasonryLayout>
    </div>
  )
}

const RelatedArtifactsTitle = ({ artifact: a }) => {
  const relatedArtifactsHref = `/artifacts?location.country=${a?.location.country}` +
    `&startDateAfter=${a.time.start - 10}&endDateBefore=${a.time.end + 10}` +
    '&imageMode=true&__noTrack'

  return (
    <div className='flex items-center'>
      <span className=' relative top-[1px]' css={{
        color: 'var(--textLowOpacity)'
      }}>
        Related Artifacts
      </span>
      <Link href={relatedArtifactsHref}>
        <IconButton tooltip='View in Artifacts DB' className='ml-2'>
          <GiAmphora />
        </IconButton>
      </Link>
    </div>
  )
}
