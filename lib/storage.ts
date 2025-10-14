import { supabase } from "./supabase";

export interface UploadOptions {
  bucket?: string;
  userId?: string;
  maxSizeBytes?: number;
  fileName?: string;
}

/**
 * Upload an image referenced by a local URI to Supabase Storage and return the public URL.
 * - Performs a best-effort size check using blob.size
 * - Generates a user-scoped path: avatars/{userId}/{timestamp}.{ext}
 */
export async function uploadImageUri(
  uri: string,
  options: UploadOptions = {}
): Promise<{ publicUrl: string; path: string }>
{
  const bucket = options.bucket || "avatars";
  const userId = options.userId || "unknown";
  const maxSize = options.maxSizeBytes ?? 1.5 * 1024 * 1024; // 1.5MB default

  // Fetch the file from the local URI
  const resp = await fetch(uri);

  // React Native/Expo doesn't always provide a Blob implementation via fetch.
  // Use arrayBuffer() and convert to Uint8Array which Supabase accepts.
  // Use arrayBuffer -> Uint8Array consistently in RN/Expo to avoid resp.blob()
  const arrayBuffer = await resp.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Size guard (use byteLength)
  if (arrayBuffer.byteLength > maxSize) {
    throw new Error("Image too large");
  }

  // Infer extension from uri, fallback to jpg
  let ext = "jpg";
  try {
    const maybeExt = uri.split(".").pop()?.split("?")[0];
    if (maybeExt && maybeExt.length <= 5) ext = maybeExt;
  } catch (e) {
    /* ignore */
  }

  const filename = options.fileName || `${Date.now()}.${ext}`;
  const path = `avatars/${userId}/${filename}`;

  const contentType = resp.headers.get("content-type") || "image/jpeg";

  // Supabase accepts TypedArray uploads. Use the Uint8Array we created.
  const uploadBody = uint8Array;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, uploadBody, {
      cacheControl: "3600",
      upsert: false,
      contentType,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}

export default uploadImageUri;
