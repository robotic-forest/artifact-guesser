import { useState } from "react"
import {
  GiBastet,
  GiByzantinTemple,
  GiEgyptianUrns,
  GiGreekSphinx,
  GiEyeOfHorus,
  GiWaxTablet,
  GiTemptation,
  GiRubElHizb
} from 'react-icons/gi'
import { PiEyeFill, PiHandEyeFill } from "react-icons/pi"

export const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

export const IconGenerator = props => {
  const [icon] = useState(getRandomInt(0, 9))

  switch (icon) {
    case 1: return <GiByzantinTemple {...props} />
    case 2: return <GiEgyptianUrns {...props} />
    case 3: return <PiEyeFill {...props} />
    case 4: return <GiBastet {...props} />
    case 5: return <GiEyeOfHorus {...props} />
    case 6: return <GiWaxTablet {...props} />
    case 7: return <GiTemptation {...props} />
    case 8: return <PiHandEyeFill {...props} />
    case 9: return <GiRubElHizb {...props} />
    default: return <GiGreekSphinx {...props} />
  }
}