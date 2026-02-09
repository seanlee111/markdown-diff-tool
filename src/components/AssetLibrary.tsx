import React, { useState, useRef } from 'react';
import { X, Save, FileText, Plus, Download, Trash2, Search, Upload } from 'lucide-react';
import { useDocStore } from '../store/useDocStore';
import { cn } from '../lib/utils';

interface AssetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ isOpen, onClose }) => {
  const { assets, addAsset, removeAsset, addDoc } = useDocStore();
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(search.toLowerCase()) || 
    asset.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        addAsset(file.name.replace(/\.md$/, ''), content);
      };
      reader.readAsText(file);
    });
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end transition-opacity duration-300">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Save className="w-5 h-5 text-blue-600" />
            Asset Library
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 space-y-4">
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search assets..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
            </div>
            
            <div className="flex gap-2">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    Import Files
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".md,.txt"
                    multiple 
                />
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredAssets.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm">No assets found.</p>
                    <p className="text-xs text-gray-400 mt-1">Import files or save from editor.</p>
                </div>
            ) : (
                filteredAssets.map(asset => (
                    <div key={asset.id} className="group bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <h3 className="font-medium text-gray-900 truncate max-w-[200px]" title={asset.name}>{asset.name}</h3>
                            </div>
                            <button 
                                onClick={() => removeAsset(asset.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                title="Delete Asset"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2 mb-3 font-mono bg-gray-50 p-2 rounded">
                            {asset.content.substring(0, 150)}
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => {
                                    addDoc(asset.content, asset.name);
                                    onClose();
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Use as Doc
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
            Assets are saved in your browser's local storage.
        </div>
      </div>
    </div>
  );
};
