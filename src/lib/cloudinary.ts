// lazy cloudinary helpers to avoid import-time errors when CLOUDINARY_URL is misconfigured
import type { UploadApiResponse } from 'cloudinary'

async function getCloudinary() {
    try {
        const mod = await import('cloudinary')
        const cloudinary = mod.v2

        // prefer explicit server-side envs; fall back to NEXT_PUBLIC for cloud name only
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const apiKey = process.env.CLOUDINARY_API_KEY
        const apiSecret = process.env.CLOUDINARY_API_SECRET

        if (cloudName && apiKey && apiSecret) {
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
            })
        }

        return cloudinary
    } catch (err) {
        console.error('Failed to load cloudinary:', err)
        throw err
    }
}

export async function uploadBuffer(buffer: Buffer, folder = 'prodfeed_images'): Promise<UploadApiResponse> {
    const cloudinary = await getCloudinary()
    return new Promise((resolve, reject) => {
        try {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder },
                (error: any, result?: UploadApiResponse) => {
                    if (error) return reject(error)
                    if (!result) return reject(new Error('Empty upload result'))
                    resolve(result)
                }
            )
            uploadStream.end(buffer)
        } catch (err) {
            reject(err)
        }
    })
}

export async function destroyImage(publicId: string): Promise<any> {
    const cloudinary = await getCloudinary()
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (err: any, res: any) => {
            if (err) return reject(err)
            resolve(res)
        })
    })
}
