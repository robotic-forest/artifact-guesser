import { useTheme } from "@emotion/react"
import { createStyles } from "@/components/GlobalStyles"
import { artifactsTheme } from "../artifacts"
import { LobbyChoice } from "@/components/multiplayer/LobbyChoice"

export default () => {
  useTheme(artifactsTheme)

  return (
    <div css={createStyles(artifactsTheme)}>
      <div className='relative'>
        <LobbyChoice />
      </div>
    </div>
  )
}