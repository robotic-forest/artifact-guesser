import { useState } from 'react'
import axios from 'axios'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Spinner } from '@/components/loading/Spinner'
import { Form, FormInput } from '@/components/form/Form'
import { Button } from '@/components/buttons/Button'
import { Dialog } from './Dialog'
import useUser from '@/hooks/useUser'

export const LoginDialog = ({ open, onClose }) => {
  const { refetch } = useUser()
  const formProps = useForm()
  const { handleSubmit, unregister, reset } = formProps
  const [resettingPassword, setResettingPassword] = useState(false)
  const [processing, setProcessing] = useState(false)

  const login = async data => {
    setProcessing(true)
    try {
      const { data: res } = await axios.post('/api/login', data)
      if (res?.success) {
        toast.success('Logged in successfully.')
        refetch()
        onClose()
      } else toast.error((res?.message && typeof res.message === 'string') ? res.message : 'An error occurred.')
    } catch (e) { console.log({ e }) }

    setProcessing(false)
  }

  const resetPassword = async (data, e) => {
    e.preventDefault() // prevent submit on clicking enter
    const { data: res } = await axios.post('/api/reset-password-email', data)
    if (res?.success) {
      toast.success('Reset Password Email sent. Please check your inbox.')
      setResettingPassword(false)
    } else {
      toast.error(res?.message || 'An error occurred.')
    }
  }

  return (
    <Dialog
      title={resettingPassword ? 'Reset Password' : 'Login'}
      width='400px'
      visible={open}
      closeDialog={onClose}
    >
      <FormProvider {...formProps}>
        <Form onSubmit={handleSubmit(resettingPassword ? resetPassword : login)}>
          <FormInput
            label='Email'
            name='email'
            required
            style={{ marginTop: '1em' }}
            spellCheck={false}
          />
          {!resettingPassword && (
            <FormInput
              type='password'
              autocomplete='current-password'
              label='Password'
              name='password'
              required
            />
          )}
          <span style={{ marginLeft: 'auto', marginTop: 5 }}>
            {resettingPassword && <Button
              variant='outline'
              onClick={() => {
                reset()
                setResettingPassword(false)
              }}
              style={{ marginRight: 10 }}
            >
              Cancel
            </Button>}
            <Button id='login' type='submit' variant='relief' disabled={processing} disable={processing} css={{ minWidth: 70 }}>
              {resettingPassword
                ? 'Send Reset Email'
                : processing ? (
                    <span>
                      <Spinner />
                      Logging In...
                    </span>
                  ) : 'Log In'
              }
            </Button>
          </span>
        </Form>
        {!resettingPassword && (
          <div style={{ width: '100%' }}>
            <a css={{ cursor: 'pointer' }} onClick={() => {
              setResettingPassword(true)
              unregister('password')
            }}>
              Forgot Password?
            </a>
          </div>
        )}
      </FormProvider>
    </Dialog>
  )
}

