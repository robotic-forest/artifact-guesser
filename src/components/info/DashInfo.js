export const DashInfo = ({ title, count }) => {

  return (
    <div className='p-3 border border-white/20 rounded mr-2 mb-2
        min-w-[300px] flex items-center justify-between'>
      <div className='flex items-center'>
        {title}
      </div>
      <div>
        {count}
      </div>
    </div>
  )
}