import { useState } from "react"
import { Range } from "./form/FormRange"
import { formatDate } from "@/lib/artifactUtils"
import useUser from "@/hooks/useUser"

// Docs: https://www.runningreality.org/docs/tutorial/embedding.jsp

export const Experiments = () => {
  const { user } = useUser()
  const [selectedDate, setSelectedDate] = useState(0)

  return user?.isLoggedIn && (
    <div css={{
      width: '100vw',
      height: '100vh',
    }}>
      <div className='fixed top-0 right-0 p-1'>
        <div className='flex items-center bg-black p-[4.5px_6px_4px] rounded-[3px] border border-white/30 text-sm h-[24px]'>
          {formatDate(selectedDate)}
        </div>
      </div>
      <iframe
        src={`https://www.runningreality.org/?notimeline&nobox&nocontrols#07/08/${selectedDate}&zoom=6`}
        width="100%"
        height="100%"
      />
      <div className='fixed bottom-0 right-0 p-1 w-full'>
        <div className='flex items-center bg-black p-[4.5px_6px_4px] rounded-[3px] border border-white/30 text-sm h-[24px] w-full'>
          <Range
            min={-5000}
            max={2024}
            value={selectedDate}
            defaultValue={0}
            width='100%'
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}