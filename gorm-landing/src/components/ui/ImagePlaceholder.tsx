type ImagePlaceholderProps = {
  label: string
  className?: string
}

/**
 * Stand-in for a real Figma-exported photo. Swap the containing element
 * for an <img> once the asset lands in src/assets/images.
 */
function ImagePlaceholder({ label, className = "" }: ImagePlaceholderProps) {
  const hasBg = /(^|\s)bg-/.test(className)

  return (
    <div
      className={`flex items-end justify-start overflow-hidden border border-white/15 p-3 ${hasBg ? "" : "bg-neutral-900"} ${className}`}
    >
      <span className="line-clamp-1 font-mono text-[11px] uppercase tracking-wide text-white/30">
        {label}
      </span>
    </div>
  )
}

export default ImagePlaceholder
