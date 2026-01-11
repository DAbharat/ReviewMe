import mongoose from "mongoose"

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

let cached = (global as any).mongoose as MongooseCache

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  }
}

async function dbConnect() {
  if (cached.conn) {
    console.log("Already connected to Database.")
    return cached.conn
  }

  if (!process.env.MONGODB_URI) {
    const msg = "MONGODB_URI is not set in environment"
    console.error(msg)
    throw new Error(msg)
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI as string)
      .catch((err) => {
        console.error("Initial mongoose.connect failed:", err)
        throw err
      })
  }

  try {
    cached.conn = await cached.promise
    console.log("DB connected successfully!")
  } catch (err) {
    console.error("DB connection error:", err)
    throw err
  }

  return cached.conn
}

export default dbConnect
