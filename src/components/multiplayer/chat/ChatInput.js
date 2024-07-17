import { IconButton } from "@/components/buttons/IconButton"
import { useQuery } from "@/hooks/useQuery"
import useUser from "@/hooks/useUser"
import { socket } from "@/pages/_app"
import { useForm } from "react-hook-form"
import { BiSolidSend } from "react-icons/bi"

export const ChatInput = () => {
  const { user } = useUser()
  const { register, handleSubmit, reset } = useForm()
  const { query } = useQuery()
  const lobby = query.lobby

  const onSubmit = data => {
    socket.emit('send', {
      lobby,
      username: user.username,
      message: data.message
    })
    reset()
  }

  return (
    <form className='mt-3 flex justify-between' onSubmit={handleSubmit(onSubmit)}>
      <input
        type='text'
        placeholder='Type Message...'
        autoComplete="off"
        {...register('message')}
        css={{
          flexGrow: 1,
          marginRight: 8,
          padding: '4px 8px',
          outline: 'none',
          background: 'var(--backgroundColorSlightlyLight)',
          borderRadius: 5,
          transition: 'all 0.2s ease-in-out',
          '&:focus': {
            background: 'var(--backgroundColorLight)',
            boxShadow: '0 2px 5px 0px var(--textSuperLowOpacity)'
          },
          '&:hover': {
            background: 'var(--backgroundColorLight)',
            boxShadow: '0 2px 5px 0px var(--textSuperLowOpacity)'
          },
          '::placeholder': {
            color: 'var(--textLowOpacity)',
          }
        }}
      />
      <IconButton
        size={32}
        tooltip='Send'
        type='submit'
        css={{
          background: 'var(--primaryColor)',
          '&:hover': {
            background: 'var(--primaryColorLight)',
            boxShadow: 'none',
          }
        }}
      >
        <BiSolidSend />
      </IconButton>
    </form>
  )
}