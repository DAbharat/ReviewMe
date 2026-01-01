import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options"
import cloudinary from "@/lib/cloudinary";
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

        const result = await new Promise<CloudinaryUploadResponse>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "prodfeed_images",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinaryUploadResponse);
                    }
                )
                uploadStream.end(buffer)
            }
        )
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