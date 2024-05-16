import React, { useRef, useState } from 'react'
import { Button } from 'components/Button/Button'
import { useFormContext } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { FileCard } from './components/FileCard'
import { FormError, resolveRequired } from '../Form'
import { get } from 'lodash'

/* Uploads files and saves references to them in the form of
  {
    name: string
    type: string
    size: number
    new: boolean
    height: number
    width: number
  }
*/

export const FormUpload = ({
  uploadProps,
  title: t,
  style,
  accept,
  single,
  name,
  required,
  label
}) => {
  const title = label || t
  const { setValue, watch, register, formState: { errors } } = useFormContext()
  const {
    files,
    totalSize,
    handleDragDropEvent,
    setFiles,
    removeFile,
  } = uploadProps

  const inputRef = useRef()
  const [dragHover, setDragHover] = useState(false)
  const formFiles = watch(name)

  register(name, resolveRequired(required))

  const updateFiles = async e => {
    setFiles(e, 'a')
    
    const files = Array.from(e.target.files || e.dataTransfer.files)
    let newFiles = []
    for (const file of files) {
      Object.defineProperty(file, 'name', {
        writable: true,
        value: `${uuidv4()}-${file.name}`
      })
  
      const dimensions = file.type.slice(0, 5) === 'image'
        ? await getHeightAndWidthFromDataUrl(URL.createObjectURL(file))
        : false
  
      const newFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        new: true
      }

      if (formFiles && !Array.isArray(formFiles) && !formFiles.new) {
        newFile.deleteOld = formFiles.name
      }
  
      if (dimensions) {
        newFile.height = dimensions.height
        newFile.width = dimensions.width
      }
  
      newFiles.push(newFile)
    }
  
    const newValue = single
      ? newFiles[0]
      : [ ...(formFiles || []), ...newFiles ]
  
    setValue(name, newValue)
  }

  // only show files associated with the specified form field
  const formFileNames = formFiles && (
    Array.isArray(formFiles)
      ? formFiles.map(f => f.name)
      : [formFiles.name]
  )
  const renderedFiles = formFiles ? [
    // populate with newly added files
    ...files.filter(f => formFileNames.includes(f.name)),
    // Populate with already uploaded files
    ...(Array.isArray(formFiles)
      ? formFiles.filter(f => !f.new && !f.delete)
      : ((!formFiles.new && !formFiles.delete) ? [formFiles] : []))
  ] : []

  const error = errors && get(errors, name)

  return (
    <div css={{ marginTop: '1em', ...style }}>
      {title && <div css={{ marginBottom: 10, fontWeight: 500 }}>{title}</div>}
      <div>
        {/* Display the files to be uploaded */}
        <div css={{
          display: 'flex',
          flexFlow: 'row wrap'
        }}>
          {renderedFiles.map(file => (
            <FileCard
              key={file.name}
              file={file}
              isForm
              confirm
              onClose={() => {
                setValue(
                  name,
                  Array.isArray(formFiles)
                    ? formFiles
                        // if file is not yet uploaded, filter it
                        .filter(ff => !(ff.new && ff.name === file.name))
                        // if previously uploaded, flag for deletion
                        .map(ff => ff.name === file.name ? { ...ff, delete: true } : ff)
                    : formFiles.new
                      ? undefined // if !uploaded, clear
                      : { ...formFiles, delete: true } // else flag
                )

                removeFile(file.name)
              }}
            />
          ))}
        </div>
        <div>
          {renderedFiles.length > 0 && (
            <div css={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 10
            }}>
              <div css={{ position: 'relative', top: 4 }}>
                Total Size: {totalSize}
              </div>
            </div>
          )}
        </div>

        {/* Provide a drop zone and an alternative button inside it to upload files. */}
        <div
          onDragEnter={e => {
            setDragHover(true)
            handleDragDropEvent(e)
          }}
          onDragLeave={e => setDragHover(false)}
          onDragOver={handleDragDropEvent}
          onDrop={e => {
            handleDragDropEvent(e)
            updateFiles(e)
            setDragHover(false)
          }}
          css={{
            border: `1px solid ${error ? 'red' : 'var(--textSuperLowOpacity)'}`,
            boxShadow: error ? 'inset 0 0 0 5px #ffe1e1' : 'none',
            background: dragHover ? 'var(--textSuperLowOpacity)' : 'var(--ghostText)',
            borderRadius: 'var(--br)',
            padding: 16,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div css={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ marginBottom: 10 }}>
              Drag and drop file{single ? '' : 's'} here or
            </div>
            <Button variant='outlined' onClick={() => inputRef.current.click()}>
              Select file{single ? '' : 's'} to upload
            </Button>
          </div>

          {/* Hide the crappy looking default HTML input */}
          <input
            ref={inputRef}
            type="file"
            multiple={!single}
            accept={accept}
            style={{ display: 'none' }}
            onChange={async (e) => {
              updateFiles(e)
              inputRef.current.value = null;
            }}
          />
        </div>
      </div>
      {error?.message && (
        <FormError style={{ top: 5 }}>
          {error.message}
        </FormError>
      )}
    </div>
  );
}

export const getHeightAndWidthFromDataUrl = dataURL => new Promise(resolve => {
  const img = new Image()
  img.onload = () => {
    resolve({
      height: img.height,
      width: img.width
    })
  }
  img.src = dataURL
})