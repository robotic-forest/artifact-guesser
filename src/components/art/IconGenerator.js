import { useState } from "react"
import {
  GiBastet,
  GiAncientColumns,
  GiByzantinTemple,
  GiEgyptianUrns,
  GiGreekSphinx,
  GiEyeOfHorus,
  GiWaxTablet,
  GiTemptation
} from 'react-icons/gi'

export const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

export const IconGenerator = props => {
  const [icon] = useState(getRandomInt(0, 5))

  switch (icon) {
    case 1: return <GiByzantinTemple {...props} />
    case 2: return <GiEgyptianUrns {...props} />
    case 3: return <GiAncientColumns {...props} />
    case 4: return <GiBastet {...props} />
    case 5: return <GiEyeOfHorus {...props} />
    case 6: return <GiWaxTablet {...props} />
    case 7: return <GiTemptation {...props} />
    default: return <GiGreekSphinx {...props} />
  }
}