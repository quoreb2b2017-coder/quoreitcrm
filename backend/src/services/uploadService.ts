import { cloudinary } from '../config/cloudinary.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';

const BASE_FOLDER = 'ats-saas';

export type UploadType = 'resume' | 'document' | 'profile' | 'video';

const UPLOAD_CONFIG: Record<
  UploadType,
  { folder: string; resourceType: 'image' | 'raw' | 'video' | 'auto' }
> = {
  resume: { folder: `${BASE_FOLDER}/resumes`, resourceType: 'auto' },
  document: { folder: `${BASE_FOLDER}/documents`, resourceType: 'auto' },
  profile: { folder: `${BASE_FOLDER}/profile`, resourceType: 'image' },
  video: { folder: `${BASE_FOLDER}/intro-videos`, resourceType: 'video' },
};

export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
  resourceType: 'image' | 'raw' | 'video';
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: { folder?: string; resourceType?: 'image' | 'raw' | 'video' | 'auto'; originalname?: string } = {}
): Promise<UploadResult> {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(
      503,
      'File upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env'
    );
  }
  const { folder = BASE_FOLDER, resourceType = 'auto' } = options;
  const resolvedType = resourceType; // Keep it as it is, Cloudinary handles 'auto'

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: resolvedType as 'image' | 'video' | 'raw' | 'auto',
    };

    if (options.originalname) {
      const extMatch = options.originalname.match(/\.([^.]+)$/);
      if (extMatch) {
        // Keep public_id WITHOUT extension.
        // Put the extension into `format` so:
        // - Cloudinary URLs end with .ext
        // - private_download_url works reliably (it expects public_id + format separately)
        const ext = extMatch[1].toLowerCase();
        const randomId = Math.random().toString(36).substring(2, 15);
        uploadOptions.public_id = randomId;
        uploadOptions.format = ext;
      }
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (err, result) => {
        if (err) {
          reject(new AppError(500, err.message ?? 'Upload failed'));
          return;
        }
        if (!result?.secure_url) {
          reject(new AppError(500, 'Upload failed: no URL returned'));
          return;
        }
        resolve({
          url: result.secure_url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          resourceType: (result.resource_type as 'image' | 'raw' | 'video') ?? resolvedType,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

export async function uploadByType(
  buffer: Buffer,
  type: UploadType,
  options?: { originalname?: string }
): Promise<UploadResult> {
  const { folder, resourceType } = UPLOAD_CONFIG[type];
  return uploadToCloudinary(buffer, { folder, resourceType, originalname: options?.originalname });
}

export async function deleteFromCloudinary(
  publicId: string,
  options: { resourceType?: 'image' | 'raw' | 'video' } = {}
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: options.resourceType ?? 'image',
  });
}
