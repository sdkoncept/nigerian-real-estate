import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export default function Logo({ className = '', showTagline = false }: LogoProps) {
  const isFooter = className.includes('text-white');
  
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      {/* Logo Container */}
      <div className="flex items-center gap-3">
        {/* Left Side - House Icon with Location Pin */}
        <div className="relative">
          {/* House Icon */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            {/* House outline */}
            <path
              d="M20 8L8 18V32H16V24H24V32H32V18L20 8Z"
              fill="#E8DCC6"
              stroke="white"
              strokeWidth="2"
            />
            {/* Location Pin */}
            <circle cx="20" cy="20" r="4" fill="#8B4513" />
            <circle cx="20" cy="20" r="1.5" fill="white" />
            <path
              d="M20 24L20 32"
              stroke="#8B4513"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Ground line */}
            <line
              x1="12"
              y1="32"
              x2="28"
              y2="32"
              stroke="#8B4513"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Vertical Divider */}
        <div className={`h-8 w-px ${isFooter ? 'bg-white' : 'bg-black'} mx-1`} />

        {/* Right Side - Text */}
        <div className="flex flex-col">
          {/* Company Name */}
          <div className="flex items-baseline">
            <span className={`text-xl font-bold ${isFooter ? 'text-white' : 'text-[#8B4513]'}`}>House</span>
            <span className={`text-xl font-bold ${isFooter ? 'text-white' : 'text-black'}`}>DirectNG</span>
          </div>
          {/* Tagline */}
          {showTagline && (
            <span className={`text-xs font-light leading-tight ${isFooter ? 'text-gray-300' : 'text-black'}`}>
              Find your perfect property
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

