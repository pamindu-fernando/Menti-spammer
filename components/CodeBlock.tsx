
import React, { useState } from 'react';
import { ClipboardIcon, CheckCircleIcon } from './icons';

interface CodeBlockProps {
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative bg-gray-900 rounded-md">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-gray-700 rounded-md hover:bg-gray-600 text-gray-300 transition-colors"
        aria-label="Copy code to clipboard"
      >
        {copied ? <CheckCircleIcon /> : <ClipboardIcon />}
      </button>
      <pre className="p-4 text-sm text-gray-200 overflow-x-auto rounded-md">
        <code className="language-javascript">{code}</code>
      </pre>
    </div>
  );
};
