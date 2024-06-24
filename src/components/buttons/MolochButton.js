import { Button } from "./Button"

export const MolochButton = p => (
  <Button
    variant='outlined'
    css={{
      background: 'var(--primaryColor)',
      '&:hover': {
        background: 'var(--primaryColorLight)',
        boxShadow: 'none',
      },
      border: '1px outset',
      borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
      boxShadow: 'none',
      borderRadius: 0,
      ...p.css
    }}
    {...p}
  />
)