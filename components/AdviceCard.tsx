import React, { useState } from 'react';
import { CopyIcon, CheckIcon, ShareIcon } from './Icons';

interface AdviceCardProps {
  title: string;
  content: string | string[];
  icon: React.ReactNode;
  colorClass: string;
  delay: number;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ title, content, icon, colorClass, delay }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = Array.isArray(content) 
      ? `${title}\n\n${content.map((item, i) => `${i + 1}. ${item}`).join('\n')}`
      : `${title}\n\n${content}`;
      
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleShare = async () => {
    const textToShare = Array.isArray(content) 
      ? `${title}\n\n${content.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nShared via Instant Fix.`
      : `${title}\n\n${content}\n\nShared via Instant Fix.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Instant Fix Advice',
          text: textToShare,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div 
      className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-700 ease-out transform translate-y-0 opacity-100`}
      style={{
        animation: `fadeInUp 0.6s ease-out forwards`,
        animationDelay: `${delay}ms`,
        opacity: 0 
      }}
    >
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
          {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${colorClass.replace('bg-', 'text-')}` })}
        </div>
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{title}</h3>
      </div>

      {/* Content */}
      <div className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
        {Array.isArray(content) ? (
          <ul className="space-y-3">
            {content.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>{content}</p>
        )}
      </div>

      {/* Actions */}
      <div className="absolute bottom-4 right-4 flex gap-2">
         <button
          onClick={handleShare}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Share"
        >
          <ShareIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdviceCard;
