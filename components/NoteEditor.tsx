
import React, { useState, useEffect } from 'react';
import type { Note, Project } from '../types';
import { summarizeNote, suggestTags, extractActionItems } from '../services/geminiService';
import IconButton from './IconButton';

interface NoteEditorProps {
  note: Note | null;
  projects: Project[];
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onBack: () => void;
}

type AIFeature = 'summary' | 'tags' | 'actions';

const SparklesIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
const TagIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM17 17h.01M17 13h5a2 2 0 012 2v5a2 2 0 01-2 2h-5a2 2 0 01-2-2v-5a2 2 0 012-2z" />
  </svg>
);
const ChecklistIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);
const TrashIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const BackIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);


const NoteEditor: React.FC<NoteEditorProps> = ({ note, projects, onUpdateNote, onDeleteNote, onBack }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loadingAI, setLoadingAI] = useState<AIFeature | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Select a note to view or create a new one.</p>
      </div>
    );
  }

  const handleBlur = () => {
    if (title !== note.title || content !== note.content) {
      onUpdateNote({ ...note, title, content });
    }
  };
  
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectId = e.target.value;
    onUpdateNote({ ...note, project_id: newProjectId === "" ? null : newProjectId });
  };

  const handleDelete = () => {
    // Confirmation removed due to sandbox restrictions
    onDeleteNote(note.id);
  };

  const handleAIFeature = async (feature: AIFeature) => {
    setLoadingAI(feature);
    try {
        let updatedNote = { ...note };
        if (feature === 'summary') {
            const summary = await summarizeNote(note.content);
            updatedNote = { ...updatedNote, summary };
        } else if (feature === 'tags') {
            const tags = await suggestTags(note.content);
            const newTags = [...new Set([...(note.tags || []), ...tags])];
            updatedNote = { ...updatedNote, tags: newTags };
        } else if (feature === 'actions') {
            const actionItems = await extractActionItems(note.content);
            const newActionItems = [...new Set([...(note.action_items || []), ...actionItems])];
            updatedNote = { ...updatedNote, action_items: newActionItems };
        }
        onUpdateNote(updatedNote);
    } catch (error) {
        console.error(`Error with AI feature '${feature}':`, error);
        alert(`Failed to perform AI action. Please check the console for details.`);
    } finally {
        setLoadingAI(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-800">
        <header className="p-4 border-b border-gray-700/50 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="md:hidden p-2 rounded-full hover:bg-gray-700">
                {BackIcon}
            </button>
            <div className="flex items-center gap-2">
                <IconButton onClick={() => handleAIFeature('summary')} disabled={!content || !!loadingAI} aria-label="Summarize note"> {loadingAI === 'summary' ? '...': SparklesIcon} </IconButton>
                <IconButton onClick={() => handleAIFeature('tags')} disabled={!content || !!loadingAI} aria-label="Suggest tags"> {loadingAI === 'tags' ? '...': TagIcon} </IconButton>
                <IconButton onClick={() => handleAIFeature('actions')} disabled={!content || !!loadingAI} aria-label="Extract action items"> {loadingAI === 'actions' ? '...': ChecklistIcon} </IconButton>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ProjectSelector projects={projects} selectedProjectId={note.project_id} onChange={handleProjectChange} />
            <IconButton onClick={handleDelete} aria-label="Delete note" className="text-red-400 hover:text-red-300"> {TrashIcon} </IconButton>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={handleBlur}
                placeholder="Note Title"
                className="w-full bg-transparent text-3xl font-bold focus:outline-none mb-4"
            />
            <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                onBlur={handleBlur}
                placeholder="Start writing..."
                className="w-full bg-transparent text-base text-gray-300 focus:outline-none resize-none h-[calc(100vh-200px)] leading-relaxed"
            />
            {note.summary && <AIDataBlock title="Summary" content={[note.summary]} />}
            {note.tags && note.tags.length > 0 && <AIDataBlock title="Tags" items={note.tags} />}
            {note.action_items && note.action_items.length > 0 && <AIDataBlock title="Action Items" items={note.action_items} />}
        </div>
    </div>
  );
};

const ProjectSelector: React.FC<{
  projects: Project[];
  selectedProjectId: string | null | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ projects, selectedProjectId, onChange }) => (
  <select
    value={selectedProjectId || ""}
    onChange={onChange}
    className="bg-gray-700 border border-gray-600 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    <option value="">Unassigned</option>
    {projects.map(project => (
      <option key={project.id} value={project.id}>
        {project.name}
      </option>
    ))}
  </select>
);


const AIDataBlock: React.FC<{title: string, content?: string[], items?: string[]}> = ({title, content, items}) => (
    <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
        <h4 className="font-semibold text-indigo-400 mb-2">{title}</h4>
        {content && <p className="text-sm text-gray-300 whitespace-pre-wrap">{content.join('\n')}</p>}
        {items && (
            <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-700 text-xs text-gray-200 rounded-full">{item}</span>
                ))}
            </div>
        )}
    </div>
);

export default NoteEditor;
