interface Props {
  className?: string;
  withText?: boolean;
  textClassName?: string;
}

// Marca de Next Payments en SVG, sin depender de imágenes externas.
export function Logo({ className = "h-8 w-8", withText = false, textClassName = "text-gray-900" }: Props) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-indigo-600" />
        <rect x="6" y="9" width="20" height="14" rx="2.5" stroke="white" strokeWidth="2" />
        <path d="M6 14h20" stroke="white" strokeWidth="2" />
        <path d="M10 19h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {withText ? (
        <span className={`text-base font-semibold tracking-tight ${textClassName}`}>Next Payments</span>
      ) : null}
    </span>
  );
}
