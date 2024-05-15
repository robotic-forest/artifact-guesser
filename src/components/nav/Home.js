import { IconButton } from "@/components/buttons/IconButton"
import Link from "next/link"
import { GiGreekSphinx } from "react-icons/gi"

export const Home = ({ style }) => {

  return (
    <Link href='/'>
      <IconButton as='button' css={style}>
        <GiGreekSphinx />
      </IconButton>
    </Link>
  )
}