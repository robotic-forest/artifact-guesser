import styled from "@emotion/styled"
import { useEffect, useState } from "react"
import { MapInteractionCSS } from 'react-map-interaction'
import { Dialog } from "./Dialog"
import useWindowDimensions from "@/hooks/useWindowDimensions"

export const ImageViewDialog = ({ closeDialog, visible, title, image, bg, text, options, links }) => {
  const { height, width } = useWindowDimensions()
  const [dimensions, setDimensions] = useState()
  const [readMore, setReadMore] = useState(false)
  const [value, setValue] = useState()

  useEffect(() => {
    if (visible && dimensions && height && width && !value) {
      setValue({
        scale: 1,
        translation: {
          x: (width - dimensions.width) / 2,
          y: (height - dimensions.height) / 2
        }
      })
    }
  }, [visible, dimensions, height, width])

  return !visible ? null : (
    <Dialog
      title={null}
      width='95vw'
      height='90vh'
      visible={visible}
      closeDialog={closeDialog}
      fullScreen
    >
      <ExpandedStyles style={{ background: bg, color: text, opacity: value ? 1 : 0 }}>
        <MapInteractionCSS value={value} onChange={v => setValue(v)} maxScale={100}>
          <img
            alt={title} src={image}
            onLoad={({ target: img }) => {
              setDimensions({ height: img.offsetHeight, width: img.offsetWidth })
            }}
          />
        </MapInteractionCSS>
        {options?.show_meta && (
          <div className='meta-information-left'>
            {options.title && (
              <div
                style={{
                  marginBottom: options.description ? 4 : 0,
                  fontSize: '0.95em'
                }}
              >
                  <b>{options.title}</b>
              </div>
            )}
            {options.description && (
              <div>
                <span style={{ marginRight: 10 }}>
                  {(!readMore && options.description.length > 160)
                    ? options.description.slice(0, 150) + '...'
                    : options.description
                  }
                </span>
                {options.description.length > 160 && (
                  <a
                    style={{
                      fontSize: '0.9em',
                      textDecoration: 'underline',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => setReadMore(rm => !rm)}
                  >
                    <AiFillRead style={{ position: 'relative', top: 2, marginRight: 5 }} />
                    {readMore ? 'Read less' : 'Read more'}
                  </a>
                )}
              </div>
            )}
            {/* {links?.length > 0 && (
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: '0.8em', fontWeight: 600 }}>Sources</div>
                {links.map(link => <ExpandedImageLink link={link} />)}
              </div>
            )} */}
            <div style={{ marginTop: 4, fontSize: '0.8em' }}>
              {dimensions && (
                <>
                  <b>H</b> {dimensions.height}px <b>W</b> {dimensions.width}px
                </>
              )}
            </div>
          </div>
        )}
      </ExpandedStyles>
    </Dialog>
  )
}

export const ExpandedStyles = styled.div`
  position: relative;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  min-height: stretch;

  .meta-information-left {
    position: fixed;
    bottom: 10px;
    left: 10px;

    padding: 6px;
    background: var(--backgroundColor);
    border-radius: 8px;
    border: 1px solid var(--textVeryLowOpacity);

    max-width: 400px;
    @media(max-width: 499px) {
      max-width: calc(100vw - 20px);
    }
  }

  .instructions {
    position: fixed;
    width: 100%;
    display: flex;
    justify-content: center;
    color: var(--textColor);

    bottom: -100px;
    animation: delay-move 10s;
    @keyframes delay-move {
      0%   { bottom: 20px }
      99% { bottom: 20px; }
      100% { bottom: -100px }
    }

    & > div {
      text-transform: uppercase;
      font-size: 0.9em;
      border: 1px solid var(--textSuperLowOpacity);
      background: var(--backgroundColor);
      padding: 4px 14px 4px 14px;
      width: fit-content;
      border-radius: 30px;
      box-shadow: 0px 0px 10px -3px black;

      opacity: 0;
      animation: delay-fade 10s;
      @keyframes delay-fade {
        0%   { opacity: 1 }
        70%  { opacity: 1 }
        99% { opacity: 0 }
        100% { opacity: 0; bottom: -100px  }
      }
    }
  }

  @media (max-width: 500px), (min-aspect-ratio: 16/9) {
    width: 100%;
    min-height: 120vh;
    min-height: stretch;
    border-radius: 0;
  }
`