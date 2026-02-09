import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Trash2, FileText, Code, Eye, GitCompare, CheckCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MarkdownDoc, ViewMode } from '../types';
import { useDocStore } from '../store/useDocStore';
import { generateDiff } from '../utils/diff';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DocumentCardProps {
  doc: MarkdownDoc;
  isBase: boolean;
  baseContent?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, isBase, baseContent }) => {
  const { removeDoc, updateDoc, setBaseDoc, updateName } = useDocStore();
  const [viewMode, setViewMode] = useState<ViewMode>('edit');

  const diffContent = useMemo(() => {
    if (isBase || !baseContent) return '';
    return generateDiff(doc.name, baseContent, doc.content);
  }, [doc.name, doc.content, baseContent, isBase]);

  return (
    <div className={cn(
      "flex flex-col h-[600px] border rounded-lg shadow-sm bg-white overflow-hidden transition-all duration-200",
      isBase ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200 hover:border-gray-300"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <input
          type="text"
          value={doc.name}
          onChange={(e) => updateName(doc.id, e.target.value)}
          className="bg-transparent font-medium text-gray-700 focus:outline-none focus:underline"
          placeholder="Document Name"
        />
        <div className="flex items-center gap-2">
          {!isBase && (
            <button
              onClick={() => setBaseDoc(doc.id)}
              className="text-xs flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Set as Base Document"
            >
              <CheckCircle className="w-3 h-3" />
              Set as Base
            </button>
          )}
          {isBase && (
             <span className="text-xs flex items-center gap-1 px-2 py-1 text-blue-600 bg-blue-50 rounded font-medium cursor-default">
               <CheckCircle className="w-3 h-3" />
               Base
             </span>
          )}
          <button
            onClick={() => removeDoc(doc.id)}
            className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
            title="Remove Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-white">
        <TabButton
          active={viewMode === 'edit'}
          onClick={() => setViewMode('edit')}
          icon={<Code className="w-4 h-4" />}
          label="Edit"
        />
        <TabButton
          active={viewMode === 'preview'}
          onClick={() => setViewMode('preview')}
          icon={<Eye className="w-4 h-4" />}
          label="Preview"
        />
        {!isBase && (
          <TabButton
            active={viewMode === 'diff'}
            onClick={() => setViewMode('diff')}
            icon={<GitCompare className="w-4 h-4" />}
            label="Diff vs Base"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative bg-white">
        {viewMode === 'edit' && (
          <textarea
            className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none text-gray-800"
            placeholder="Paste Markdown here..."
            value={doc.content}
            onChange={(e) => updateDoc(doc.id, e.target.value)}
            spellCheck={false}
          />
        )}

        {viewMode === 'preview' && (
          <div className="prose prose-sm max-w-none p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {doc.content || '*No content*'}
            </ReactMarkdown>
          </div>
        )}

        {viewMode === 'diff' && !isBase && (
          <div className="h-full overflow-auto bg-gray-50 p-4">
             {/* Unified Diff View */}
            <pre className="font-mono text-xs whitespace-pre overflow-x-auto">
              {diffContent.split('\n').map((line, idx) => {
                let colorClass = "text-gray-500";
                if (line.startsWith('+') && !line.startsWith('+++')) colorClass = "text-green-600 bg-green-50 block w-full";
                else if (line.startsWith('-') && !line.startsWith('---')) colorClass = "text-red-600 bg-red-50 block w-full";
                else if (line.startsWith('@@')) colorClass = "text-purple-600 block w-full mt-2 mb-1 font-bold";
                
                return (
                  <span key={idx} className={colorClass}>
                    {line}
                    {'\n'}
                  </span>
                );
              })}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
      active
        ? "bg-gray-100 text-gray-900"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
    )}
  >
    {icon}
    {label}
  </button>
);
