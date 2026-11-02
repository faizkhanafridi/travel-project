import { useState } from 'react';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import GalleryUploader from './GalleryUploader';
import { extractErrors, firstGeneral } from '../../../lib/errors';
import {
  useUploadGallery,
  useReorderGallery,
  useDeleteImage,
} from '../hooks/useService';

export default function StepGallery({ service, onSaved }) {
  const [banner, setBanner] = useState(null);
  const upload = useUploadGallery(service.uuid);
  const reorder = useReorderGallery(service.uuid);
  const del = useDeleteImage(service.uuid);

  const images = service?.images || [];

  const handleUpload = async (fd) => {
    setBanner(null);
    try {
      const result = await upload.mutateAsync(fd);
      onSaved?.(result);
    } catch (err) {
      const errs = extractErrors(err);
      setBanner(firstGeneral(errs));
    }
  };

  const handleReorder = async (ordered, newCoverUuid) => {
    const cover = newCoverUuid || ordered.find((i) => i.is_cover)?.uuid || ordered[0]?.uuid;
    if (!cover) return;
    setBanner(null);
    try {
      const result = await reorder.mutateAsync({
        order: ordered.map((i) => i.uuid),
        cover_uuid: cover,
      });
      onSaved?.(result);
    } catch (err) {
      const errs = extractErrors(err);
      setBanner(firstGeneral(errs));
    }
  };

  const handleDelete = async (imageUuid) => {
    setBanner(null);
    try {
      const result = await del.mutateAsync(imageUuid);
      onSaved?.(result);
    } catch (err) {
      const errs = extractErrors(err);
      setBanner(firstGeneral(errs));
    }
  };

  const hasCover = images.some((i) => i.is_cover);

  return (
    <div className="space-y-5">
      {banner && <Alert variant="error">{banner}</Alert>}

      <p className="text-sm text-slate-500">
        Upload a cover photo and up to 10 gallery images. You can reorder and pick which image is the cover.
      </p>

      <GalleryUploader
        images={images}
        onUpload={handleUpload}
        onReorder={handleReorder}
        onDelete={handleDelete}
        uploading={upload.isPending}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => onSaved?.(null)}
          disabled={!hasCover || upload.isPending || reorder.isPending || del.isPending}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}