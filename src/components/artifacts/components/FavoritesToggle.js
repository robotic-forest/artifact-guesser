import { Button } from "@/components/buttons/Button"
import { useFavorites } from "@/hooks/artifacts/useFavorites"
import { FaHeart } from "react-icons/fa"

export const FavoritesToggle = ({ artifactId }) => {
  const { isFavorite, toggleFavorite } = useFavorites({ artifactId })

  return (
    <Button variant='outlined' onClick={toggleFavorite} css={{
      background: 'var(--backgroundColorBarelyLight)',
      '&:hover': {
        background: 'var(--backgroundColorLight)',
        boxShadow: 'none',
      },
      border: '1px outset',
      borderColor: '#ffffff77 #00000077 #00000077 #ffffff77',
      boxShadow: 'none',
      borderRadius: 0,
    }}>
      <FaHeart color={isFavorite ? 'green' :  '#ff4f4f'} className='mr-2' />
      {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
    </Button>
  )
}