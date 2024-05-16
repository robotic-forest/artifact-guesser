import { IconButton } from "components/Button/IconButton"
import { ConfirmDialog, Dialog } from "components/Dialog/Dialog"
import { resolveFile } from "lib/utils"
import { useState } from "react"
import { VscChromeClose } from "react-icons/vsc"
import { FilePreview } from "./FilePreview"
import { useMediaQuery } from "react-responsive"
import { GrClose } from "react-icons/gr"
import { Document } from "components/Documents/Document"

export const FileCard = ({
  file,
  isForm,
  onClose,
  title,
  style,
  confirm
}) => {
  const isMobile = useMediaQuery({ maxWidth: 499 })
  const [showDelete, setShowDelete] = useState(false)
  const [fileVisible, setFileVisible] = useState(false)

  return (
    <>
      <Dialog
        visible={fileVisible}
        closeDialog={() => setFileVisible(false)}
        contentStyle={{
          width: isMobile ? '95vw' : '80vw',
        }}
      >
        <div css={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
          position: 'relative',
          top: -6,
        }}>
          <b>{title || file?.name.slice(37)}</b>
          <IconButton
            style={{ right: -6 }}
            onClick={() => setFileVisible(false)}
          >
            <GrClose />
          </IconButton>
        </div>
        <Document
          uri={resolveFile(file?.name)}
          mimetype={file?.type}
          docHeight={isMobile ? '85vh' : '80vh'}
        />
      </Dialog>
      <ConfirmDialog
        visible={showDelete}
        closeDialog={() => setShowDelete(false)}
        msg='Are you sure you want to delete this file?'
        confirmText='Delete File'
        onConfirm={() => {
          onClose()
          setShowDelete(false)
        }}
        confirmColor='#ef7e7e'
      />
      <div
        css={{
          maxWidth: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: 5,
          border: '1px solid var(--textVeryLowOpacity)',
          boxShadow:' 0px 2px 6px -1px var(--textSuperLowOpacity)',
          borderRadius: 8,
          width: 'fit-content',
          margin: '0 8px 8px 0',
          background: 'var(--backgroundColor)',
          cursor: isForm ? 'default' : 'pointer',
          '&:hover': {
            background: isForm ? 'none' : 'var(--textSuperLowOpacity)',
          },
          ...style
        }}
        onClick={() => {
          if (isForm) return

          if (file?.type.includes('pdf')) {
            window.open(resolveFile(file?.name), '_blank')
          } else setFileVisible(true)
        }}
      >
        <FilePreview file={file} />
        <div css={{
          marginLeft: 10,
          marginRight: isForm ? 2 : 8,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          lineHeight: '1.3em',
          textOverflow: 'ellipsis'
        }}>
          {title || file.name.slice(37)}
        </div>
        {isForm && (
          <IconButton
            size={22}
            type='button'
            onClick={confirm ? () => setShowDelete(true) : onClose}
            style={{
              marginLeft: 8,
              top: 1,
            }}
          >
            <VscChromeClose />
          </IconButton>
        )}
      </div>
    </>
  )
} 