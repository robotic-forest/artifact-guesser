import { useState } from 'react'
import axios from 'axios'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Spinner } from '@/components/loading/Spinner'
import { Form, FormInput } from '@/components/form/Form'
import { Button } from '@/components/buttons/Button'
import { Dialog } from './Dialog'
import useUser from '@/hooks/useUser'

export const SignupDialog = ({ open, onClose }) => {
  const { refetch } = useUser()
  const formProps = useForm()
  const { handleSubmit } = formProps
  const [processing, setProcessing] = useState(false)

  const newPassword = formProps.watch('password')

  const onSubmit = async data => {
    if (processing) return
    setProcessing(true)

    try {
      const { data: res } = await axios.post('/api/signup', data)
      if (res?.success) {
        toast.success('Signed up successfully.')
        refetch()
        onClose()
      } else toast.error((res?.message && typeof res.message === 'string') ? res.message : 'An error occurred.')
    } catch (e) { console.log({ e }) }

    setProcessing(false)
  }

  return (
    <Dialog
      title='Sign Up'
      width='400px'
      visible={open}
      closeDialog={onClose}
    >
      <FormProvider {...formProps}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            label='Email'
            name='email'
            type='email'
            autoComplete='off'
            required
            style={{ marginTop: '1em' }}
            spellCheck={false}
          />
          <FormInput
            label='Username'
            name='username'
            type='username'
            autoComplete='off'
            required={{
              pattern: {
                value: /^[a-z0-9]*$/,
                message: "Only lowercase alphanumeric allowed."
              },
              maxLength: {
                value: 12,
                message: "Must have 12 or less characters"
              }
            }}
          />
          <div css={{ fontSize: '0.8em', marginBottom: '1em', position: 'relative', top: -8 }}>
            Only lowercase letters and numbers allowed. Max 12 characters.
          </div>
          <FormInput
            type='password'
            label='Password'
            autoComplete='off'
            name='password'
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
            required={{ validate: value => value === newPassword || 'The passwords do not match' }}
          />
          <span css={{ marginLeft: 'auto', marginTop: 5 }}>
            <Button id='login' type='submit' variant='relief' disabled={processing} css={{ minWidth: 70 }}>
              {processing ? <span><Spinner />Signing up...</span> : 'Sign up'}
            </Button>
          </span>
        </Form>
      </FormProvider>
    </Dialog>
  )
}

