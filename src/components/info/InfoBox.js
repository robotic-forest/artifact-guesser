import { useState } from "react"
import { AiFillCaretRight, AiOutlineStop } from "react-icons/ai"
import { RiErrorWarningLine } from "react-icons/ri"
import { IconButton } from "../buttons/IconButton"

export const InfoBox = ({ children, style, color, warning, closed, expand }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div css={{
      background: color || 'var(--textSuperLowOpacity)',
      padding: 16,
      borderRadius: 'var(--br)',
      marginBottom: 16,
      color: 'black',
      ...style
    }}>
      <div css={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          {warning && <RiErrorWarningLine css={{ marginRight: 12, position: 'relative', top: 2 }} />}
          {closed && (
            <AiOutlineStop css={{ marginRight: 12 }} />
          )}
          {children}
        </div>
        {expand && (
          <div>
            <IconButton
              toolTip="Expand"
              onClick={() => setExpanded(!expanded)}
            >
              <AiFillCaretRight css={{
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.1s ease-in-out'
              }} />
            </IconButton>
          </div>
        )}
      </div>
      {expanded && (
        <div css={{
          marginTop: 16
        }}>
          {expand}
        </div>
      )}
    </div>
  )
}