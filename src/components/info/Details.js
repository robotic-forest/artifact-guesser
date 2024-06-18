
export const DetailsDoubleItem = ({ item1, item2, s, mb = 0 }) => {

  return (
    <div css={{ marginBottom: mb, ...s }}>
      <div css={{ display: 'flex' }}>
        <div css={{ width: 'calc(50% - 8px)', marginRight: 16 }}>
          <div css={{ color: 'var(--textLowOpacity)', fontSize: '0.9em' }}>
            {item1.label}
          </div>
          <div className='text-sm' css={{
            // force wrap mid-word
            overflowWrap: 'break-word',
          }}>
            {item1.value || 'N/A'}
          </div>
        </div>
        {item2 && (
          <div css={{ width: 'calc(50% - 8px)' }}>
            <div css={{ color: 'var(--textLowOpacity)', fontSize: '0.9em' }}>
              {item2.label}
            </div>
            <div className='text-sm'>
              {item2.value || 'N/A'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const DetailsItem = ({ value, label, mb, s }) => {

  return (
    <div css={{ marginBottom: mb, ...s }}>
      <div css={{ color: 'var(--textLowOpacity)', fontSize: '0.9em' }}>
        {label}
      </div>
      <div className='text-sm' css={{ display: 'flex', flexFlow: 'row wrap' }}>
        {value || 'N/A'}
      </div>
    </div>
  )
}


export const DetailsDoubleItemAlt = ({ item1, item2, s, mb = 0 }) => {

  return (
    <div css={{ marginBottom: mb, ...s }}>
      <div css={{ display: 'flex' }}>
        <div css={{ width: 'calc(50% - 8px)', marginRight: 16 }}>
          <div css={{ color: 'var(--textLowOpacity)', marginBottom: 4 }}>
            {item1.label}
          </div>
          <div className='p-2 px-2.5 rounded text-sm w-[fit-content]' css={{
              background: 'var(--backgroundColorSlightlyLight)',
            }}>
            {item1.value || 'N/A'}
          </div>
        </div>
        {item2 && (
          <div css={{ width: 'calc(50% - 8px)' }}>
            <div css={{ color: 'var(--textLowOpacity)', marginBottom: 4 }}>
              {item2.label}
            </div>
            <div className='p-2 px-2.5 rounded text-sm w-[fit-content]' css={{
              background: 'var(--backgroundColorSlightlyLight)',
            }}>
              {item2.value || 'N/A'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const DetailsItemAlt = ({ value, label, mb, s }) => {

  return (
    <div css={{ marginBottom: mb, ...s }}>
      <div css={{ color: 'var(--textLowOpacity)', marginBottom: 4 }}>
        {label}
      </div>
      <div className='p-2 px-2.5 rounded w-[fit-content]' css={{
        background: 'var(--backgroundColorBarelyLight)',
      }}>
        {value || 'N/A'}
      </div>
    </div>
  )
}