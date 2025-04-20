import { IconButton } from "@/components/buttons/IconButton";
import useUser from "@/hooks/useUser";
import { useForm } from "react-hook-form";
import { BiSolidSend } from "react-icons/bi";

// Receives socket instance, lobbyId, and optional readOnly prop
export const ChatInput = ({ socket, lobbyId, readOnly }) => {
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

  // Determine base disabled state (connection/lobby)
  const isConnectionDisabled = !socket || !lobbyId;
  // Determine effective disabled state (includes readOnly) for styling and button
  const isEffectivelyDisabled = isConnectionDisabled || readOnly;

  return (
    <form className='mt-3 flex justify-between' onSubmit={handleSubmit(onSubmit)}>
      <input
        type='text'
        placeholder='Type Message...'
        autoComplete="off"
        {...register('message', { required: true })} // Add basic validation
        readOnly={readOnly} // Use readOnly to prevent typing but allow clicks
        css={{
          flexGrow: 1,
          opacity: isEffectivelyDisabled ? 0.6 : 1, // Style based on effective disabled state
          cursor: isEffectivelyDisabled ? 'not-allowed' : 'text', // Style based on effective disabled state
          background: isEffectivelyDisabled ? 'var(--backgroundColorDark)' : 'var(--backgroundColorSlightlyLight)', // Style based on effective disabled state
          marginRight: 8,
          padding: '4px 8px',
          outline: 'none',
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
        disabled={isEffectivelyDisabled || isSubmitting} // Disable button based on effective state
        css={{
          background: isEffectivelyDisabled ? 'var(--backgroundColorDark)' : 'var(--primaryColor)', // Style based on effective disabled state
          cursor: isEffectivelyDisabled ? 'not-allowed' : 'pointer', // Style based on effective disabled state
          opacity: isEffectivelyDisabled ? 0.6 : 1, // Style based on effective disabled state
          '&:hover': {
            background: isEffectivelyDisabled ? 'var(--backgroundColorDark)' : 'var(--primaryColorLight)', // Style based on effective disabled state
            boxShadow: 'none',
          }
        }}
      >
        <BiSolidSend />
      </IconButton>
    </form>
  )
}
