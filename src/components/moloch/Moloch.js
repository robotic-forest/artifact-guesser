

export const Moloch = () => {

  return (
    <div className='flex flex-col items-center'>
      <img src='/babel.webp' width={350} className='rounded-lg mb-2' />

      <div className='p-3 px-5 mb-2 rounded-lg text-xl' css={{
        background: 'var(--backgroundColorSlightlyLight)'
      }}>
        <b>Feeding the capitalist machine</b> -  Supporting Artifact Guesser
      </div>

      <div className='p-2 px-4 mb-2 rounded-lg text-lg' css={{
        background: 'var(--backgroundColorBarelyLight)'
      }}>
        <b>TLDR:</b> Give me money pls.
      </div>
    </div>
  )
}