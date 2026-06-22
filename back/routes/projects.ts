import { makeCrudRouter } from "../lib/crud";
import { deleteUploadByUrl } from "../lib/uploads";

// Projects: standard CRUD + reorder. On delete, also remove any uploaded
// images (and thumbnails) belonging to the project from disk.
const router = makeCrudRouter("projects", {
  onDelete: (item) => {
    const images = Array.isArray(item.images) ? (item.images as string[]) : [];
    const thumbs = Array.isArray(item.thumbnails) ? (item.thumbnails as string[]) : [];
    [...images, ...thumbs].forEach((url) => deleteUploadByUrl(url));
  },
});

export default router;
