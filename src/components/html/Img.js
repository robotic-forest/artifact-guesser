import { ImageViewDialog } from "@/components/dialogs/ImageDialog"
import { useState } from "react"

export const Img = ({ src, source, alt, ...p }) => {
  const [imageView, setImageView] = useState(false)
  const [errored, setErrored] = useState(false)

  if (errored) return null

  return (
    <>
      <ImageViewDialog
        closeDialog={() => setImageView(false)}
        visible={imageView}
        image={imageView}
      />
      <img
        src={src}
        alt={alt}
        css={{ cursor: 'pointer' }}
        onClick={() => setImageView(src)}
        onError={() => setErrored(true)}
        {...p}
      />
    </>
  )
}
