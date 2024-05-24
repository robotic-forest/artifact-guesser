import { formatDateRange } from "@/lib/artifactUtils"

export const YourGuess = ({ artifact, selectedDate, selectedCountry, datePoints, countryPoints }) => {

  return (
    <div className='bg-black rounded border border-white/30 mb-1 w-full flex justify-between' css={{ padding: '6px 8px' }}>
      <div>
        <div className='text-white/70 text-sm mb-1'>
          Origin
        </div>
        {formatDateRange(artifact?.time.start, artifact?.time.end)}
        <div className='mt-1'>{artifact?.location.country}</div>
      </div>

      <div>
        <div className='text-white/70 text-sm mb-1'>
          Your Guess
        </div>
        <div
          className='p-[0px_4px] rounded text-black flex w-[fit-content]'
          css={{ background: calcColors(datePoints) }}
        >
          {Math.abs(selectedDate)} {selectedDate > 0 ? 'AD' : 'BC'}
        </div>
        <div
          className='p-[0px_4px] rounded text-black mt-1 w-[fit-content]'
          css={{ background: calcColors(countryPoints) }}
        >
          {selectedCountry}
        </div>
      </div>

      <div>
        <div className='text-white/70 text-sm mb-1'>
          Points
        </div>
        <div>{datePoints} / 100</div>
        <div className='mt-1'>{countryPoints} / 100</div>
      </div>
    </div>
  )
}

export const calcColors = (points) => {
  if (points === 100) return '#7ae990'
  if (points >= 50) return '#ffc045'
  if (points > 0) return '#ff8a45'
  return '#ff9999'
}