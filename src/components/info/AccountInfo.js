import { IoChevronBack } from 'react-icons/io5'
import { useRouter } from 'next/router'
import React from 'react'
import { InfoItem, InfoUI } from './components/InfoUI'
import Link from 'next/link'
import { MdEmail } from 'react-icons/md'
import { useAccount } from '@/hooks/accounts/useAccount'
import useUser from '@/hooks/useUser'
import { IconButton } from '../buttons/IconButton'
import { Button } from '../buttons/Button'

export const AccountInfo = () => {
  const { account } = useAccount()
  const { user } = useUser()
  const router = useRouter()

  const editDisabled = (account?.role === user?.role && account?.id !== user?.id) || user?.role === 'Admin'

  return (
    <InfoUI>
      <div css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        width: '100%'
      }}>
        <div css={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          left: -4
        }}>
          {process.browser && window.history.length > 1 && (
            <IconButton
              size={24}
              css={{ marginRight: 8, position: 'relative', top: 1 }}
              onClick={() => router.back()}
            >
              <IoChevronBack />
            </IconButton>
          )}
          <h4 css={{ margin: 0, fontWeight: 600 }}>
            Account Information
          </h4>
        </div>
        {!editDisabled && (
          <Link href={`/accounts/${account?._id}/edit`}>
            <Button small variant='outlined'>Edit</Button>
          </Link>
        )}
      </div>

      <div css={{
        fontWeight: 600,
        margin: '24px 0',
        fontSize: 20
      }}>
        {account?.username}
      </div>

      <InfoItem icon={<MdEmail />} value={(
        <a href={`mailto:${account?.email}`}>
          {account?.email || (
            <span css={{ color: 'var(--textLowOpacity)' }}>
              No email
            </span>
          )}
        </a>
      )} />
      <InfoItem
        icon={<b>Type</b>}
        value={account?.role}
      />
      <InfoItem
        icon={<b>Status</b>}
        value={account?.status}
      />
    </InfoUI>
  )
}