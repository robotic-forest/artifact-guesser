import useUser from "@/hooks/useUser"
import { AiFillDelete } from "react-icons/ai"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useRouter } from "next/router"
import { loginAsUser } from "@/pages/accounts"
import { FiLogIn } from "react-icons/fi"
import { useAccount } from "@/hooks/accounts/useAccount"
import { IconButton } from "../buttons/IconButton"
import { Button } from "../buttons/Button"
import { useConfirmation } from "../dialogs/Dialog"

export const AccountActions = () => {
  const { account } = useAccount()
  const { user, isAdmin } = useUser()
  const confirm = useConfirmation()
  const router = useRouter()

  /* Rules:
    Cannot delete yourself
    Cannot delete owner
    Cannot delete admin if you are not an owner
  */
  const disabled = !user || (user._id === account?._id || account?.role === 'Admin')

  return !isAdmin ? null : (
    <Actions>
      {user?.role === 'Admin' && account?._id !== user?._id && (
        <IconButton
          size={22}
          tooltip='Log in as user'
          onClick={() => loginAsUser({ account, router })}
          css={{
            marginRight: 10
          }}
        >
          <FiLogIn />
        </IconButton>
      )}
      <Button
        variant='outlined'
        small
        disable={disabled}
        disabled={disabled}
        onClick={async () => {
          const ok = await confirm({
            title: 'Are you sure?',
            description: 'Are you sure you want to delete this account?',
            confirmText: 'Delete',
          })

          if (ok) {
            const { data: res } = await axios.post('/api/accounts/delete', { _id: account?._id })
            if (res?.success) {
              toast.success('Account deleted successfully.')
              router.push(`/accounts`)
            } else toast.error(res.message)
          }
        }}
      >
        <AiFillDelete css={{ marginRight: 6 }} size={14}  color={disabled ? null : '#ff7d7d'} />
        Delete Account
      </Button>
    </Actions>
  )
}

export const Actions = ({
  children,
  style
}) => {
  return (
    <div css={{
      width: '100%',
      ...style
    }}>
      <div css={{
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'flex-end',
        alignItems: 'center',
        background: 'var(--textSuperLowOpacity)',
        borderRadius: 10,
        padding: 10,
        width: '100%'
      }}>
        {children}
      </div>
    </div>
  )
}