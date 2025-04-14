import { IconButton } from "@/components/buttons/IconButton";
import useUser from "@/hooks/useUser";
import { useForm } from "react-hook-form";
import { BiSolidSend } from "react-icons/bi";

// Receives socket instance and lobbyId as props
export const ChatInput = ({ socket, lobbyId }) => {
  const { user } = useUser();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = data => {
    if (!socket || !lobbyId || !data.message?.trim() || !user?.username) {
      console.error("Cannot send chat message: Missing socket, lobbyId, message, or username.");
      return;
    }
    socket.emit('send', {
      lobby: lobbyId,
      username: user.username, // Username is included here, backend uses it
      message: data.message.trim()
    });
    reset();
  };

  // Disable input if not connected or not in a lobby
  const isDisabled = !socket || !lobbyId;

  return (
    <form className='mt-3 flex justify-between' onSubmit={handleSubmit(onSubmit)}>
      <input
        type='text'
        placeholder='Type Message...'
        autoComplete="off"
        {...register('message', { required: true })} // Add basic validation
        disabled={isDisabled}
        css={{
          flexGrow: 1,
          opacity: isDisabled ? 0.6 : 1,
          cursor: isDisabled ? 'not-allowed' : 'text',
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
        disabled={isDisabled || isSubmitting}
        css={{
          background: 'var(--primaryColor)',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.6 : 1,
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
