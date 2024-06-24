import { MolochButton } from "@/components/buttons/MolochButton"

export const PrimaryAsk = () => {
  return (
    <div className='pt-6 p-3 flex flex-wrap items-center'>
      <div className='pr-6 max-w-[800px]'>
        <div className='pt-3'>
          Artifact Guesser is a labor of love, and its aim is not monetary. <b>The basic game will always be free and available without login.</b>{' '}
          Its purpose is to create a fun way to learn about history that is accessible to all.
        </div>
        <div className='mt-3 p-2 px-3 rounded-lg' css={{
          background: 'var(--backgroundColorBarelyLight)',
        }}>
          But sadly, I can't escape the capitalist world we are living in. <b>I can only occasionally carve out time from my daily work for this project. 😢</b>{' '}
         <div>
          However, with your support, I can increase that time, and cover hosting costs! 🎉
         </div>
        </div>
        <div className='pt-3 text-sm float-right'>
          <a href='#plans'>
            <MolochButton>
              View Plans
            </MolochButton>
          </a>
        </div>
      </div>
      {/* <div className='flex flex-col items-center'>
        <img src='/babel.webp' className='rounded mb-1 w-[264px] min-w-[264px]' />
        <div className='text-xs text-center'>
          None can escape the capitalist machine.
        </div>
      </div> */}
    </div>
  )
}