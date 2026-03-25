import type { SVGProps } from 'react';

export const IconDash = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden={true} {...props}>
    <g clipPath="url(#clip0_dash)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 8C4 7.44772 4.44772 7 5 7H11C11.5523 7 12 7.44772 12 8C12 8.55228 11.5523 9 11 9H5C4.44772 9 4 8.55228 4 8Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_dash">
        <rect width={16} height={16} fill="white" />
      </clipPath>
    </defs>
  </svg>
);