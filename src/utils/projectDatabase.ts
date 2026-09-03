import { HousePlan, ViewSettings, LightingState } from '../types';
import { DEFAULT_HOUSE_PLAN, HOUSE_PRESETS } from './houseTemplates';

export interface SavedProjectRecord {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  roomCount: number;
  totalSqFt: number;
  house: HousePlan;
  settings?: Partial<ViewSettings>;
  lighting?: Partial<LightingState>;
}

const STORAGE_ACTIVE_PROJECT_KEY = 'cad_3d_active_house_v2';
const STORAGE_SAVED_PROJECTS_KEY = 'cad_3d_saved_projects_db_v2';

// Compute total sq ft helper
export function calculateHouseTotalSqFt(house: HousePlan): number {
  if (!house || !house.rooms) return 0;
  return Math.round(
    house.rooms.reduce((acc, r) => acc + (r.specs.width * r.specs.depth) / 144, 0)
  );
}

// 1. Auto-save current active project to browser localStorage memory
export function saveActiveProjectToMemory(
  house: HousePlan,
  settings?: ViewSettings,
  lighting?: LightingState
): void {
  try {
    const payload = {
      house,
      settings,
      lighting,
      savedAt: Date.now()
    };
    localStorage.setItem(STORAGE_ACTIVE_PROJECT_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to auto-save project to localStorage:', err);
  }
}

// 2. Load auto-saved active project from browser memory
export function loadActiveProjectFromMemory(): {
  house: HousePlan;
  settings?: ViewSettings;
  lighting?: LightingState;
  savedAt?: number;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_PROJECT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.house && Array.isArray(parsed.house.rooms) && parsed.house.rooms.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load active project from localStorage:', err);
  }
  return null;
}

// 3. Get all saved project records in database memory
export function getAllSavedProjects(): SavedProjectRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_PROJECTS_KEY);
    if (!raw) {
      // Seed default presets as initial saved projects if database is empty
      const initial: SavedProjectRecord[] = HOUSE_PRESETS.map((p, idx) => ({
        id: `project-preset-${p.id}`,
        name: p.name,
        description: p.description,
        createdAt: Date.now() - (idx + 1) * 86400000,
        updatedAt: Date.now() - (idx + 1) * 86400000,
        roomCount: p.rooms.length,
        totalSqFt: calculateHouseTotalSqFt(p),
        house: p
      }));
      localStorage.setItem(STORAGE_SAVED_PROJECTS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.warn('Failed to parse saved projects from database:', err);
  }
  return [];
}

// 4. Save or update a project record in database memory
export function saveProjectToDatabase(
  name: string,
  house: HousePlan,
  settings?: ViewSettings,
  lighting?: LightingState,
  description?: string,
  existingProjectId?: string
): SavedProjectRecord {
  const projects = getAllSavedProjects();
  const now = Date.now();
  const roomCount = house.rooms.length;
  const totalSqFt = calculateHouseTotalSqFt(house);

  let targetProject: SavedProjectRecord;

  if (existingProjectId) {
    const existingIndex = projects.findIndex((p) => p.id === existingProjectId);
    if (existingIndex !== -1) {
      targetProject = {
        ...projects[existingIndex],
        name: name || projects[existingIndex].name,
        description: description ?? projects[existingIndex].description,
        updatedAt: now,
        roomCount,
        totalSqFt,
        house: JSON.parse(JSON.stringify(house)),
        settings,
        lighting
      };
      projects[existingIndex] = targetProject;
    } else {
      targetProject = {
        id: existingProjectId,
        name: name || house.name || 'Untitled Design',
        description: description || 'Custom Architectural Project',
        createdAt: now,
        updatedAt: now,
        roomCount,
        totalSqFt,
        house: JSON.parse(JSON.stringify(house)),
        settings,
        lighting
      };
      projects.unshift(targetProject);
    }
  } else {
    targetProject = {
      id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name || house.name || 'Untitled Architectural Design',
      description: description || 'Custom Architectural Project',
      createdAt: now,
      updatedAt: now,
      roomCount,
      totalSqFt,
      house: JSON.parse(JSON.stringify(house)),
      settings,
      lighting
    };
    projects.unshift(targetProject);
  }

  try {
    localStorage.setItem(STORAGE_SAVED_PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to write project to localStorage database:', err);
  }

  return targetProject;
}

// 5. Delete a project from database
export function deleteProjectFromDatabase(projectId: string): boolean {
  try {
    const projects = getAllSavedProjects();
    const filtered = projects.filter((p) => p.id !== projectId);
    localStorage.setItem(STORAGE_SAVED_PROJECTS_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Failed to delete project:', err);
    return false;
  }
}

// 6. Duplicate a project in database
export function duplicateProjectInDatabase(projectId: string): SavedProjectRecord | null {
  const projects = getAllSavedProjects();
  const source = projects.find((p) => p.id === projectId);
  if (!source) return null;

  const now = Date.now();
  const copyHouse: HousePlan = JSON.parse(JSON.stringify(source.house));
  copyHouse.id = `house-copy-${now}`;
  copyHouse.name = `${source.name} (Copy)`;

  const dup: SavedProjectRecord = {
    ...JSON.parse(JSON.stringify(source)),
    id: `project-${now}-${Math.random().toString(36).substring(2, 6)}`,
    name: `${source.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
    house: copyHouse
  };

  projects.unshift(dup);
  try {
    localStorage.setItem(STORAGE_SAVED_PROJECTS_KEY, JSON.stringify(projects));
    return dup;
  } catch (err) {
    console.error('Failed to duplicate project:', err);
    return null;
  }
}

// 7. Export Project to JSON File download
export function exportProjectToFile(house: HousePlan, name?: string): void {
  const exportPayload = {
    format: '3D_ARCHITECTURAL_CAD_PLAN',
    version: '2.4',
    exportedAt: new Date().toISOString(),
    house,
    totalSqFt: calculateHouseTotalSqFt(house)
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${(name || house.name || 'architectural_project')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')}_backup.json`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 8. Parse and validate imported JSON file content
export function parseImportedProjectJSON(rawJson: string): HousePlan {
  const parsed = JSON.parse(rawJson);

  // If wrapped in format container
  if (parsed.house && Array.isArray(parsed.house.rooms) && parsed.house.rooms.length > 0) {
    return parsed.house;
  }

  // If raw HousePlan
  if (Array.isArray(parsed.rooms) && parsed.rooms.length > 0) {
    return parsed;
  }

  // If single RoomDimensions object imported
  if (parsed.width && parsed.depth && parsed.roomName) {
    return {
      id: `house-imported-${Date.now()}`,
      name: parsed.roomName || 'Imported Room Project',
      description: 'Imported from individual room specification',
      activeRoomId: 'imported-room-1',
      showRoof: false,
      showExteriorGround: true,
      showRoomLabels3D: true,
      wallCutawayHeight: 0,
      rooms: [
        {
          id: 'imported-room-1',
          name: parsed.roomName,
          type: 'custom',
          colorTag: '#0284C7',
          gridX: 0,
          gridZ: 0,
          specs: parsed,
          furniture: []
        }
      ]
    };
  }

  throw new Error('Unrecognized CAD floorplan JSON structure. Missing rooms array or specifications.');
}

// 9. Reset to default initial state
export function resetToFactoryDefault(): HousePlan {
  localStorage.removeItem(STORAGE_ACTIVE_PROJECT_KEY);
  return JSON.parse(JSON.stringify(DEFAULT_HOUSE_PLAN));
}
