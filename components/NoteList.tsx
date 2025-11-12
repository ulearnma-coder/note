
import React from 'react';
import type { Note } from '../types';
import IconButton from './IconButton';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
  title: string;
}

const PlusIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);


const NoteList: React.FC<NoteListProps> = ({ notes, selectedNoteId, onSelectNote, onNewNote, title }) => {
  return (
    <section className="w-80 bg-gray-800/50 border-r border-gray-700/50 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold truncate">{title}</h2>
        <IconButton onClick={onNewNote} aria-label="Create new note">
          {PlusIcon}
        </IconButton>
      </div>
      <div className="overflow-y-auto flex-1">
        {notes.length > 0 ? (
          <ul>
            {notes.map(note => (
              <li key={note.id}>
                <button
                  onClick={() => onSelectNote(note.id)}
                  className={`w-full text-left p-4 border-b border-gray-700/50 transition-colors duration-200 ${
                    selectedNoteId === note.id ? 'bg-indigo-600/20' : 'hover:bg-gray-700/30'
                  }`}
                >
                  <h3 className="font-semibold text-white truncate">{note.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{note.content || 'No content'}</p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-400">
            <p>No notes here.</p>
            <button onClick={onNewNote} className="mt-2 text-indigo-400 hover:underline text-sm">Create one?</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default NoteList;
