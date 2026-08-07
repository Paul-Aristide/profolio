'use client';

import React from 'react';

type SocialIconProps = {
  platform: 'github' | 'facebook' | 'youtube' | 'linkedin' | 'whatsapp' | 'instagram';
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
};

export function SocialIcon({ platform, className = '', onError }: SocialIconProps) {
  const getIcon = () => {
    switch (platform) {
      case 'github':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.988-.675.069-.654.069-.654 1.003.07 1.533 1.028 1.533 1.028.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.682.71 1.031 1.605 1.031 2.688 0 3.848-2.339 4.566-4.566 4.566z" clipRule="evenodd" />
          </svg>
        );
      case 'facebook':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
        );
      case 'youtube':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" clipRule="evenodd" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.206v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H6.328C5.051 1 4 2.051 4 3.322v17.356C4 21.949 5.051 23 6.328 23h11.34c1.277 0 2.327-1.051 2.327-2.322V3.322C20 2.051 18.949 1 17.668 1z" clipRule="evenodd" />
          </svg>
        );
      case 'whatsapp':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M17.509 1.509c-3.675 0-6.874 2.325-8.491 5.491-1.598 3.126-1.598 7.187 0 10.313 1.617 3.166 4.816 5.491 8.491 5.491 3.675 0 6.874-2.325 8.491-5.491 1.598-3.126 1.598-7.187 0-10.313-1.617-3.166-4.816-5.491-8.491-5.491zM12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" clipRule="evenodd" />
          </svg>
        );
      case 'instagram':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm6.406-11.845a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" clipRule="evenodd" />
          </svg>
        );
      default:
        return <span className={className}>🌐</span>;
    }
  };

  return getIcon();
}

export function SocialIconWithBackground({ 
  platform, 
  size = 12,
  showLabel = true,
  labelClassName = ''
}: {
  platform: 'github' | 'facebook' | 'youtube' | 'linkedin' | 'whatsapp' | 'instagram';
  size?: number;
  showLabel?: boolean;
  labelClassName?: string;
}) {
  const getBackground = () => {
    switch (platform) {
      case 'github': return 'from-gray-800 to-gray-600';
      case 'facebook': return 'from-blue-600 to-blue-800';
      case 'youtube': return 'from-red-600 to-red-800';
      case 'linkedin': return 'from-blue-700 to-blue-900';
      case 'whatsapp': return 'from-green-600 to-green-800';
      case 'instagram': return 'from-purple-600 via-pink-600 to-orange-500';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  const getLabel = () => {
    switch (platform) {
      case 'github': return 'GitHub';
      case 'facebook': return 'Facebook';
      case 'youtube': return 'YouTube';
      case 'linkedin': return 'LinkedIn';
      case 'whatsapp': return 'WhatsApp';
      case 'instagram': return 'Instagram';
      default: return platform;
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 hover:scale-105 transition-transform">
      <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br ${getBackground()} flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg`}>
        <SocialIcon platform={platform} className="w-8 h-8 text-white" />
      </div>
      {showLabel && <span className={`text-xs font-medium text-gray-700 truncate ${labelClassName}`}>{getLabel()}</span>}
    </div>
  );
}

export default SocialIcon;
