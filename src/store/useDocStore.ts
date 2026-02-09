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
  addAsset: (name: string, content: string) => void;
  removeAsset: (id: string) => void;
}

export const useDocStore = create<DocState>()(
  persist(
    (set) => ({
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

      addAsset: (name, content) =>
        set((state) => ({
          assets: [
            ...state.assets,
            { id: crypto.randomUUID(), name, content, createdAt: Date.now() }
          ]
        })),

      removeAsset: (id) =>
        set((state) => ({
          assets: state.assets.filter(a => a.id !== id)
        })),
    }),
    {
      name: 'markdown-diff-storage',
      partialize: (state) => ({ assets: state.assets }), // Only persist assets, or persist everything? Let's persist assets mainly.
      // Actually, persisting docs might be annoying if user wants a fresh start. 
      // Let's persist ONLY assets for now as per requirement "cache these five assets".
    }
  )
);
