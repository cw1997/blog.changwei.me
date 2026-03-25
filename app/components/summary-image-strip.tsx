import Image from "next/image";

type SummaryImageStripProps = {
  images: string[];
  title: string;
};

const MAX_SLOTS = 5;

export default function SummaryImageStrip({ images, title }: SummaryImageStripProps) {
  if (images.length === 0) {
    return null;
  }

  const hasMore = images.length > MAX_SLOTS;
  const shownImages = hasMore ? images.slice(0, MAX_SLOTS - 1) : images.slice(0, MAX_SLOTS);
  const remainingCount = hasMore ? images.length - (MAX_SLOTS - 1) : 0;

  return (
    <section className="mt-3" aria-label="正文图片预览">
      <div className="overflow-x-auto pb-1">
        <ul className="flex min-w-max gap-2">
          {shownImages.map((src, index) => (
            <li
              key={`${src}-${index}`}
              className="relative h-24 w-[160px] shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Image
                src={src}
                alt={`${title} 正文图片 ${index + 1}`}
                fill
                sizes="160px"
                unoptimized
                className="object-cover"
              />
            </li>
          ))}

          {hasMore ? (
            <li className="flex h-24 w-[160px] shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-zinc-100 text-lg font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              +{remainingCount}
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
