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

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI!)
  }

  cached.conn = await cached.promise
  console.log("DB connected successfully!")

  return cached.conn
}

export default dbConnect
