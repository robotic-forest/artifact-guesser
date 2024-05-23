import { formatDateRange } from "@/lib/artifactUtils"

export const YourGuess = ({ artifact, selectedDate, selectedCountry, datePoints, countryIsCorrect }) => {

  return (
    <div className='bg-black rounded border border-white/30 mb-1 w-full' css={{ padding: '6px 8px' }}>
      <div className='text-white/70 flex justify-between text-sm mb-1'>
        <div>Origin</div>
        <div>Your Guess</div>
      </div>
      <div className='flex justify-between items-start mb-1'>
        {formatDateRange(artifact?.time.start, artifact?.time.end)}
        <div
          className='p-[0px_4px] rounded text-black flex'
          css={{ background: datePoints === 100 ? '#7ae990' : datePoints > 50 ? '#ffc045' : datePoints > 0 ? '#ff7145' :'#ff9999' }}
        >
          {Math.abs(selectedDate)} {selectedDate > 0 ? 'AD' : 'BC'}
        </div>
      </div>
      <div className='flex justify-between items-start mb-1 border-white/30'>
        <div>{artifact?.location.country}</div>
        <div
          className='p-[0px_4px] rounded text-black'
          css={{ background: countryIsCorrect ? '#7ae990' : '#ff9999' }}
        >
          {selectedCountry}
        </div>
      </div>
    </div>
  )
}