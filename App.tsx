import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Note, Project, Selection } from './types';
import { CATEGORIES } from './constants';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selection, setSelection] = useState<Selection>({ type: 'category', id: 'all' });
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);

  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      const [notesResponse, projectsResponse] = await Promise.all([
        supabase.from('notes').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: false })
      ]);

      if (notesResponse.error) {
        const errorMessage = getErrorMessage(notesResponse.error);
        console.error('Error fetching notes:', notesResponse.error);
        setError(`Failed to fetch notes: ${errorMessage}. This is often due to a missing 'notes' table or incorrect Row Level Security (RLS) policies in Supabase. Please ensure your table exists and that the 'anon' role has SELECT permissions.`);
        setLoading(false);
        return;
      }
      
      if (projectsResponse.error) {
        const errorMessage = getErrorMessage(projectsResponse.error);
        console.error('Error fetching projects:', projectsResponse.error);
        setError(`Failed to fetch projects: ${errorMessage}. Please check your 'projects' table and RLS policies.`);
        setLoading(false);
        return;
      }
      
      setNotes(notesResponse.data as Note[]);
      setProjects(projectsResponse.data as Project[]);

      if (notesResponse.data && notesResponse.data.length > 0) {
        setSelectedNoteId(notesResponse.data[0].id);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredNotes = useMemo(() => {
    if (selection.type === 'category') {
      if (selection.id === 'all') {
        return notes;
      }
      // When "Projects" category is selected, show all notes assigned to any project
      // OR notes with the explicit 'project' category.
      if (selection.id === 'project') {
        return notes.filter(note => note.project_id != null || note.category === 'project');
      }
      return notes.filter(note => note.category === selection.id);
    }
    if (selection.type === 'project') {
      return notes.filter(note => note.project_id === selection.id);
    }
    return notes;
  }, [notes, selection]);

  const handleNewNote = useCallback(async () => {
    const newNotePartial = {
      title: 'New Note',
      content: '',
      category: selection.type === 'category' && selection.id !== 'all' ? selection.id : 'general',
      project_id: selection.type === 'project' ? selection.id : null,
    };

    const { data, error: insertError } = await supabase.from('notes').insert(newNotePartial).select().single();

    if (insertError) {
      console.error('Error creating note:', insertError);
      alert(`Failed to create new note: ${getErrorMessage(insertError)}`);
    } else if (data) {
      setNotes(prevNotes => [data as Note, ...prevNotes]);
      setSelectedNoteId(data.id);
    }
  }, [selection]);

  const handleUpdateNote = useCallback(async (updatedNote: Note) => {
    // FIX: Omitted 'updated_at' from the update payload, assuming the database handles timestamps automatically.
    // This aligns with the updated Supabase client types.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, updated_at, ...updateData } = updatedNote;

    const { data, error: updateError } = await supabase.from('notes').update(updateData).eq('id', id).select().single();

    if (updateError) {
      console.error('Error updating note:', updateError);
      alert(`Failed to update note: ${getErrorMessage(updateError)}`);
    } else if (data) {
      setNotes(prevNotes => prevNotes.map(note => (note.id === data.id ? (data as Note) : note)));
    }
  }, []);

  const handleDeleteNote = useCallback(async (noteId: string) => {
    const currentVisibleNotes = filteredNotes;
    const deletedNoteIndex = currentVisibleNotes.findIndex(note => note.id === noteId);

    const { error: deleteError } = await supabase.from('notes').delete().eq('id', noteId);

    if (deleteError) {
        console.error('Error deleting note:', deleteError);
        alert(`Failed to delete note: ${getErrorMessage(deleteError)}`);
    } else {
        const newNotes = notes.filter(note => note.id !== noteId);
        setNotes(newNotes);

        if (selectedNoteId === noteId) {
            const newVisibleNotes = currentVisibleNotes.filter(note => note.id !== noteId);
            if (newVisibleNotes.length === 0) {
                setSelectedNoteId(null);
            } else {
                const newIndex = Math.min(deletedNoteIndex, newVisibleNotes.length - 1);
                setSelectedNoteId(newVisibleNotes[newIndex].id);
            }
        }
    }
  }, [notes, filteredNotes, selectedNoteId]);
  
  const handleStartNewProject = useCallback(() => {
    setIsCreatingProject(true);
  }, []);

  const handleCancelNewProject = useCallback(() => {
    setIsCreatingProject(false);
  }, []);

  const handleConfirmNewProject = useCallback(async (projectName: string) => {
    if (!projectName.trim()) {
      setIsCreatingProject(false);
      return;
    }
    const { data, error: insertError } = await supabase
      .from('projects')
      .insert({ name: projectName.trim() })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating project:', insertError);
      alert(`Failed to create new project: ${getErrorMessage(insertError)}`);
    } else if (data) {
      setProjects(prevProjects => [data as Project, ...prevProjects]);
      setSelection({ type: 'project', id: data.id });
    }
    setIsCreatingProject(false);
  }, []);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    const { error: updateError } = await supabase.from('notes').update({ project_id: null }).eq('project_id', projectId);
    if (updateError) {
        alert(`Failed to unassign notes from project: ${getErrorMessage(updateError)}`);
        return;
    }

    const { error: deleteError } = await supabase.from('projects').delete().eq('id', projectId);
    if (deleteError) {
        alert(`Failed to delete project: ${getErrorMessage(deleteError)}`);
        return;
    }

    setProjects(prev => prev.filter(p => p.id !== projectId));
    setNotes(prev => prev.map(n => n.project_id === projectId ? { ...n, project_id: null } : n));

    if (selection.type === 'project' && selection.id === projectId) {
        setSelection({ type: 'category', id: 'all' });
        setSelectedNoteId(notes.length > 0 ? notes[0].id : null);
    }
  }, [selection, notes]);

  const selectedNote = useMemo(() => {
    return notes.find(note => note.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  const listTitle = useMemo(() => {
    if (selection.type === 'category') {
      return CATEGORIES.find(c => c.id === selection.id)?.name || 'Notes';
    }
    if (selection.type === 'project') {
      return projects.find(p => p.id === selection.id)?.name || 'Project Notes';
    }
    return 'Notes';
  }, [selection, projects]);

  // Mobile view logic
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const showEditor = isMobile && selectedNoteId;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-gray-400">
        <p>Loading your notes and projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-center text-red-400 p-8">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans">
      {!showEditor && (
        <>
          <Sidebar
            categories={CATEGORIES}
            projects={projects}
            selection={selection}
            onSetSelection={setSelection}
            onNewProject={handleStartNewProject}
            onDeleteProject={handleDeleteProject}
            isCreatingProject={isCreatingProject}
            onConfirmNewProject={handleConfirmNewProject}
            onCancelNewProject={handleCancelNewProject}
          />
          <NoteList
            notes={filteredNotes}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            onNewNote={handleNewNote}
            title={listTitle}
          />
        </>
      )}

      <main className={`flex-1 transition-all duration-300 ${showEditor ? 'block' : 'md:block hidden'}`}>
        <NoteEditor
          key={selectedNote?.id || 'empty'}
          note={selectedNote}
          projects={projects}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onBack={() => setSelectedNoteId(null)}
        />
      </main>
    </div>
  );
};

export default App;
