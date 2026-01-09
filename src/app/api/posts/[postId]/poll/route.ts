import dbConnect from '@/lib/dbconnect'
import PostModel from '@/model/post.model'
import mongoose from 'mongoose'

export async function GET(request: Request, { params }: { params: { postId: string } }) {
  await dbConnect()

  const resolvedParams = await params as { postId: string }
  const { postId } = resolvedParams

  const isValidPostId = mongoose.Types.ObjectId.isValid(postId)
  if (!postId || !isValidPostId) {
    return Response.json({ success: false, message: 'Invalid Post ID' }, { status: 400 })
  }

  try {
    const post = await PostModel.findById(postId).lean()
    if (!post) {
      return Response.json({ success: false, message: 'Post not found' }, { status: 404 })
    }

    const poll = post.poll || []
    const totalVotes = poll.reduce((s: number, p: any) => s + (p.votes || 0), 0)

    return Response.json({ success: true, data: { poll, totalVotes } }, { status: 200 })
  } catch (error) {
    console.error('Fetch poll error', error)
    return Response.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
