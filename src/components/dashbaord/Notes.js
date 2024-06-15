import { themeCSS } from "../GlobalStyles"

export const notesTheme = {
  backgroundColor: '#b8b8b8',
  primaryColor: '#b8b8b8',
  textColor: '#000000',
}

export const Notes = () => {

  return (
    <div css={themeCSS(notesTheme)}>
      <div className='opacity-50 mb-1 text-xs'>
        Notes
      </div>
      <div className='mb-2 text-xs' css={{
        background: 'var(--backgroundColorBarelyLight)',
        border: '1.5px inset',
        borderColor: '#00000055 #ffffff77 #ffffff77 #00000055',
      }}>
        <div className='p-3'>
          <div>
            <b>Artifact Page as a info aggregator?</b> links to wiki, articles, reddit threads

            <div className='ml-6'>
              People can link reddit discussion threads.<br/>
              When someone else views the page, they are asked to verify information.
            </div>
          </div>

          <div className='mb-2'>
            What can be done to make AG something that suports r/ArtefactPorn
          </div>
        </div>
      </div>
    </div>
  )
}
