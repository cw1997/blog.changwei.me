interface BrandIconProps {
  className?: string;
}

export function NextJsIcon(props: Readonly<BrandIconProps>) {
  const { className = "h-4 w-4" } = props;

  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.665 21.978C16.758 23.44 14.178 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 8.993L12 12l6.665 9.978z" />
    </svg>
  );
}

export function VercelIcon(props: Readonly<BrandIconProps>) {
  const { className = "h-4 w-4" } = props;

  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2L2 19.5h20L12 2z" />
    </svg>
  );
}

export function CloudflareIcon(props: Readonly<BrandIconProps>) {
  const { className = "h-4 w-4" } = props;

  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
    </svg>
  );
}
