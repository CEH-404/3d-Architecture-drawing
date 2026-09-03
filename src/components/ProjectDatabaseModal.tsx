import React, { useState, useEffect, useRef } from 'react';
import { HousePlan, ViewSettings, LightingState, MeasurementUnit } from '../types';
import {
  SavedProjectRecord,
  getAllSavedProjects,
  saveProjectToDatabase,
  deleteProjectFromDatabase,
  duplicateProjectInDatabase,
  exportProjectToFile,
  parseImportedProjectJSON,
  calculateHouseTotalSqFt,
  resetToFactoryDefault
} from '../utils/projectDatabase';
import { HOUSE_PRESETS } from '../utils/houseTemplates';
import {
  Database,
  HardDrive,
  Save,
  FolderOpen,
  Download,
  Upload,
  Trash2,
  Copy,
  Plus,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  X,
  FileJson,
  Building2,
  RefreshCw,
  Search
} from 'lucide-react';

interface ProjectDatabaseModalProps {
  currentHouse: HousePlan;
  settings: ViewSettings;
  lighting: LightingState;
  unit: MeasurementUnit;
  onLoadProject: (house: HousePlan, settings?: Partial<ViewSettings>, lighting?: Partial<LightingState>) => void;
  onClose: () => void;
}

export const ProjectDatabaseModal: React.FC<ProjectDatabaseModalProps> = ({
  currentHouse,
  settings,
  lighting,
  unit,
  onLoadProject,
  onClose
}) => {
  const [projects, setProjects] = useState<SavedProjectRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveName, setSaveName] = useState(currentHouse.name || '');
  const [saveDescription, setSaveDescription] = useState(currentHouse.description || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'saved' | 'save_current' | 'import_export' | 'new_project'>('saved');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshProjectList();
  }, []);

  const refreshProjectList = () => {
    const list = getAllSavedProjects();
    setProjects(list);
  };

  const handleSaveCurrent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!saveName.trim()) {
      setErrorMessage('Please enter a valid project name.');
      return;
    }

    const updatedHouse = { ...currentHouse, name: saveName.trim(), description: saveDescription.trim() };
    saveProjectToDatabase(
      saveName.trim(),
      updatedHouse,
      settings,
      lighting,
      saveDescription.trim()
    );

    setSaveSuccessMsg(`Project "${saveName.trim()}" successfully saved to Database Memory!`);
    setErrorMessage(null);
    refreshProjectList();
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setActiveTab('saved');
    }, 1500);
  };

  const handleLoad = (record: SavedProjectRecord) => {
    onLoadProject(record.house, record.settings, record.lighting);
    setSaveSuccessMsg(`Loaded "${record.name}" into 3D Workspace!`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from memory database?`)) {
      deleteProjectFromDatabase(id);
      refreshProjectList();
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateProjectInDatabase(id);
    refreshProjectList();
    setSaveSuccessMsg('Project cloned successfully in memory!');
    setTimeout(() => setSaveSuccessMsg(null), 2000);
  };

  const handleExport = (house: HousePlan, name: string) => {
    exportProjectToFile(house, name);
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedHouse = parseImportedProjectJSON(text);
        saveProjectToDatabase(importedHouse.name || 'Imported Design', importedHouse);
        refreshProjectList();
        onLoadProject(importedHouse);
        setSaveSuccessMsg(`Successfully restored and loaded "${importedHouse.name}"!`);
        setTimeout(() => onClose(), 1000);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStartTemplate = (presetId: string) => {
    const found = HOUSE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      const cloned = JSON.parse(JSON.stringify(found));
      onLoadProject(cloned);
      setSaveSuccessMsg(`Started new project from "${found.name}"!`);
      setTimeout(() => onClose(), 800);
    }
  };

  const handleStartBlank = () => {
    const blankHouse: HousePlan = {
      id: `house-blank-${Date.now()}`,
      name: 'New Custom Residence',
      description: 'Custom architectural floor plan built from scratch',
      activeRoomId: 'room-1',
      showRoof: false,
      showExteriorGround: true,
      showRoomLabels3D: true,
      wallCutawayHeight: 0,
      rooms: [
        {
          id: 'room-1',
          name: 'Main Living Space',
          type: 'living_room',
          colorTag: '#0284C7',
          gridX: 0,
          gridZ: 0,
          specs: {
            roomName: 'Main Living Space',
            width: 192,
            depth: 180,
            height: 120,
            doorWidth: 36,
            doorHeight: 80,
            doorOffsetLeft: 24,
            doorRemainingRight: 132,
            doorType: 'single_swing',
            doorOpenAngle: 90,
            doorHinge: 'left',
            windowWall: 'left',
            windowWidth: 72,
            windowHeight: 48,
            windowSillHeight: 36,
            windowOffsetFront: 36,
            windowOffsetBack: 72,
            windowMullions: 'clear',
            partitionDepth: 36,
            partitionHeight: 84,
            partitionThickness: 5,
            partitionPositionX: 72,
            partitionAttachedTo: 'door_edge_wing',
            partitionStyle: 'timber_slats',
            wallColor: '#F8FAFC',
            floorMaterial: 'hardwood',
            showPrayerMat: false,
            prayerMatCount: 1,
            prayerMatPattern: 'classic_emerald',
            showEntryBench: true,
            showBookshelf: true,
            showIndoorPlant: true,
            showPendantLight: true,
            showWallArt: false
          },
          furniture: []
        }
      ]
    };
    saveProjectToDatabase(blankHouse.name, blankHouse);
    onLoadProject(blankHouse);
    setSaveSuccessMsg('Created new custom project!');
    setTimeout(() => onClose(), 800);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentSqFt = calculateHouseTotalSqFt(currentHouse);
  const currentSqM = Math.round(currentSqFt * 0.092903);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-[#141414]/15 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAF9F5] border-b border-[#141414]/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold text-[#141414]">
                  Project Memory &amp; Database Manager
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                  Persistent Storage
                </span>
              </div>
              <p className="text-xs text-[#5A5A58]">
                Save, load, duplicate, backup, and restore your architectural projects with zero loss.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#EAE8E3] text-[#5A5A58] hover:text-[#141414] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Auto-Save Status Banner */}
        <div className="px-6 py-2.5 bg-[#F0FDF4] border-b border-[#BBF7D0] flex items-center justify-between text-xs text-[#15803D]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#16A34A]"></span>
            </span>
            <span className="font-semibold">Live Memory Status:</span>
            <span>
              Active project &quot;<strong>{currentHouse.name}</strong>&quot; ({currentHouse.rooms.length} Rooms, {unit === 'metric' ? `${currentSqM} m²` : `${currentSqFt} sq ft`}) is continuously auto-saved.
            </span>
          </div>

          <button
            onClick={() => setActiveTab('save_current')}
            className="px-2.5 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-semibold rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1"
          >
            <Save className="w-3 h-3" />
            <span>Save to New Slot</span>
          </button>
        </div>

        {/* Messages */}
        {saveSuccessMsg && (
          <div className="mx-6 mt-3 p-3 bg-[#DCFCE7] border border-[#86EFAC] rounded-xl text-xs font-semibold text-[#166534] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mx-6 mt-3 p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-xs font-semibold text-[#991B1B] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#141414]/10 bg-[#FAF9F5]">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-white text-[#0284C7] border-t-2 border-[#0284C7] shadow-xs'
                : 'text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Saved Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('save_current')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'save_current'
                ? 'bg-white text-[#0284C7] border-t-2 border-[#0284C7] shadow-xs'
                : 'text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save / Snapshot Active Design</span>
          </button>

          <button
            onClick={() => setActiveTab('import_export')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'import_export'
                ? 'bg-white text-[#0284C7] border-t-2 border-[#0284C7] shadow-xs'
                : 'text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup &amp; File Restore</span>
          </button>

          <button
            onClick={() => setActiveTab('new_project')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'new_project'
                ? 'bg-white text-[#0284C7] border-t-2 border-[#0284C7] shadow-xs'
                : 'text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project / Templates</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SAVED PROJECTS IN DATABASE */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#717170] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search saved designs..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[#FAF9F5] border border-[#141414]/15 rounded-xl text-xs focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div className="text-xs text-[#5A5A58] font-mono">
                  {filteredProjects.length} designs stored in browser memory
                </div>
              </div>

              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredProjects.map((proj) => {
                    const isCurrent = proj.house.id === currentHouse.id || proj.name === currentHouse.name;
                    const dateStr = new Date(proj.updatedAt || proj.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={proj.id}
                        className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                          isCurrent
                            ? 'bg-[#F0F9FF] border-[#38BDF8] shadow-xs'
                            : 'bg-white hover:bg-[#FAF9F5] border-[#141414]/15'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-serif font-bold text-sm text-[#141414]">
                                  {proj.name}
                                </h3>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0284C7] text-white uppercase">
                                    Active Now
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#5A5A58] mt-0.5 line-clamp-2">
                                {proj.description || 'Custom Architectural Project'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-3 text-[11px] text-[#717170] font-mono">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-[#0284C7]" />
                              {proj.roomCount || proj.house.rooms?.length || 1} Rooms
                            </span>
                            <span>•</span>
                            <span>
                              {unit === 'metric'
                                ? `${Math.round((proj.totalSqFt || 0) * 0.092903)} m²`
                                : `${proj.totalSqFt || 0} sq ft`}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {dateStr}
                            </span>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#141414]/10">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleExport(proj.house, proj.name)}
                              className="p-1.5 rounded-lg text-[#5A5A58] hover:text-[#141414] hover:bg-[#EAE8E3] transition"
                              title="Export .JSON Backup"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(proj.id)}
                              className="p-1.5 rounded-lg text-[#5A5A58] hover:text-[#141414] hover:bg-[#EAE8E3] transition"
                              title="Duplicate Project"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(proj.id, proj.name)}
                              className="p-1.5 rounded-lg text-[#DC2626] hover:bg-[#FEE2E2] transition"
                              title="Delete from Database"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleLoad(proj)}
                            className="px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#262626] text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Load into Studio</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#FAF9F5] rounded-2xl border border-dashed border-[#141414]/20">
                  <Database className="w-8 h-8 text-[#717170] mx-auto mb-2 opacity-50" />
                  <h4 className="text-sm font-serif font-bold text-[#141414]">No saved designs found</h4>
                  <p className="text-xs text-[#5A5A58] mt-1">
                    Save your current design or start a new architectural project.
                  </p>
                  <button
                    onClick={() => setActiveTab('save_current')}
                    className="mt-3 px-4 py-1.5 bg-[#0284C7] text-white rounded-xl text-xs font-semibold hover:bg-[#0369A1] transition cursor-pointer"
                  >
                    Save Current Design
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVE / SNAPSHOT CURRENT PROJECT */}
          {activeTab === 'save_current' && (
            <form onSubmit={handleSaveCurrent} className="space-y-4 max-w-lg mx-auto">
              <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#141414]/15 space-y-4">
                <h3 className="text-sm font-serif font-bold text-[#141414]">
                  Save Current Design to Database Slot
                </h3>
                <p className="text-xs text-[#5A5A58]">
                  This creates an independent, permanent snapshot record in browser database memory that will never be lost on page reload.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-[#141414] block">
                    Project Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="e.g., Islamic Sanctuary Villa or Modern Penthouse"
                    className="w-full px-3.5 py-2 bg-white border border-[#141414]/20 rounded-xl text-xs focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-[#141414] block">
                    Design Notes &amp; Specifications:
                  </label>
                  <textarea
                    rows={3}
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    placeholder="e.g., Client bedroom expansion with 7ft oak privacy partition and ADA clearance"
                    className="w-full px-3.5 py-2 bg-white border border-[#141414]/20 rounded-xl text-xs focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#141414]/10 text-xs text-[#5A5A58] space-y-1">
                  <div className="font-semibold text-[#141414]">Record Snapshot Summary:</div>
                  <div className="font-mono text-[11px]">
                    • Rooms: {currentHouse.rooms.length} ({currentHouse.rooms.map((r) => r.name).join(', ')})
                  </div>
                  <div className="font-mono text-[11px]">
                    • Area: {unit === 'metric' ? `${currentSqM} m²` : `${currentSqFt} sq ft`}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Design to Database Memory</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: IMPORT & EXPORT FILES */}
          {activeTab === 'import_export' && (
            <div className="space-y-6">
              {/* Export Box */}
              <div className="p-5 bg-[#FAF9F5] rounded-2xl border border-[#141414]/15 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#0284C7]" />
                  <h3 className="text-sm font-serif font-bold text-[#141414]">
                    Export Complete CAD Project File
                  </h3>
                </div>
                <p className="text-xs text-[#5A5A58]">
                  Downloads a complete standalone JSON backup containing all rooms, geometric specifications, furniture coordinates, materials, and wall finishes.
                </p>
                <button
                  onClick={() => handleExport(currentHouse, currentHouse.name)}
                  className="px-4 py-2 bg-[#141414] hover:bg-[#262626] text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <FileJson className="w-4 h-4 text-[#38BDF8]" />
                  <span>Download &quot;{currentHouse.name}&quot; Backup (.json)</span>
                </button>
              </div>

              {/* Import Box */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#16A34A]" />
                  <h3 className="text-sm font-serif font-bold text-[#141414]">
                    Import / Restore Design File
                  </h3>
                </div>
                <p className="text-xs text-[#5A5A58]">
                  Drag and drop any saved project JSON file or select from your computer to restore and load it immediately into memory.
                </p>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 rounded-2xl border-2 border-dashed text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    dragOver
                      ? 'border-[#0284C7] bg-[#E0F2FE]'
                      : 'border-[#141414]/20 bg-[#FAF9F5] hover:bg-[#F0EFEB]'
                  }`}
                >
                  <Upload className="w-8 h-8 text-[#0284C7]" />
                  <div className="text-xs font-semibold text-[#141414]">
                    Click to browse or drag &amp; drop CAD JSON file here
                  </div>
                  <div className="text-[11px] text-[#717170]">
                    Supports .json backup files and room specification blueprints
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NEW PROJECT & TEMPLATES */}
          {activeTab === 'new_project' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-serif font-bold text-[#141414]">
                  Start a New Project
                </h3>
                <p className="text-xs text-[#5A5A58]">
                  Choose between creating a blank architectural canvas or starting from a curated multi-room floorplan archetype.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Blank Canvas */}
                <div
                  onClick={handleStartBlank}
                  className="p-4 rounded-2xl border border-[#141414]/15 bg-white hover:bg-[#FAF9F5] hover:border-[#0284C7] transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mb-2">
                      <Plus className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-serif font-bold text-[#141414]">
                      Blank Custom Canvas
                    </h4>
                    <p className="text-[11px] text-[#5A5A58] mt-1">
                      Start completely from scratch with an empty room and design your layout manually.
                    </p>
                  </div>
                  <button className="mt-3 w-full py-1.5 bg-[#0284C7] text-white rounded-lg text-xs font-semibold">
                    Create Blank
                  </button>
                </div>

                {/* Templates */}
                {HOUSE_PRESETS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleStartTemplate(p.id)}
                    className="p-4 rounded-2xl border border-[#141414]/15 bg-white hover:bg-[#FAF9F5] hover:border-[#0284C7] transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] text-[#141414] border border-[#141414]/10 flex items-center justify-center mb-2">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-serif font-bold text-[#141414]">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-[#5A5A58] mt-1 line-clamp-2">
                        {p.description}
                      </p>
                      <div className="text-[10px] text-[#0284C7] font-mono mt-2">
                        {p.rooms.length} Rooms • {calculateHouseTotalSqFt(p)} sq ft
                      </div>
                    </div>
                    <button className="mt-3 w-full py-1.5 bg-[#141414] text-white rounded-lg text-xs font-semibold">
                      Load Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#FAF9F5] border-t border-[#141414]/10 text-xs">
          <button
            onClick={() => {
              if (window.confirm('Reset workspace to factory default? Unsaved changes in active view will be cleared.')) {
                const fresh = resetToFactoryDefault();
                onLoadProject(fresh);
                onClose();
              }
            }}
            className="text-[11px] text-[#717170] hover:text-[#DC2626] transition flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset to Factory Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#141414] text-white text-xs font-semibold rounded-xl hover:bg-[#262626] transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
