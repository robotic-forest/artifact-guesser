import { IconButton } from "@/components/buttons/IconButton"
import Link from "next/link"
import { GiGreekSphinx } from "react-icons/gi"
import { useActiveRun } from "@/hooks/useActiveRun"

export const ResumeGameButton = ({ className }) => {
  const { kind, url } = useActiveRun()
  const tooltip = kind === 'daily' ? 'Resume Daily Run' : 'Resume Game'

  return (
    <Link href={url} css={{ '&:hover': { color: 'var(--textColor)'} }}>
      <IconButton tooltip={tooltip} className={className} css={{
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