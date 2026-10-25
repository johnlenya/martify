const TONES = {
  neutral: 'bg-sand/70 text-ink-soft border-transparent',
  brand: 'bg-brand-soft text-brand-dark border-transparent',
  dark: 'bg-night text-white border-transparent',
  success: 'bg-leaf-soft text-leaf border-transparent',
  warning: 'bg-[#FBF1DD] text-[#8A5A13] border-transparent',
  danger: 'bg-[#FDECEA] text-[#A3301D] border-transparent',
  outline: 'bg-transparent text-ink-soft border-line',
  white: 'bg-white/90 text-ink border-white/60 backdrop-blur',
};

export default function Badge({
  children,
  tone = 'neutral',
  className = '',
  icon: Icon,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-5 tracking-[0.01em] ${TONES[tone] ?? TONES.neutral} ${className}`}
    >
      {Icon ? <Icon className="h-3 w-3" strokeWidth={1.8} /> : null}
      {children}
    </span>
  );
}
