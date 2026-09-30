
export interface CloudinarySignedUpload {
  timestamp: string;
  signature: string;
  apiKey: string;
  folder: string;
  publicId: string;
  uploadUrl: string;
}

export interface SignedUrlsResponse {
  uploads: CloudinarySignedUpload[];
}

export type GetSignedUrlsFn = (count: number) => Promise<SignedUrlsResponse>;

export const uploadImagesToCloudinary = async (
  files: File[],
  getSignedUrls: GetSignedUrlsFn,
): Promise<string[]> => {
  if (!files || files.length === 0) return [];

  const { uploads } = await getSignedUrls(files.length);

  if (!uploads || uploads.length !== files.length) {
    throw new Error("Mismatch in signed URLs and file count.");
  }

  const uploadedUrls = await Promise.all(
    uploads.map(async (uploadData, index) => {
      const formData = new FormData();
      formData.append("file", files[index]);
      formData.append("timestamp", uploadData.timestamp);
      formData.append("signature", uploadData.signature);
      formData.append("api_key", uploadData.apiKey);
      formData.append("folder", uploadData.folder);
      formData.append("public_id", uploadData.publicId);

      const res = await fetch(uploadData.uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload request failed");
      }

      const  data: { secure_url?: string } = await res.json();

      if (!data.secure_url) {
        throw new Error("Upload failed");
      }

      return data.secure_url;
    }),
  );

  return uploadedUrls;
};
