import React, { useState } from 'react';
import { useDocStore } from './store/useDocStore';
import { DocumentCard } from './components/DocumentCard';
import { AssetLibrary } from './components/AssetLibrary';
import { Plus, FileDiff, Database } from 'lucide-react';

function App() {
  const { docs, baseDocId, addDoc } = useDocStore();
  const [isAssetLibraryOpen, setIsAssetLibraryOpen] = useState(false);

  const baseDoc = docs.find(d => d.id === baseDocId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <FileDiff className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Markdown Diff Tool</h1>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-500">
             <span className="hidden lg:inline mr-2">
               Comparing <strong>{docs.length}</strong> documents
               {baseDoc && (
                 <>
                   {' '}vs Base: <span className="text-blue-600 font-medium">{baseDoc.name}</span>
                 </>
               )}
             </span>
             
             <button
              onClick={() => setIsAssetLibraryOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium shadow-sm"
              title="Open Asset Library"
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </button>

             <button
              onClick={() => addDoc()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Document</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="max-w-[1920px] mx-auto">
          {docs.length === 0 ? (
             <div className="text-center py-20">
                <p className="text-gray-500 mb-4">No documents to compare.</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => addDoc()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create New Document
                  </button>
                  <button
                    onClick={() => setIsAssetLibraryOpen(true)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Load from Library
                  </button>
                </div>
             </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {docs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  isBase={doc.id === baseDocId}
                  baseContent={baseDoc?.content}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AssetLibrary isOpen={isAssetLibraryOpen} onClose={() => setIsAssetLibraryOpen(false)} />
    </div>
  );
}

export default App;
