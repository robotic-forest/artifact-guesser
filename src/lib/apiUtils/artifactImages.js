// Browsers can't natively decode these formats. When we serve an artifact to
// the client for gameplay, we strip them out so the <img> tags don't fire
// onError and block image-readiness logic.
const UNRENDERABLE_EXTS = /\.(tif|tiff|heic|heif|raw|cr2|nef|arw)(\?|$)/i

export const isRenderableImageUrl = (url) => !!url && !UNRENDERABLE_EXTS.test(url)

/**
 * Mutates `artifact.images.external` in place to drop unrenderable URLs.
 * Returns the artifact (for chaining). Safe on null/undefined input.
 */
export const stripUnrenderableImages = (artifact) => {
  if (!artifact?.images?.external) return artifact
  artifact.images.external = artifact.images.external.filter(isRenderableImageUrl)
  return artifact
}
