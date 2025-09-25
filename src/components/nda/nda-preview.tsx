'use client';

import { useState, useEffect } from 'react';
import { fillNDATemplate, NDATemplateData } from '@/lib/nda-template';

interface NDAPreviewProps {
  data: NDATemplateData;
  onScrollToBottom?: () => void;
  className?: string;
}

export function NDAPreview({ data, onScrollToBottom, className = '' }: NDAPreviewProps) {
  const [ndaContent, setNDAContent] = useState('');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  useEffect(() => {
    const filledTemplate = fillNDATemplate(data);
    setNDAContent(filledTemplate);
  }, [data]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const threshold = 50; // pixels from bottom
    const isNearBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;

    if (isNearBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      onScrollToBottom?.();
    }
  };

  return (
    <div className={`bg-white text-black rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="bg-gray-100 px-6 py-3 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          Non-Disclosure Agreement Preview
        </h3>
        <p className="text-sm text-gray-600">
          Please review the document carefully before signing
        </p>
      </div>

      <div
        className="max-h-64 overflow-y-auto p-6 prose prose-sm max-w-none"
        onScroll={handleScroll}
      >
        <div className="whitespace-pre-wrap leading-relaxed text-sm">
          {ndaContent.split('\n').map((line, index) => {
            // Handle bold headers
            if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
              return (
                <p key={index} className="font-bold text-base mt-4 mb-2">
                  {line.trim().replace(/\*\*/g, '')}
                </p>
              );
            }

            // Handle regular paragraphs
            if (line.trim()) {
              return (
                <p key={index} className="mb-3 text-justify">
                  {line.trim()}
                </p>
              );
            }

            // Handle empty lines
            return <div key={index} className="mb-2" />;
          })}
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t">
        <div className="flex items-center justify-center text-sm text-gray-600">
          <span>
            {hasScrolledToBottom ? '' : 'Please scroll to continue'}
          </span>
        </div>
      </div>
    </div>
  );
}