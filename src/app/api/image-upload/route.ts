import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options"
import { uploadBuffer } from "@/lib/cloudinary";
import { User } from "next-auth";


interface CloudinaryUploadResponse {
    public_id: string;
    secure_url: string;
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    const user: User = session?.user

    if (!session || !user || !user._id) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, {
            status: 401
        })
    }

    try {
        // quick server-side validation of Cloudinary envs to provide clearer errors
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const apiKey = process.env.CLOUDINARY_API_KEY
        const apiSecret = process.env.CLOUDINARY_API_SECRET

        if (!cloudName || !apiKey || !apiSecret) {
            console.error('Cloudinary not configured:', { cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret })
            return Response.json({ success: false, message: 'Image service not configured on server' }, { status: 500 })
        }
        const formData = await request.formData()
        const file = formData.get("file") as File | null;

        if (!file) {
            return Response.json({
                success: false,
                message: "No file uploaded"
            }, {
                status: 400
            })
        }

        if (!file.type.startsWith("image/")) {
            return Response.json(
                { 
                    success: false, 
                    message: "Only image files allowed" 
                },
                { 
                    status: 400 
                }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await uploadBuffer(buffer, 'prodfeed_images')
        return Response.json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                imageUrl: result.secure_url,
                publicId: result.public_id
            }
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Image Upload Error:", error)
        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}