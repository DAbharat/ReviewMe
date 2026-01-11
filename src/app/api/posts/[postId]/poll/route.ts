import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import dbConnect from '@/lib/dbconnect'
import PostModel from '@/model/post.model'
import VoteModel from '@/model/vote.model'
import mongoose from 'mongoose'
import { getServerSession } from 'next-auth'

export async function GET(request: Request, context: any) {
  await dbConnect()
  const session = await getServerSession(authOptions)

  let userVotedOption = null

  const rawParams = context?.params
  const params = rawParams instanceof Promise ? await rawParams : rawParams
  const { postId } = params

  if (session?.user?._id) {
    const vote = await VoteModel.findOne({
      postId,
      userId: session.user._id,
    }).lean()

    userVotedOption = vote?.option ?? null
  }

  const isValidPostId = mongoose.Types.ObjectId.isValid(postId)

  if (!postId || !isValidPostId) {
    return Response.json({ 
      success: false, 
      message: "Invalid Post ID" 
    }, { 
      status: 400 
    })
  }

  try {
    const post = await PostModel.findById(postId).lean()
    if (!post) {
      return Response.json({ 
        success: false, 
        message: "Post not found" 
      }, { 
        status: 404 
      })
    }

    const poll = post.poll || []
    const totalVotes = poll.reduce((s: number, p: any) => s + (p.votes || 0), 0)

    return Response.json({
      success: true,
      message: "Poll fetched successfully",
      data: {
        poll,
        totalVotes,
        userVotedOption
      }
    })

  } catch (error) {
    console.error('Fetch poll error', error)
    
    return Response.json({ 
      success: false, 
      message: "Internal Server Error" 
    }, { 
      status: 500 
    })
  }
}
