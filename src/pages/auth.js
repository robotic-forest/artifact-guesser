import { FormProvider, useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Form, FormInput } from '@/components/form/Form'
import { Button } from '@/components/buttons/Button'

export default function Auth() {
  const router = useRouter()

  if (router.query) {
    const { user, token } = router.query
    return <ResetPassword id={user} token={token} />
  } else return null
}

const ResetPassword = ({ id, token }) => {
  const router = useRouter()
  const formProps = useForm()
  const { handleSubmit, watch } = formProps
  const newPassword = watch('newPassword')

  const submit = async (data, e) => {
    e.preventDefault() // prevent submit on clicking enter
    const { data: res } = await axios.post('/api/new-password', { newPassword: data.newPassword, id, token })
    if (res?.success) {
      toast('Password updated successfully.')
      router.push('/')
    } else toast.error(res.message)
  }

  return (
    <FormProvider {...formProps}>
      <div css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 80
      }}>
        <div css={{ marginBottom: 8, fontSize: '1.4em', margin: '1.5em 0 1em 0' }}>Create New Password</div>
        <Form
          onSubmit={handleSubmit(submit)}
          style={{
            width: 400,
            maxWidth: 'calc(100vw - 20px)',
            border: '1px solid var(--textVeryLowOpacity)',
            borderRadius: 'var(--br)',
            padding: '24px 10px 10px 10px'
          }}
        >
          <FormInput
            type='password'
            label='Enter New Password'
            autoComplete='off'
            name='newPassword'
            required={{
              minLength: {
                value: 8,
                message: "Password must have at least 8 characters"
              }
            }}
          />
          <FormInput
            type='password'
            label='Repeat New Password'
            autoComplete='off'
            name='repeatPassword'
            required={{
              validate: value => value === newPassword || 'The passwords do not match'
            }}
          />
          <Button
            type='submit'
            style={{ margin: '5px 0 0 auto' }}
          >
            Set Password
          </Button>
        </Form>
      </div>
    </FormProvider>
  )
}