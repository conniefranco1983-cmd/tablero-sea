interface SesnaLogoProps {
  size?: 'header' | 'header-compact' | 'hero';
  className?: string;
}

const heights = {
  header: 'h-8',
  'header-compact': 'h-7',
  hero: 'h-16 md:h-[4.5rem]',
} as const;

export function SesnaLogo({ size = 'header', className = '' }: SesnaLogoProps) {
  return (
    <img
      src="/SESNA-Logo-header.png"
      alt="Secretaría Ejecutiva del Sistema Nacional Anticorrupción"
      className={`w-auto object-contain ${heights[size]} ${className}`}
    />
  );
}
