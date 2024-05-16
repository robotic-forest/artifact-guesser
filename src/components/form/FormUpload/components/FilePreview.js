import { resolveFile } from 'lib/utils'
import Image from 'next/image'
import { useState } from 'react'
import { FileIcon, defaultStyles } from 'react-file-icon'

export const FilePreview = ({ file }) => {
  const [rerender, setRerender] = useState(0)
  const [loaded, setLoaded] = useState(true)

  const fileNameArray = file?.name?.split('.')
  const extension = fileNameArray[fileNameArray.length - 1]
  const isImage = file?.name && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)

  const src = file.lastModified // is it a File() ?
    ? URL.createObjectURL(file)
    // src with cachebreaker on end to recheck for image on rerender
    // see https://stackoverflow.com/questions/1077041/refresh-image-with-a-new-one-at-the-same-url
    : `${resolveFile(file.name)}?` + new Date().getTime()

  return !file?.name ? null : isImage
    ? <Image
        alt={file.name}
        src={src}
        width={32}
        height={32}
        style={{
          minWidth: 32,
          borderRadius: 4,
          textIndent: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          objectFit: 'cover',
          objectPosition: 'center',
          background: 'var(--ghostText)',
          opacity: loaded ? 1 : 0, // hide image error icon
        }}
        onError={() => {
          setLoaded(false)
          // poll if not yet uploaded
          setTimeout(() => rerender < 10 && setRerender(r => r + 1), 200)
        }}
        onLoad={() => {
          setRerender(0)
          setLoaded(true)
        }}
      />
    : <div style={{
        width: 32,
        height: 32,
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        alignItems: 'center',
        top: -2
      }}>
        <div style={{ width: 22, height: 22 }}>
          <FileIcon
            radius={5}
            gradientColor='var(--primaryColorDark)'
            color='var(--primaryColor)'
            foldColor='var(--primaryColorDark)'
            labelTextColor='#000000'
            labelColor='var(--primaryColorDark)'
            {...defaultStyles[extension]}
          />
        </div>
      </div>
}