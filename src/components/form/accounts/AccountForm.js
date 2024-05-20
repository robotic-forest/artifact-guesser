import { useFormContext } from "react-hook-form"
import { IoChevronBack } from "react-icons/io5"
import { useRouter } from "next/router"
import { delabelize } from "@/lib/utils"
import { IconButton } from "@/components/buttons/IconButton"
import { FormBody, FormInput, FormSelect } from "../Form"
import { Button } from "@/components/buttons/Button"
import useUser from "@/hooks/useUser"

export const AccountForm = ({
  title,
  submitText,
  onSubmit,
  onSubmitError,
  onBackClick
}) => {
  const { isAdmin } = useUser()
  const router = useRouter()
  const { handleSubmit, watch } = useFormContext()
  const values = delabelize(watch())

  return (
    <form onSubmit={handleSubmit(onSubmit, onSubmitError)} css={{  }}>
      <div css={{
        display: 'flex',
        marginBottom: '3em',
        alignItems: 'center',
      }}>
        {((process.browser && window.history.length > 1) || onBackClick || values?._id) && (
          <IconButton
            size={24}
            css={{ marginRight: 8 }}
            onClick={() => { 
              onBackClick
                ? onBackClick()
                : process.browser && window.history.length > 1
                  ? router.back() 
                  : router.push(`/accounts/${values._id}`)
            }}
          >
            <IoChevronBack />
          </IconButton>
        )}
        <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.3em' }}>{title}</h3>
      </div>
      <div style={{
        marginBottom: 16,
        paddingBottom: 32,
      }}>
        <FormBody>
          <FormInput
            label='First Name'
            name='firstName'
            required
          />
          <FormInput
            label='Last Name'
            name='lastName'
            required
          />
        </FormBody>
        <FormBody>
          <FormInput
            label='Email'
            name='email'
            required
          />
          <FormInput
            label='Phone'
            name='phone'
          />
        </FormBody>
        <FormBody style={{ margin: '16px 0 0 0' }}>
          <FormSelect
            label='Role'
            name='role'
            options={['Admin', 'Player'].filter(role => !isAdmin ? role !== 'Admin' : true)}
            required
          />
          <FormSelect
            label='Status'
            name='status'
            options={['Active', 'Banned']}
          />
        </FormBody>

        <div css={{
          width: '100%',
          paddingTop: '2em',
          marginBottom: 48
        }}>
          <Button
            type='submit'
            variant='outlined'
            css={{ float: 'right', width: 300, marginTop: 10 }}
          >
            {submitText}
          </Button>
        </div>
      </div>
    </form>
  )
}