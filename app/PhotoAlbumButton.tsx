import Image from "next/image";
import { PhotoCrop } from "./PhotoCrop";
import type { PhotoAlbum } from "./photo-album";

export function PhotoAlbumButton({ album, onOpen }: { album: PhotoAlbum; onOpen: () => void }) {
  return <button className="photo-album-button" onClick={onOpen} aria-label={`${album.label}，${album.photos.length}张真实照片`}>
    <span className="photo-album-previews" aria-hidden="true">
      {(album.photos.length<=3?album.photos:[album.photos[0], album.photos[Math.floor(album.photos.length / 2)], album.photos.at(-1)]).map((photo, index) => photo && (photo.crop?<PhotoCrop key={index} src={photo.image} alt="" crop={photo.crop}/>:<Image key={index} src={photo.image} alt="" style={{objectPosition:photo.thumbnailPosition}} width={84} height={64} unoptimized />))}
    </span>
    <span><strong>{album.label}</strong><small>{album.photos.length}张真照片 · 点开听一听</small></span>
    <span className="photo-album-open" aria-hidden="true">↗</span>
  </button>;
}
