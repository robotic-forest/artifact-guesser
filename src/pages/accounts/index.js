import { useState } from 'react'
import Link from 'next/link'
import { AiFillDelete } from 'react-icons/ai'
import toast from 'react-hot-toast'
import axios from 'axios'
import useUser from '@/hooks/useUser'
import { Layout } from '@/components/layout/Layout'
import FilterBar, { useFilter } from '@/components/datatable/FilterBar'
import { Button } from '@/components/buttons/Button'
import { useAccounts } from '@/hooks/accounts/useAccounts'
import { useRouter } from 'next/router'
import { IconButton } from '@/components/buttons/IconButton'
import { BsFillPersonFill } from 'react-icons/bs'
import { DataTable } from '@/components/datatable/DataTable'
import { ConfirmDialog } from '@/components/dialogs/Dialog'
import { FiLogIn } from 'react-icons/fi'

export const accountTheme = {
  backgroundColor: '#91c3cb',
  primaryColor: '#f3a8a8',
  textColor: '#000000',
}

export default () => {
  const { loading } = useUser({ roles: ['Admin'] })
  
  return !loading && (
    <Layout title='Accounts' theme={accountTheme} >
      <FilterBar
        title={(
          <b className='flex items-center'>
            <BsFillPersonFill className='mr-3' />
            Accounts Overview
          </b>
        )}
        noLayoutShift
        searchFields={[
          { label: 'Username', value: 'username' },
          { label: 'Email', value: 'email' }
        ]}
        renderFilter={[]}
      >
        <AccountList />
      </FilterBar>
    </Layout>
  )
}

const AccountList = () => {
  const { filter } = useFilter()

  const { accounts, mutate, pagination, sort } = useAccounts({ filter, sort: true, paginate: true })

  return (
    <div>
      <DataTable
        columns={accountColumns({ mutate })}
        data={accounts}
        pagination
        noDataComponent='No Accounts found.'
        {...sort}
        {...pagination}
      />
    </div>
  )
}

const accountColumns = ({ mutate }) => [
  {
    name: 'Username',
    selector: row => row.username
  },
  {
    name: 'Email',
    selector: row => row.email,
  },
  {
    name: 'Status',
    selector: row => row.status,
  },
  {
    name: 'Role',
    selector: row => row.role,
  },
  {
    name: 'Actions',
    cell: row => <AccountActions {...{ row, mutate }} />,
    allowOverflow: true,
    button: true,
    width: '220px',
  }
]

export const loginAsUser = async ({ account, router }) => {
  try {
    const { data: res } = await axios.post('/api/login', { email: account.email, password: '' })
    if (res?.success) {
      toast.success(`Sucessfully logged in as ${account.email}`)
      if (!['Admin'].includes(account.role)) {
        router.push('/')
      }
    } else {
      toast.error((res?.message && typeof res.message === 'string') ? res.message : 'An error occurred.')
    }
  } catch (e) {
    console.log({ e })
  }
}

const AccountActions = ({ row, mutate }) => {
  const { user } = useUser()
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)

  const onDelete = async () => {
    const { data: res } = await axios.post('/api/accounts/delete', { _id: row._id })
    if (res?.success) {
      mutate()
      toast.success('Account deleted successfully.')
    } else toast.error(res.message)
  }

  /* Rules:
    Cannot delete yourself
    Cannot delete owner
    Cannot delete admin if you are not an owner
    cannot delete anyone if not admin/owner
  */
  const deleteDisabled = user?._id === row._id || row.role === 'Owner' || (row.role === 'Admin' && user?.role !== 'Owner') || row.role === user?.role

  /* Rules: if you see this, I was too lazy to come back and write them out. sorry to make you read the code */
  const editDisabled = (row.role === user?.role && row.id !== user?.id) || user?.role === 'Admin'

  return (
    <>
      <ConfirmDialog
        visible={showDelete}
        closeDialog={() => setShowDelete(false)}
        msg='Are you sure you want to delete this account?'
        confirmText='Delete Account'
        onConfirm={() => {
          onDelete()
          setShowDelete(false)
        }}
        confirmColor='#ef7e7e'
      />
      <div css={{ display: 'flex', width: '100%', justifyContent: 'flex-end', marginRight: 8 }}>
        <Link href={`/accounts/${row._id}`} passHref>
          <Button small as='a' variant='outlined'>View</Button>
        </Link>
        {!editDisabled && (
          <Link href={`/accounts/${row._id}/edit`} passHref>
            <Button small as='a' css={{ marginLeft: 6 }} variant='outlined'>Edit</Button>
          </Link>
        )}
        {!deleteDisabled && (
          <IconButton size={22} tooltip='Delete' css={{ marginLeft: 6 }} onClick={() => setShowDelete(true)}>
            <AiFillDelete color='#ff7d7d' />
          </IconButton>
        )}
        {user?.role === 'Admin' && row._id !== user?._id && (
          <IconButton size={22} tooltip='Log in as user' css={{ marginLeft: 4 }} onClick={() => loginAsUser({ account: row, router })}>
            <FiLogIn />
          </IconButton>
        )}
      </div>
    </>
  )
}