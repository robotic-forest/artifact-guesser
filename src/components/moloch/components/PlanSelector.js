import axios from "axios"
import useUser from "@/hooks/useUser"
import useSWR from "swr"
import { accountTheme } from "@/pages/accounts"
import { createStyles } from "@/components/GlobalStyles"
import { MolochButton } from "@/components/buttons/MolochButton"

export const PlanSelector = () => {
  const { user } = useUser()
  const { data: plans } = useSWR('/api/subscriptions/plans')

  const customerId = user?.subscription?.customerId
  const availablePlans = plans?.filter(plan => plan.name !== user?.plan)
  const currentPlan = plans?.find(plan => plan.name === user?.plan)

  return (
    <div id='plans' className='p-3 w-full flex flex-col items-center grow' css={createStyles(accountTheme)}>
      {user && (
        <div className='flex flex-col items-center'>
          <div className='mb-2 text-base opacity-70'>Your Current Plan</div>
          <div className='p-2 px-3 mb-2 flex items-center' css={{
          border: '1px solid #ffffff33',
          background: 'var(--backgroundColorBarelyLight)',
        }}>
            <span className='text-lg'>
              <b>{currentPlan?.name || 'Free'}</b>
            </span>
            {customerId && currentPlan && (
              <MolochButton className='ml-4' onClick={async () => {
                const { data } = await axios.post('/api/subscriptions/createPortalSession')
                if (data.success) window.location.replace(data.portalUrl)
              }}>
                Manage Subscription
              </MolochButton>
            )}
          </div>
        </div>
      )}
      {availablePlans?.length > 0 && (
        <>
          <div className='mt-2 mb-2 text-base opacity-70'>
            {user?.plan ? 'Switch to a different plan' : 'Support Artifact Guesser'}
          </div>
          <div className='flex flex-wrap justify-center'>
            {availablePlans.map(plan => (
              <div key={plan.priceId} className='p-3 pt-2 mr-2 mb-2 flex flex-col items-center w-[360px]' css={{
                background: 'var(--backgroundColorBarelyLight)',
                border: '1px outset',
                borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
              }}>
                <div className='pb-2 w-full'>
                  <b>{plan.name}</b>
                  <div className='py-2 w-full'>
                    {plan.description}
                  </div>
                </div>
                <div className='flex flex-col justify-end items-center grow'>
                  <span className='opacity-70'>
                    Choose your own pricing
                  </span>
                  <div className='flex mt-2'>
                    {plan.prices
                      .sort((a, b) => a.amount - b.amount)
                      .map(price => (
                        <MolochButton css={{ letterSpacing: 1.5, paddingBottom: 3, marginRight: 6 }} onClick={async () => {
                          const { data } = await axios.post('/api/subscriptions/createCheckoutSession', { priceId: plan.priceId, plan: plan.name })
                          if (data.success) window.location.replace(data.sessionUrl)
                        }}>
                          ${price.amount}
                        </MolochButton>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}