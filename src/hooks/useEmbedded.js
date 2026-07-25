import { useRouter } from 'next/router'

/**
 * True when the page is being framed by something else and should drop its own
 * chrome: `?xframe=1` on any AG url.
 *
 * The protocodex ziggurat world slides an artifact's page in beside the 3D
 * scene, where AG's menu button and Play Game button are worse than useless.
 * The menu opens navigation that would strand you inside a panel, and Play
 * Game would start a run in a frame two thirds of a screen wide.
 *
 * Deliberately a query parameter and not frame detection. It's explicit,
 * testable by just visiting the url, and doesn't guess at intent from
 * window.top, which is unreadable cross-origin anyway.
 */
export const useEmbedded = () => {
  const router = useRouter()
  const value = router?.query?.xframe
  if (value === undefined) return false
  return value !== '0' && value !== 'false'
}

export default useEmbedded
