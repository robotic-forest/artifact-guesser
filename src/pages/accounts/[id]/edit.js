import { useRedirect } from '@/hooks/useRedirect'
import {  delabelize, uploadFiles } from '@/lib/utils'
import { useForm, FormProvider } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useRouter } from 'next/router'
import useFileUpload from 'react-use-file-upload'
import { useState } from 'react'
import { Loading } from '@/components/loading/Loading'
import { useAccount } from '@/hooks/accounts/useAccount'
import { AccountForm } from '@/components/form/accounts/AccountForm'
import { Layout } from '@/components/layout/Layout'
import useUser from '@/hooks/useUser'
import { accountTheme } from '..'

export default () => {
  const { account } = useAccount()
  return !account ? null : <EditAccount account={account} />
}

const EditAccount = ({ account }) => {
  const { user } = useUser()
  const editDisabled = (account.role === user?.role && account.id !== user?.id) || user?.role === 'Admin'
  useRedirect({ condition: editDisabled })

  const router = useRouter()
  const methods = useForm({ defaultValues: account })
  const uploadProps = useFileUpload()
  const [processing, setProcessing] = useState()

  const onSubmit = async d => {
    const data = delabelize(d)

    setProcessing('Saving...')

    const { data: res } = await axios.post(`/api/accounts/edit`, data)
    if (res?.success) {
      await uploadFiles(uploadProps, setProcessing)
      router.push(`/accounts/${res._id}`)
      toast.success('Account updated successfully.')
    } else {
      setProcessing(false)
      toast.error(res.message)
    }
  }

  return (!user?.isLoggedIn || editDisabled) ? null : processing ? <Loading>{processing}</Loading> : (
    <Layout theme={accountTheme}>
      <FormProvider {...methods}>
        <AccountForm
          title='Edit Account'
          onSubmit={onSubmit}
          submitText='Save Changes'
        />
      </FormProvider>
    </Layout>
  )
}