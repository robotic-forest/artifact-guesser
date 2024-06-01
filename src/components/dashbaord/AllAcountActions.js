import { MdMail } from "react-icons/md"
import { IconButton } from "../buttons/IconButton"
import { useConfirmation } from "../dialogs/Dialog"
import { FormInput, FormTextArea } from "../form/Form"
import { useAccounts } from "@/hooks/accounts/useAccounts"
import { PiTestTubeFill } from "react-icons/pi"

export const AllAccountActions = () => {
  const confirm = useConfirmation()
  const { sendEmail } = useAccounts({ skip: true })

  return (
    <IconButton
      tooltip='Email All'
      className='ml-2'
      onClick={async () => {
        const ok = await confirm({
          title: (
            <div className='flex items-center'>
              <MdMail className='mr-2' />
              Email All Accounts
            </div>
          ),
          form: formProps => {
            const values = formProps.watch()
            
            return (
              <div>
                <FormInput
                  label='Subject'
                  name='subject'
                  required
                />
                <div className='my-2' css={{ color: 'var(--textLowOpacity)' }}>
                  Hi [username],
                </div>
                <FormTextArea
                  name='message'
                  autosize
                  autoFocus
                  required
                />
                <div className='flex justify-between'>
                  <div css={{ color: 'var(--textLowOpacity)' }}>
                    Cheers, Sam (protocodex)
                    <div>
                      Artifact Guesser Founder and Dev
                    </div>
                  </div>
                  <IconButton bg
                    tooltip='Test'
                    className='mt-1'
                    type='button'
                    onClick={() => {
                      sendEmail({
                        test: true,
                        ...values
                      })
                    }}
                  >
                    <PiTestTubeFill />
                  </IconButton>
                </div>
              </div>
            )
          },
          confirmText: 'Send'
        })

        if (ok) sendEmail(ok)
      }}
    >
      <MdMail />
    </IconButton>
  )
}