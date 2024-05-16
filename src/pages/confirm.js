import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import axios from 'axios'
import { Button } from '@/components/buttons/Button'

export default function ConfirmEmail() {
  const router = useRouter()

  if (router.query) {
    const { user, token } = router.query
    return <ConfirmEmailSuccess id={user} token={token} />
  } else return null
}

const ConfirmEmailSuccess = ({ id, token }) => {
  useEffect(() => {
    axios.post('/api/confirm-email', { id, token })
  }, [])

  return (
    <div className='bg-primary min-h-[100vh]' s={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <Head>
        <title>Successfully Confirmed Email</title>
      </Head>
      <div css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 80
      }}>
        <div css={{
          marginBottom: 16,
          fontSize: '1.8em',
          margin: '1.5em 0 1em 0',
          fontWeight: 600,
        }}>
         You have Successfully Confirmed your Email!
        </div>
        <Link href='/login'>
          <Button>
            Back to game
          </Button>
        </Link>
      </div>
    </div>
  )
}