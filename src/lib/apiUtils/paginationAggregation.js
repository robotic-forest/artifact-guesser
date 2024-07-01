import { cleanMDB, processCriteria } from "./misc"

export const parseQuery = q => {
  const criteria = q.filter ? q.filter !== 'undefined' &&
    processCriteria(JSON.parse(q.filter)) : {}
  const count = q.count && q.count !== 'undefined' &&
    processCriteria(JSON.parse(q.count))
  const project = q.project && q.project !== 'undefined' &&
   JSON.parse(q.project)

  const page = parseFloat(q.page) || 1
  const perPage = parseFloat(q.per_page) || 0
  const sort = q.sort && JSON.parse(q.sort)

  return { criteria, count, project, page, perPage, sort }
}

export const createMetadata = (page, perPage) => {
  const dataPipeline = [{ $skip: (page - 1) * perPage }]
  if (perPage) dataPipeline.push({ $limit: perPage })

  return {
    $facet: {
      metadata: [{ $count: 'total' }],
      data: dataPipeline
    }
  }
}

export const paginationAggregation = async ({ db, collection, query, buildCriteria }) => {
  const { criteria, page, perPage, sort, count, project } = query?.filter ? parseQuery(query) : {}
  const match = buildCriteria ? buildCustomCriteria(criteria, buildCriteria) : criteria

  if (count) {
    const counts = await Promise.all(count.map(c => db.collection(collection).count(c)))
    return res.send({ data: counts })
  }

  const aggregation = [
    { $match: match },
    ...(project ? [{ $project: project }] : []),
    ...(sort ? [{ $sort: sort }] : []),
    createMetadata(page, perPage)
  ]

  const data = await db
    .collection(collection)
    .aggregate(aggregation)
    .toArray()

  const dbData = data?.[0]

  return {
    data: dbData?.data.map(r => cleanMDB(r)),
    total: dbData?.metadata?.[0]?.total || 0
  }
}

export const buildCustomCriteria = (filter, conditions)  => {
  const criteria = { $and: [] }

  for (const key in conditions) {
    if (![undefined, null].includes(filter[key])) {
      criteria.$and.push(conditions[key](filter[key]))
    }
  }

  if (criteria.$and.length === 0) delete criteria.$and
  return criteria
}