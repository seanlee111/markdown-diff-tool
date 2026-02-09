import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MarkdownDoc } from '../types';

export interface Asset {
  id: string;
  name: string;
  content: string;
  createdAt: number;
}

interface DocState {
  docs: MarkdownDoc[];
  baseDocId: string | null;
  assets: Asset[];
  addDoc: (initialContent?: string, initialName?: string) => void;
  removeDoc: (id: string) => void;
  updateDoc: (id: string, content: string) => void;
  updateName: (id: string, name: string) => void;
  setBaseDoc: (id: string) => void;
  // Asset actions
  fetchAssets: () => Promise<void>;
  addAsset: (name: string, content: string) => Promise<void>;
  removeAsset: (id: string) => Promise<void>;
}

export const useDocStore = create<DocState>()(
  persist(
    (set, get) => ({
      docs: [
        { id: '1', name: 'Document A (Base)', content: '# Hello World\n\nThis is the base document.' },
        { id: '2', name: 'Document B', content: '# Hello World\n\nThis is the comparison document.\n\nIt has some changes.' },
      ],
      baseDocId: '1',
      assets: [],
      
      addDoc: (initialContent = '', initialName) =>
        set((state) => {
          const newId = crypto.randomUUID();
          return {
            docs: [
              ...state.docs,
              { 
                id: newId, 
                name: initialName || `Document ${state.docs.length + 1}`, 
                content: initialContent 
              },
            ],
          };
        }),

      removeDoc: (id) =>
        set((state) => {
          const newDocs = state.docs.filter((doc) => doc.id !== id);
          // If we removed the base doc, reset baseDocId to the first available or null
          let newBaseId = state.baseDocId;
          if (state.baseDocId === id) {
            newBaseId = newDocs.length > 0 ? newDocs[0].id : null;
          }
          return { docs: newDocs, baseDocId: newBaseId };
        }),

      updateDoc: (id, content) =>
        set((state) => ({
          docs: state.docs.map((doc) =>
            doc.id === id ? { ...doc, content } : doc
          ),
        })),

      updateName: (id, name) =>
        set((state) => ({
          docs: state.docs.map((doc) =>
            doc.id === id ? { ...doc, name } : doc
          ),
        })),

      setBaseDoc: (id) => set({ baseDocId: id }),

      fetchAssets: async () => {
        try {
            const res = await fetch('/api/assets');
            if (res.ok) {
                const remoteAssets = await res.json();
                if (Array.isArray(remoteAssets)) {
                    set({ assets: remoteAssets });
                }
            }
        } catch (error) {
            console.error('Failed to fetch assets:', error);
        }
      },

      addAsset: async (name, content) => {
        const newAsset = { id: crypto.randomUUID(), name, content, createdAt: Date.now() };
        // Optimistic update
        set((state) => ({
          assets: [
            ...state.assets,
            newAsset
          ]
        }));
        
        // Sync to server
        try {
            await fetch('/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAsset)
            });
        } catch (error) {
            console.error('Failed to sync asset to server:', error);
        }
      },

      removeAsset: async (id) => {
        // Optimistic update
        set((state) => ({
          assets: state.assets.filter(a => a.id !== id)
        }));
        
        // Sync to server
        try {
            await fetch(`/api/assets?id=${id}`, { method: 'DELETE' });
        } catch (error) {
             console.error('Failed to delete asset from server:', error);
        }
      },
    }),
    {
      name: 'markdown-diff-storage',
      partialize: (state) => ({ assets: state.assets }), 
    }
  )
);
