import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { createPost } from "../lib/api";

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 5;

export default function CreatePostPage() {
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChoosePhotos = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const totalPhotos = images.length + files.length;
    if (totalPhotos > MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    // Validate all files are images
    const invalidFile = files.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      toast.error("All files must be images");
      return;
    }

    // Validate file sizes
    const largeFile = files.find((file) => file.size > 10 * 1024 * 1024);
    if (largeFile) {
      toast.error("Images must be smaller than 10MB");
      return;
    }

    const newImages = [...images, ...files];
    const newPreviews = [
      ...previews,
      ...files.map((file) => URL.createObjectURL(file)),
    ];

    setImages(newImages);
    setPreviews(newPreviews);
  };

  const removePhoto = (index) => {
    if (previews[index]?.startsWith("blob:")) {
      URL.revokeObjectURL(previews[index]);
    }
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
    if (currentPreviewIndex >= newPreviews.length && currentPreviewIndex > 0) {
      setCurrentPreviewIndex(currentPreviewIndex - 1);
    }
  };

  const uploadPhotos = async () => {
    const photoUrls = [];
    for (const image of images) {
      try {
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "instaclone");
        data.append("cloud_name", "sudhanshugaikwad");
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/sudhanshugaikwad/image/upload",
          { method: "POST", body: data }
        );
        const result = await response.json();
        if (!response.ok || !result.secure_url) {
          throw new Error("Failed to upload image");
        }
        photoUrls.push(result.secure_url);
      } catch (error) {
        throw new Error(`Failed to upload photo: ${error.message}`);
      }
    }
    return photoUrls;
  };

  const handleShare = async () => {
    if (images.length < MIN_PHOTOS || images.length > MAX_PHOTOS) {
      toast.error(`Please upload ${MIN_PHOTOS} to ${MAX_PHOTOS} photos`);
      return;
    }
    if (!body.trim()) {
      toast.error("Please add a caption");
      return;
    }

    setLoading(true);
    try {
      const photoUrls = await uploadPhotos();
      await createPost(body.trim(), photoUrls);
      toast.success("Post shared successfully!");
      navigate("/home", { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const nextPreview = () => {
    setCurrentPreviewIndex((prev) =>
      prev === previews.length - 1 ? 0 : prev + 1
    );
  };

  const prevPreview = () => {
    setCurrentPreviewIndex((prev) =>
      prev === 0 ? previews.length - 1 : prev - 1
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <h1 className="font-display text-xl font-bold">Create new post</h1>
          <button
            onClick={handleShare}
            disabled={loading || images.length < MIN_PHOTOS}
            className="font-semibold text-coral transition disabled:opacity-50"
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-2">
          {/* Photos Section */}
          <div className="space-y-4">
            {previews.length > 0 && (
              <div className="relative">
                <div className="grid min-h-80 place-items-center overflow-hidden rounded-2xl bg-stone-100">
                  <img
                    src={previews[currentPreviewIndex]}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Navigation */}
                {previews.length > 1 && (
                  <>
                    <button
                      onClick={prevPreview}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextPreview}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                      {currentPreviewIndex + 1} / {previews.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Photo Thumbnails */}
            <div>
              <p className="mb-2 text-sm font-semibold text-stone-600">
                Photos ({images.length}/{MAX_PHOTOS})
              </p>
              <div className="flex flex-wrap gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Thumbnail ${index + 1}`}
                      className={`h-16 w-16 cursor-pointer rounded-lg object-cover transition ${
                        currentPreviewIndex === index
                          ? "ring-2 ring-coral"
                          : "hover:opacity-80"
                      }`}
                      onClick={() => setCurrentPreviewIndex(index)}
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {images.length < MAX_PHOTOS && (
                  <label className="grid h-16 w-16 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 text-center text-xs text-stone-500 hover:border-coral hover:bg-coral/5">
                    +
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleChoosePhotos}
                    />
                  </label>
                )}
              </div>
            </div>

            {previews.length === 0 && (
              <label className="grid min-h-80 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 text-center text-sm text-stone-500 hover:border-coral hover:bg-coral/5">
                <span>
                  Choose {MIN_PHOTOS}-{MAX_PHOTOS} photos
                  <br />
                  <span className="text-xs">JPG or PNG</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleChoosePhotos}
                />
              </label>
            )}
          </div>

          {/* Caption Section */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-600 mb-2">
                Caption
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a caption for your post..."
                className="min-h-48 w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm outline-none transition focus:border-coral focus:ring-2 focus:ring-coral/20"
              />
            </div>

            {/* Info Message */}
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
              <p className="font-semibold">Photo Requirements:</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Select between {MIN_PHOTOS} to {MAX_PHOTOS} photos</li>
                <li>• Maximum file size: 10MB per image</li>
                <li>• Supported formats: JPG, PNG, WebP</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
