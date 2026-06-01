"use client";

import { useEffect, useRef } from "react";

type ArticleImageLightboxProps = {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
};

export default function ArticleImageLightbox({
  src,
  alt,
  open,
  onClose,
}: ArticleImageLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="article-image-lightbox fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-black/80 p-0 backdrop:bg-black/80"
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center overflow-auto p-4">
        {src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        ) : null}
        {alt ? (
          <p className="mt-3 max-w-3xl text-center text-sm text-zinc-300">{alt}</p>
        ) : null}
      </div>
    </dialog>
  );
}
