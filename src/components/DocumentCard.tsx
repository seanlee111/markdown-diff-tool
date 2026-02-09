import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { Trash2, Code, Eye, GitCompare, CheckCircle, Columns, FileText, Maximize2, X, Minimize2, Save, Download } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MarkdownDoc, ViewMode } from '../types';
import { useDocStore } from '../store/useDocStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DocumentCardProps {
  doc: MarkdownDoc;
  isBase: boolean;
  baseContent?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, isBase, baseContent }) => {
  const { removeDoc, updateDoc, setBaseDoc, updateName, addAsset, assets } = useDocStore();
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [splitView, setSplitView] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    if (isFullscreen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showAssetDropdown) return;
    const handleClick = () => setShowAssetDropdown(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [showAssetDropdown]);

  const handleSaveToLibrary = () => {
    if (!doc.content) return;
    addAsset(doc.name, doc.content);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };
  
  const handleLoadAsset = (content: string, name: string) => {
    updateDoc(doc.id, content);
    updateName(doc.id, name);
  };

  const renderDiffViewer = (isFull = false) => (
    <ReactDiffViewer
      oldValue={baseContent || ''}
      newValue={doc.content || ''}
      splitView={splitView}
      compareMethod={DiffMethod.WORDS}
      styles={{
        variables: {
          light: {
            codeFoldGutterBackground: '#f9fafb',
            codeFoldBackground: '#f3f4f6',
            gutterBackground: '#f9fafb',
            gutterColor: '#6b7280',
            diffViewerBackground: '#ffffff',
          }
        },
        lineNumber: {
           color: '#9ca3af',
        },
        content: {
           fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        },
        diffContainer: {
            fontSize: isFull ? '14px' : '12px',
        }
      }}
    />
  );

  return (
    <>
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
            {!isBase ? (
              <button
                onClick={() => setBaseDoc(doc.id)}
                className="text-xs flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Set as Base Document"
              >
                <CheckCircle className="w-3 h-3" />
                Set as Base
              </button>
            ) : (
               <span className="text-xs flex items-center gap-1 px-2 py-1 text-blue-600 bg-blue-50 rounded font-medium cursor-default">
                 <CheckCircle className="w-3 h-3" />
                 Base
               </span>
            )}

            <button
                onClick={handleSaveToLibrary}
                className={cn(
                    "text-xs flex items-center gap-1 px-2 py-1 rounded transition-all duration-200",
                    showSaveSuccess 
                        ? "text-green-600 bg-green-50" 
                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                )}
                title="Save to Asset Library"
            >
                {showSaveSuccess ? (
                    <>
                        <CheckCircle className="w-3 h-3" /> Saved
                    </>
                ) : (
                    <>
                        <Save className="w-3 h-3" /> Save
                    </>
                )}
            </button>

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
        <div className="flex items-center justify-between p-2 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-1">
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
                label="Diff"
              />
            )}
            
            {/* Quick Load Dropdown */}
            <div className="relative ml-2">
                <button
                    onClick={(e) => { e.stopPropagation(); setShowAssetDropdown(!showAssetDropdown); }}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Load from Library"
                >
                    <Download className="w-3.5 h-3.5" />
                    Load
                </button>
                
                {showAssetDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                        {assets.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-gray-500">Library is empty</div>
                        ) : (
                            assets.map(asset => (
                                <button
                                    key={asset.id}
                                    onClick={() => handleLoadAsset(asset.content, asset.name)}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 truncate"
                                    title={asset.name}
                                >
                                    {asset.name}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
          </div>
          
          {viewMode === 'diff' && !isBase && (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-md">
                    <button
                    onClick={() => setSplitView(true)}
                    className={cn(
                        "p-1 rounded text-xs flex items-center gap-1",
                        splitView ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"
                    )}
                    title="Split View"
                    >
                    <Columns className="w-3.5 h-3.5" />
                    <span className="sr-only">Split</span>
                    </button>
                    <button
                    onClick={() => setSplitView(false)}
                    className={cn(
                        "p-1 rounded text-xs flex items-center gap-1",
                        !splitView ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"
                    )}
                    title="Unified View"
                    >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="sr-only">Unified</span>
                    </button>
                </div>
                <div className="w-px h-4 bg-gray-200"></div>
                <button
                    onClick={() => setIsFullscreen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200 ml-2"
                    title="Enter Fullscreen Mode"
                >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Fullscreen
                </button>
            </div>
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
            <div className="h-full overflow-auto bg-white text-xs">
               {renderDiffViewer(false)}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && !isBase && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-200">
              {/* Fullscreen Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 shadow-sm">
                  <div className="flex items-center gap-4">
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <GitCompare className="w-5 h-5 text-blue-600" />
                          Diff: <span className="text-gray-500 font-normal">Base</span> vs <span className="text-blue-600">{doc.name}</span>
                      </h2>
                  </div>
                  
                  <div className="flex items-center gap-4">
                      {/* View Toggles in Fullscreen */}
                      <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-lg">
                        <button
                            onClick={() => setSplitView(true)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                                splitView ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            <Columns className="w-4 h-4" /> Split
                        </button>
                        <button
                            onClick={() => setSplitView(false)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                                !splitView ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            <FileText className="w-4 h-4" /> Unified
                        </button>
                      </div>

                      <div className="w-px h-6 bg-gray-300"></div>

                      <button 
                          onClick={() => setIsFullscreen(false)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                      >
                          <Minimize2 className="w-4 h-4" />
                          Exit Fullscreen
                      </button>
                  </div>
              </div>

              {/* Fullscreen Content */}
              <div className="flex-1 overflow-auto bg-white p-4">
                  <div className="max-w-[1920px] mx-auto bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
                    {renderDiffViewer(true)}
                  </div>
              </div>
          </div>
      )}
    </>
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
