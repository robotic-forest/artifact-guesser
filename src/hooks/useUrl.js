import { useRouter } from "next/router"

export const useUrl = () => {
  const router = useRouter()

  const entityId = router.query.id
  const entity = router.pathname.split('/')[1]

  return { entityId, id: entityId, entity }
} 