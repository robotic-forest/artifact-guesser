import { GiGreekSphinx, GiWaxTablet } from "react-icons/gi"
import { Button } from "../buttons/Button"
import { BiRefresh } from "react-icons/bi"
import { IconButton } from "../buttons/IconButton"
import { ModeButton } from "../gameui/ModeButton"

export const Options = ({ clients }) => {
  const mode = 'Classic'
  const enoughPlayersPresent = clients?.length >= 2

  return (
    <div css={{
      background: 'var(--backgroundColorBarelyLight)',
      border: '1px outset',
      borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
    }}>
      <div className='p-3 pb-2 flex items-center justify-between'>
        <div className='flex items-center'>
          <GiWaxTablet className='mr-2 scale-x-[-1]' />
          Game Options
        </div>
      </div>

      <div className='mt-3 p-3'>
        <div>
          <div className='text-sm mb-2'>
            Mode
          </div>
          <div className='p-2 text-sm flex items-center justify-between' css={{
            background: 'var(--backgroundColorSlightlyLight)',
            borderRadius: 6
          }}>
            <ModeButton mode={mode} css={{
              padding: '6px 10px',
              cursor: 'default',
              '&:hover': {
                filter: 'brightness(1)',
              }
            }} />
            <IconButton
              size={28}
              tooltip='Change Mode'
              tooltipPlace='left'
              css={{
                marginRight: 14,
                background: 'var(--backgroundColorLight)',
                '&:hover': {
                  background: 'var(--backgroundColorLight)',
                  filter: 'brightness(1.1)',
                }
              }}
            >
              <BiRefresh />
            </IconButton>
          </div>
        </div>

        <div className='mt-4'>
          <div className='text-sm mb-2'>
            Time
          </div>
          <div className='p-2 text-sm flex' css={{
            background: 'var(--backgroundColorSlightlyLight)',
          }}>
            <TimeButton css={{
              background: 'var(--primaryColor)',
              '&:hover': {
                background: 'var(--primaryColor)',
                cursor: 'default',
              },
            }}>
              1:00
            </TimeButton>
            <TimeButton>
              2:00
            </TimeButton>
            <TimeButton>
              0:30
            </TimeButton>
            <TimeButton>
              0:10
            </TimeButton>
          </div>
        </div>
      </div>

      <div className='mt-6 p-3 flex justify-between items-end'>
        <div className='text-sm' css={{ color: 'var(--textLowOpacity)' }}>
          {enoughPlayersPresent ? 'Ready to start.' : 'Waiting for at least 1 more player to join...'}
        </div>
        <Button variant='outlined' disable={!enoughPlayersPresent} css={{
          background:  enoughPlayersPresent ? 'var(--primaryColor)' : 'var(--backgroundColor)',
          '&:hover': {
            background: enoughPlayersPresent ? 'var(--primaryColorLight)' : 'var(--backgroundColor)',
            boxShadow: 'none',
          },
          border: enoughPlayersPresent ? '1px outset' : 'none',
          borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
          boxShadow: 'none',
          borderRadius: 0
        }}>
          <GiGreekSphinx className ='mr-3 text-sm' />
          Start Game
        </Button>
      </div>
    </div>
  )
}

const TimeButton = ({ css, ...p }) => 
  <Button
    variant='outlined'
    css={{
      background: 'var(--backgroundColorBarelyLight)',
      '&:hover': {
        background: 'var(--backgroundColorLight)',
        boxShadow: 'none',
      },
      border: '1px outset',
      borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
      boxShadow: 'none',
      borderRadius: 0,
      marginRight: 4,
      ...css
    }}
    {...p}
  />