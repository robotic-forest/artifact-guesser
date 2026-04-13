import useUser from "@/hooks/useUser"
import { AiFillDelete } from "react-icons/ai"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useRouter } from "next/router"
import { loginAsUser } from "@/pages/accounts"
import { FiLogIn } from "react-icons/fi"
import { useAccount } from "@/hooks/accounts/useAccount"
import { IconButton } from "../buttons/IconButton"
import { useConfirmation } from "../dialogs/Dialog"

export const AccountActions = () => {
  const { account } = useAccount()
  const { user, isAdmin } = useUser()
  const confirm = useConfirmation()
  const router = useRouter()

  const disabled = !user || (user._id === account?._id || account?.role === 'Admin')

  return !isAdmin ? null : (
    <div className='flex items-center gap-2'>
      {user?.role === 'Admin' && account?._id !== user?._id && (
        <IconButton
          size={22}
          tooltip='Log in as user'
          onClick={() => loginAsUser({ account, router })}
        >
          <FiLogIn />
        </IconButton>
      )}
      <IconButton
        size={22}
        tooltip='Delete account'
        disabled={disabled}
        onClick={async () => {
          const ok = await confirm({
            title: 'Are you sure you want to delete this account?',
            confirmText: 'Destroy! Terminate! Banish to the shadow realm!',
            confirmColor: 'red',
            noCancel: true
          })

          if (ok) {
            const { data: res } = await axios.post('/api/accounts/delete', { _id: account?._id })
            if (res?.success) {
              toast.success('Account deleted successfully.')
              router.push(`/accounts`)
            } else toast.error(res.message)
          }
        }}
        css={{
          '&:hover': { background: disabled ? undefined : '#ff4f4f33' },
        }}
      >
        <AiFillDelete color={disabled ? undefined : '#ff4f4f'} />
      </IconButton>
    </div>
  )
}
