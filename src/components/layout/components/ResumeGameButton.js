import { IconButton } from "@/components/buttons/IconButton"
import Link from "next/link"
import { GiGreekSphinx } from "react-icons/gi"

export const ResumeGameButton = ({ className }) => {

  return (
    <Link href='/' css={{ '&:hover': { color: 'var(--textColor)'} }}>
      <IconButton tooltip='Resume Game' className={className} css={{
        background: '#000000',
        color: '#ffffff',
        '&:hover': {
          background: '#ffffff',
          color: '#000000',
        }
      }}>
        <GiGreekSphinx />
      </IconButton>
    </Link>
  )
}