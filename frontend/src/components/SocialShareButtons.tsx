import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  EmailIcon,
} from 'react-share';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  size?: number;
  className?: string;
}

export default function SocialShareButtons({
  url,
  title,
  description = '',
  size = 40,
  className = '',
}: SocialShareButtonsProps) {
  const shareTitle = `${title} - House Direct NG`;
  const shareText = description || `Check out this property: ${title}`;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm font-medium text-gray-700 mr-2">Share:</span>
      
      {/* WhatsApp - Most popular in Nigeria */}
      <WhatsappShareButton
        url={url}
        title={shareTitle}
        separator=" - "
        className="hover:opacity-80 transition-opacity"
      >
        <WhatsappIcon size={size} round />
      </WhatsappShareButton>

      {/* Facebook */}
      <FacebookShareButton
        url={url}
        hashtag="#NigerianRealEstate"
        className="hover:opacity-80 transition-opacity"
      >
        <FacebookIcon size={size} round />
      </FacebookShareButton>

      {/* Twitter */}
      <TwitterShareButton
        url={url}
        title={shareTitle}
        hashtags={['NigerianRealEstate', 'PropertyNigeria', 'RealEstate']}
        className="hover:opacity-80 transition-opacity"
      >
        <TwitterIcon size={size} round />
      </TwitterShareButton>

      {/* LinkedIn */}
      <LinkedinShareButton
        url={url}
        title={shareTitle}
        summary={shareText}
        source="House Direct NG"
        className="hover:opacity-80 transition-opacity"
      >
        <LinkedinIcon size={size} round />
      </LinkedinShareButton>

      {/* Email */}
      <EmailShareButton
        url={url}
        subject={shareTitle}
        body={shareText}
        className="hover:opacity-80 transition-opacity"
      >
        <EmailIcon size={size} round />
      </EmailShareButton>
    </div>
  );
}

