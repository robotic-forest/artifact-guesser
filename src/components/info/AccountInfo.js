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
import { IconGenerator } from '../art/IconGenerator'
import moment from 'moment'

export const AccountInfo = ({ actions }) => {
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
        width: '100%',
        '@media (max-width: 600px)': {
          paddingTop: 36,
        }
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
            Account
          </h4>
        </div>
        <div className='flex items-center gap-2'>
          {!editDisabled && (
            <Link href={`/accounts/${account?._id}/edit`}>
              <Button small variant='outlined'>Edit</Button>
            </Link>
          )}
          {actions}
        </div>
      </div>

      <div css={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px 16px',
      }}>
        <div css={{
          fontWeight: 600,
          fontSize: '1.2em',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--backgroundColorSlightlyLight)',
          border: '3px solid var(--ghostText)',
          borderRadius: 6,
          padding: '6px 16px 6px 10px',
        }}>
          <IconGenerator className='mr-2.5' />
          {account?.username}
        </div>

        <InfoItem icon={<MdEmail />} style={{ marginBottom: 0 }} value={(
          <a href={`mailto:${account?.email}`}>
            {account?.email || (
              <span css={{ color: 'var(--textLowOpacity)' }}>
                No email
              </span>
            )}
          </a>
        )} />
        <InfoItem icon={<b>Type</b>} value={account?.role} style={{ marginBottom: 0 }} />
        <InfoItem icon={<b>Status</b>} value={account?.status} style={{ marginBottom: 0 }} />
        <InfoItem icon={<b>Created</b>} value={moment(account?.createdAt).format('MMM D, YYYY')} style={{ marginBottom: 0 }} />
      </div>
    </InfoUI>
  )
}