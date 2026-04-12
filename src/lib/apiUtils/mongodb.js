import clientPromise from "./mongoclient"

export const initDB = async () => {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DATABASE || 'production')

  return db
}
