

export const convertMet = object => ({
  name: object.title || object.objectName,
  culture: object.culture || object.department,
  medium: object.medium,
  dimensions: object.dimensions,
  location: {
    country: object.country,
    county: object.county,
    city: object.city,
    state: object.state,
    subregion: object.subregion,
    region: object.region,
    river: object.river,
    locale: object.locale
  },
  time: {
    description: object.objectDate,
    start: object.objectBeginDate,
    end: object.objectEndDate,
    period: object.period,
    reign: object.reign,
    dynasty: object.dynasty,
  },
  images: {
    external: [object.primaryImage, ...object.additionalImages],
    thumbnail: object.primaryImageSmall
  },
  source: {
    url: object.objectURL,
    id: object.objectID,
    name: object.repository,
  }
})