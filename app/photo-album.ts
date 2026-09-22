export type PhotoVoice = { id: string; text: string };
export type PhotoSource = { title: string; url: string };
export type PhotoCropRect = {x:number;y:number;width:number;height:number;sourceWidth:number;sourceHeight:number};
export type AlbumPhoto = {
  assetId: string;
  title: string;
  label: string;
  period: string;
  observation: string;
  image: string;
  thumbnailPosition?: string;
  crop?: PhotoCropRect;
  caption: string;
  boundary: string;
  audio: PhotoVoice;
  sourceLinks: PhotoSource[];
  sourceIds: string[];
};
export type PhotoAlbum = { id: string; title: string; label: string; photos: AlbumPhoto[] };
export type FocusedImage = {
  title: string;
  boundary: string;
  images: Array<{ src: string; alt: string; caption: string; crop?: PhotoCropRect }>;
  voice: PhotoVoice;
  sourceLinks?: PhotoSource[];
  period?: string;
  observation?: string;
  album?: { data: PhotoAlbum; index: number };
};

// Keep the image, era, explanation, voice and attribution together when paging.
export function focusAlbumPhoto(album: PhotoAlbum, index = 0): FocusedImage {
  const photo = album.photos[index];
  if (!photo) throw new RangeError("Photo is not in this album");
  return {
    title: photo.title,
    images: [{ src: photo.image, alt: photo.title, caption: photo.caption, ...(photo.crop?{crop:photo.crop}:{}) }],
    boundary: photo.boundary,
    voice: photo.audio,
    sourceLinks: photo.sourceLinks,
    period: photo.period,
    observation: photo.observation,
    album: { data: album, index },
  };
}
