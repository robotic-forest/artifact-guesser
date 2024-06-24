import Link from "next/link"
import { artifactsTheme } from "@/pages/artifacts"
import { createStyles } from "@/components/GlobalStyles"
import { Collosi } from "@/components/dashbaord/Collosi"

export const FuturePlans = () => {

  return (
    <div className='flex flex-wrap items-center p-3 w-full justify-center' css={createStyles(artifactsTheme)}>
      <Collosi className='flex mr-6 mb-6 mt-2' />
      <div className="max-w-[700px]">
        <b>All subscription income will go toward developing Artifact Guesser.</b> I'll be able to add features such as:{' '}
        Timed rounds, multiplayer, <b>3D artifacts</b>, an interface for crowd-sourced editing of artifact data, and much more.
        <div className='mt-3'>
          Learn more
          <Link href='/about' className='text-blue-700 hover:underline hover:text-blue-400 ml-2'>
            here
          </Link>.
        </div>
      </div>
    </div>
  )
}