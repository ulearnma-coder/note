
import React, { useState, useEffect, useRef } from 'react';
import type { Category, Project, Selection } from '../types';
import IconButton from './IconButton';

interface SidebarProps {
  categories: Category[];
  projects: Project[];
  selection: Selection;
  onSetSelection: (selection: Selection) => void;
  onNewProject: () => void;
  onDeleteProject: (projectId: string) => void;
  isCreatingProject: boolean;
  onConfirmNewProject: (name: string) => void;
  onCancelNewProject: () => void;
}

const PlusIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


const Sidebar: React.FC<SidebarProps> = ({ 
  categories, 
  projects, 
  selection, 
  onSetSelection, 
  onNewProject, 
  onDeleteProject,
  isCreatingProject,
  onConfirmNewProject,
  onCancelNewProject,
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreatingProject) {
      inputRef.current?.focus();
      setNewProjectName('');
    }
  }, [isCreatingProject]);

  const handleConfirm = () => {
    onConfirmNewProject(newProjectName);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancelNewProject();
    }
  };


  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-700/50 p-4 shrink-0 hidden md:flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-6">Gemini Notes</h1>
      <nav className="flex-1 overflow-y-auto">
        <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</h2>
        <ul>
          {categories.map(category => (
            <li key={category.id}>
              <button
                onClick={() => onSetSelection({ type: 'category', id: category.id })}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm font-medium transition-colors duration-200 ${
                  selection.type === 'category' && selection.id === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6">
            <div className="flex justify-between items-center px-3 mb-2">
                 <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projects</h2>
                 <IconButton onClick={onNewProject} aria-label="Create new project" className="h-7 w-7">
                    {PlusIcon}
                 </IconButton>
            </div>
            <ul>
                {isCreatingProject && (
                  <li className="px-1 py-1">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0 ml-3"></span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={onCancelNewProject}
                        placeholder="New project name..."
                        className="w-full bg-gray-700 text-white text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </li>
                )}
                {projects.map(project => (
                    <li key={project.id} className="group flex items-center justify-between pr-1">
                      <button
                          onClick={() => onSetSelection({ type: 'project', id: project.id })}
                          className={`w-full flex items-center gap-3 pl-3 pr-2 py-2 rounded-md text-left text-sm font-medium transition-colors duration-200 truncate ${
                          selection.type === 'project' && selection.id === project.id
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                          }`}
                      >
                          <span className="w-2 h-2 rounded-full bg-green-400 shrink-0"></span>
                          <span className="truncate">{project.name}</span>
                      </button>
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                        aria-label={`Delete project ${project.name}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                      >
                        {TrashIcon}
                      </IconButton>
                    </li>
                ))}
            </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
