
export const Simulator = ({ className, top, bottom }) => {

  return (
    <div className={className}>
      <div className="bg-[url('/mayan-glyphs.png')] bg-[length:88.3px_84px]
       p-4 px-5 rounded" css={{
        boxShadow: '3px 2px 4px 0 #ffffff99 inset, -2px -1px 3px 0 #000000bb inset',
      }}>
        <div className="bg-[url('/mayan-glyphs.png')] bg-[length:161px_114px] bg-[top_left_-5px]
          flex justify-between w-full"
        >
          <div className="bg-black rounded text-sm flex" css={{
            boxShadow: '3px 2px 4px 0 #ffffff99, -2px -1px 2px 0 #00000099',
            zIndex: 1,
            '@media(max-width: 500px)': {
              minWidth: 'auto'
            }
          }}>
            <div className='py-1 px-2 border-r border-white/40' css={{
              '@media(max-width: 500px)': {
                display: 'none'
              }
            }}>
              Artifact Guesser Score Calculator
            </div>
            <div className='py-1 px-2 inline-flex items-center'>
              Game State:
              <div className={`w-3 h-3 rounded-full mx-2`} css={{ background: '#00ff00' }} />
              Completed
            </div>
          </div>

          <div className="bg-black rounded text-sm flex" css={{
            boxShadow: '3px 2px 4px 0 #ffffff99, -2px -1px 2px 0 #00000099',
            zIndex: 1,
            '@media(max-width: 500px)': {
              minWidth: 'auto'
            }
          }}>
            <div className='py-1 px-2 border-r border-white/40' css={{
              '@media(max-width: 500px)': {
                display: 'none'
              }
            }}>
              XibalbaOS
            </div>
            <div className='py-1 px-2 inline-flex items-center'>
              v0.465.8
            </div>
          </div>
        </div>
        <div className="mt-4 rounded text-sm min-w-[300px] p-2" css={{
          boxShadow: '3px 2px 4px 0 #ffffff99, -2px -1px 2px 0 #00000099',
          background: 'linear-gradient(0deg, #000000, #000000dd)',
          zIndex: 1
        }}>
          {top}
        </div>
        <div className="mt-5 rounded text-sm min-w-[300px] p-2" css={{
          boxShadow: '3px 2px 4px 0 #ffffff99, -2px -1px 2px 0 #00000099',
          background: 'linear-gradient(0deg, #000000, #000000dd)',
          zIndex: 1
        }}>
          {bottom}
        </div>
      </div>
    </div>      
  )
}

export const SimulatorButton = p => {

  return (
    <button
      className=" bg-[#ac9a8c] text-black text-lg py-1 px-4 border-white ml-6"
      css={{
        // boxShadow: '1px 1px 1px 0px #ffffff55 inset, -1px -1px 1px 0 #00000055 inset',
        border: '3px outset',
        borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
        '&:hover': {
          filter: 'brightness(1.2)',
          borderColor: '#ffffffaa #000000aa #000000aa #ffffffaa',
        },
      }}
      {...p}
    />
  )
}