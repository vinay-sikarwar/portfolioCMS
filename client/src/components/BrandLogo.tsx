import React from 'react';

export interface BrandWordmarkProps {
  className?: string;
  textColor?: string;
  accentColor?: string;
  sizeClassName?: string;
}

/**
 * BrandWordmark:
 * Renders "portfolioCMS" styled according to the brand guidelines:
 * - Geometric bold sans typography
 * - Vibrant lime dot on the 'i' of portfolio
 * - Vibrant lime rounded pill accent directly beneath the 'C' in CMS
 */
export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  className = '',
  textColor = 'text-[#0F241D]',
  accentColor = '#B8F256',
  sizeClassName = 'text-lg',
}) => {
  return (
    <span
      className={`inline-flex items-baseline font-extrabold tracking-tight select-none ${textColor} ${sizeClassName} ${className}`}
      style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif' }}
      aria-label="portfolioCMS"
    >
      <span className="sr-only">portfolioCMS</span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        <span>portfol</span>
        {/* 'i' with custom lime dot */}
        <span className="relative inline-block leading-none">
          {/* Turkish dotless i gives the exact stem height and kerning of 'i' without the native dot */}
          <span>ı</span>
          <span
            className="absolute rounded-full"
            style={{
              backgroundColor: accentColor,
              width: '0.24em',
              height: '0.24em',
              top: '0.04em',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </span>
        <span>o</span>
        {/* 'C' with lime rounded bar underneath */}
        <span className="relative inline-block leading-none ml-[0.02em]">
          <span>C</span>
          <span
            className="absolute rounded-full"
            style={{
              backgroundColor: accentColor,
              height: '0.14em',
              left: '0.02em',
              right: '0.02em',
              bottom: '-0.24em',
            }}
          />
        </span>
        <span>MS</span>
      </span>
    </span>
  );
};

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  showText?: boolean;
  textColor?: string;
  accentColor?: string;
  iconClassName?: string;
  textClassName?: string;
  className?: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showIcon = true,
  showText = true,
  textColor = 'text-[#0F241D]',
  accentColor = '#B8F256',
  iconClassName = '',
  textClassName = '',
  className = '',
  href,
  onClick,
}) => {
  const sizeMap = {
    xs: { icon: 'w-5 h-5 rounded-md', text: 'text-sm' },
    sm: { icon: 'w-6 h-6 rounded-md', text: 'text-base' },
    md: { icon: 'w-8 h-8 rounded-lg', text: 'text-lg' },
    lg: { icon: 'w-10 h-10 rounded-xl', text: 'text-xl' },
    xl: { icon: 'w-12 h-12 rounded-xl', text: 'text-2xl' },
  };

  const currentSize = sizeMap[size];

  const content = (
    <span className={`inline-flex items-center gap-2.5 group transition-transform active:scale-[0.98] ${className}`}>
      {showIcon && (
        <img
          src="/logo.png"
          alt="portfolioCMS logo"
          className={`shrink-0 object-contain shadow-xs transition-transform group-hover:scale-105 ${currentSize.icon} ${iconClassName}`}
        />
      )}
      {showText && (
        <BrandWordmark
          textColor={textColor}
          accentColor={accentColor}
          sizeClassName={currentSize.text}
          className={textClassName}
        />
      )}
    </span>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} className="inline-flex items-center cursor-pointer">
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center text-left cursor-pointer border-none bg-transparent p-0"
      >
        {content}
      </button>
    );
  }

  return content;
};

export default BrandLogo;
