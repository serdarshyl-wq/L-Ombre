const MOTION =
  "transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none";

export default function Roll({
  label,
  tall = false,
  className = "",
  swapClassName = "",
}) {
  const box = tall ? "h-[1.3em] leading-[1.3em]" : "h-[1em] leading-[1em]";
  const line = `block ${box} ${MOTION} group-hover:-translate-y-full group-focus-visible:-translate-y-full`;

  return (
    <span className={`block overflow-clip ${box} ${className}`}>
      <span className={line}>{label}</span>
      <span className={`${line} ${swapClassName}`} aria-hidden="true">
        {label}
      </span>
    </span>
  );
}
