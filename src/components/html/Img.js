import { ImageViewDialog } from "@/components/dialogs/ImageDialog"
import { useState } from "react"

export const Img = ({ src, source, ...p }) => {
  const [imageView, setImageView] = useState(false)

  return (
    <>
      <ImageViewDialog
        closeDialog={() => setImageView(false)}
        visible={imageView}
        image={imageView}
      />
      <img
        src={src}
        css={{ cursor: 'pointer' }}
        onClick={() => setImageView(src)}
        {...p}
      />
    </>
  )
}