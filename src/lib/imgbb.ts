export async function uploadImageToImgbb(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey || apiKey === "your_imgbb_api_key") {
    throw new Error(
      "ImgBB API key is not configured. Please paste a direct image URL or set NEXT_PUBLIC_IMGBB_API_KEY."
    );
  }

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json?.success || !json?.data?.url) {
    throw new Error(json?.error?.message || "Failed to upload image to ImgBB.");
  }

  return json.data.url as string;
}
