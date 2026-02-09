import { create } from 'zustand';
import { MarkdownDoc } from '../types';

interface DocState {
  docs: MarkdownDoc[];
  baseDocId: string | null;
  addDoc: () => void;
  removeDoc: (id: string) => void;
  updateDoc: (id: string, content: string) => void;
  updateName: (id: string, name: string) => void;
  setBaseDoc: (id: string) => void;
}

export const useDocStore = create<DocState>((set) => ({
  docs: [
    { id: '1', name: 'Document A (Base)', content: '# Hello World\n\nThis is the base document.' },
    { id: '2', name: 'Document B', content: '# Hello World\n\nThis is the comparison document.\n\nIt has some changes.' },
  ],
  baseDocId: '1',
  addDoc: () =>
    set((state) => {
      const newId = crypto.randomUUID();
      return {
        docs: [
          ...state.docs,
          { id: newId, name: `Document ${state.docs.length + 1}`, content: '' },
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
}));
