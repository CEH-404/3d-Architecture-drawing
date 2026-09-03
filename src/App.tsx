import React, { useState, useCallback, useEffect } from 'react';
import { ViewSettings, LightingState, CameraPreset, RoomDimensions, HousePlan, HouseRoom, SelectedObjectInfo, FurnitureItem } from './types';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Toolbar } from './components/Toolbar';
import { SpecsPanel } from './components/SpecsPanel';
import { LightingControls } from './components/LightingControls';
import { SightlineAnalyzer } from './components/SightlineAnalyzer';
import { DesignEditor } from './components/DesignEditor';
import { HouseMapDesigner2D } from './components/HouseMapDesigner2D';
import { SmartSuggestionsPanel } from './components/SmartSuggestionsPanel';
import { FurnitureCatalogDrawer } from './components/FurnitureCatalogDrawer';
import { ObjectCustomizerPanel } from './components/ObjectCustomizerPanel';
import { OneBedToFullHouseModal } from './components/OneBedToFullHouseModal';
import { ProjectTakeoffModal } from './components/ProjectTakeoffModal';
import { MeasurementInspector } from './components/MeasurementInspector';
import { RoomManagementModal } from './components/RoomManagementModal';
import { ArchitecturalHUD } from './components/ArchitecturalHUD';
import { ProjectDatabaseModal } from './components/ProjectDatabaseModal';
import { SiteEnvironmentModal } from './components/SiteEnvironmentModal';
import { DEFAULT_HOUSE_PLAN, DEFAULT_SITE_ENVIRONMENT } from './utils/houseTemplates';
import { formatDimension } from './utils/constants';
import { loadActiveProjectFromMemory, saveActiveProjectToMemory } from './utils/projectDatabase';
import { Sliders, Sparkles, Armchair, Box, Map, Building2, MousePointerClick } from 'lucide-react';

export default function App() {
  // Load saved active design from memory database if available
  const savedState = loadActiveProjectFromMemory();

  const [house, setHouse] = useState<HousePlan>(() => {
    if (savedState?.house && savedState.house.rooms?.length > 0) {
      return savedState.house;
    }
    return DEFAULT_HOUSE_PLAN;
  });

  const [activeRoomId, setActiveRoomId] = useState<string | null>(() => {
    if (savedState?.house?.activeRoomId) {
      return savedState.house.activeRoomId;
    }
    return savedState?.house?.rooms?.[0]?.id || DEFAULT_HOUSE_PLAN.rooms[0]?.id || null;
  });

  const [isExpanderModalOpen, setIsExpanderModalOpen] = useState<boolean>(false);
  const [isTakeoffModalOpen, setIsTakeoffModalOpen] = useState<boolean>(false);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState<boolean>(false);
  const [isRoomManagerOpen, setIsRoomManagerOpen] = useState<boolean>(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState<boolean>(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState<boolean>(false);

  const [settings, setSettings] = useState<ViewSettings>(() => ({
    viewMode: 'whole_house', // 'whole_house' | 'single_room' | 'map_2d'
    renderMode: 'raw_drywall',
    cameraPreset: 'isometric',
    unit: 'imperial',
    showDimensions: true,
    showSightlines: true,
    showStudFraming: false,
    showHumanFigure: true,
    showGrid: true,
    ceilingMode: 'open',
    wallCutawayHeight: 0,
    wallOpacity: 1.0,
    interactiveSightlineOrigin: 'door_threshold',
    is360Rotating: false,
    rotation360Speed: 1.0,
    rotation360Direction: 'cw',
    walkEyeHeight: 66,
    walkSpeed: 'normal',
    walkSoundEnabled: true,
    walkFlashlightEnabled: false,
    showMinimap: true,
    ...(savedState?.settings || {})
  }));

  const [lighting, setLighting] = useState<LightingState>(() => ({
    timeOfDay: 14.5, // 2:30 PM
    sunIntensity: 1.6,
    sunAzimuth: 45,
    sunElevation: 50,
    ambientIntensity: 0.85,
    shadowsEnabled: true,
    ...(savedState?.lighting || {})
  }));

  // Auto-save active project to memory database on any modification
  useEffect(() => {
    saveActiveProjectToMemory(house, settings, lighting);
  }, [house, settings, lighting]);

  const [activeDrawer, setActiveDrawer] = useState<
    'specs' | 'lighting' | 'sightline' | 'editor' | 'suggestions' | 'furniture' | null
  >(null);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // 3D Object Click-to-Customize state
  const [selectedObject, setSelectedObject] = useState<SelectedObjectInfo | null>(null);
  const [focusTrigger, setFocusTrigger] = useState<{ obj: SelectedObjectInfo; timestamp: number } | null>(null);

  // Active room reference
  const activeRoom: HouseRoom =
    house.rooms.find((r) => r.id === activeRoomId) ||
    house.rooms[0] || {
      id: 'default-room',
      name: 'Primary Bedroom',
      type: 'master_bedroom',
      colorTag: '#8B5CF6',
      gridX: 0,
      gridZ: 0,
      specs: house.rooms[0]?.specs,
      furniture: []
    };

  const handleUpdateRoomSpecs = useCallback(
    (updater: Partial<RoomDimensions>) => {
      setHouse((prev) => ({
        ...prev,
        rooms: prev.rooms.map((r) => {
          if (r.id === activeRoom.id) {
            return { ...r, specs: { ...r.specs, ...updater } };
          }
          return r;
        })
      }));
    },
    [activeRoom.id]
  );

  const handleUpdateRoomSpecsForRoom = useCallback(
    (roomId: string | undefined, updater: Partial<RoomDimensions>) => {
      const targetRoomId = roomId || activeRoom.id;
      setHouse((prev) => ({
        ...prev,
        rooms: prev.rooms.map((r) => {
          if (r.id === targetRoomId) {
            return { ...r, specs: { ...r.specs, ...updater } };
          }
          return r;
        })
      }));
    },
    [activeRoom.id]
  );

  const handleUpdateFurniture = useCallback(
    (roomId: string | undefined, updatedItem: FurnitureItem) => {
      const targetRoomId = roomId || activeRoom.id;
      setHouse((prev) => ({
        ...prev,
        rooms: prev.rooms.map((r) => {
          if (r.id === targetRoomId) {
            return {
              ...r,
              furniture: r.furniture.map((f) => (f.id === updatedItem.id ? updatedItem : f))
            };
          }
          return r;
        })
      }));

      setSelectedObject((prev) => {
        if (prev && prev.furnitureItem && prev.furnitureItem.id === updatedItem.id) {
          return {
            ...prev,
            name: updatedItem.name,
            furnitureItem: updatedItem
          };
        }
        return prev;
      });
    },
    [activeRoom.id]
  );

  const handleDuplicateFurniture = useCallback((roomId: string | undefined, item: FurnitureItem) => {
    const targetRoomId = roomId || activeRoom.id;
    const newItem: FurnitureItem = {
      ...item,
      id: `furn-${Date.now()}`,
      name: `${item.name} (Copy)`,
      x: (item.x || 0) + 18,
      z: (item.z || 0) + 18
    };
    setHouse((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => {
        if (r.id === targetRoomId) {
          return {
            ...r,
            furniture: [...r.furniture, newItem]
          };
        }
        return r;
      })
    }));
    setSelectedObject({
      type: 'furniture',
      id: newItem.id,
      name: newItem.name,
      roomId: targetRoomId,
      furnitureItem: newItem
    });
  }, [activeRoom.id]);

  const handleDeleteFurniture = useCallback((roomId: string | undefined, furnitureId: string) => {
    const targetRoomId = roomId || activeRoom.id;
    setHouse((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => {
        if (r.id === targetRoomId) {
          return {
            ...r,
            furniture: r.furniture.filter((f) => f.id !== furnitureId)
          };
        }
        return r;
      })
    }));
    setSelectedObject(null);
  }, [activeRoom.id]);

  const handleFocusObject = useCallback((obj: SelectedObjectInfo) => {
    setFocusTrigger({ obj, timestamp: Date.now() });
  }, []);

  const handleResetRoomSpecs = useCallback(() => {
    setHouse((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => {
        if (r.id === activeRoom.id) {
          return { ...r };
        }
        return r;
      })
    }));
  }, [activeRoom.id]);

  const handleUpdateSettings = useCallback((updater: Partial<ViewSettings>) => {
    setSettings((prev) => ({ ...prev, ...updater }));
  }, []);

  const handleUpdateLighting = useCallback((updater: Partial<LightingState>) => {
    setLighting((prev) => ({ ...prev, ...updater }));
  }, []);

  const handleSelectRoom = useCallback((roomId: string) => {
    setActiveRoomId(roomId);
    setHouse((prev) => ({ ...prev, activeRoomId: roomId }));
  }, []);

  const handleApplyExpandedHouse = useCallback((expandedHouse: HousePlan) => {
    setHouse(expandedHouse);
    setActiveRoomId(expandedHouse.activeRoomId || expandedHouse.rooms[0]?.id || null);
    setSettings((prev) => ({
      ...prev,
      viewMode: 'whole_house',
      cameraPreset: 'isometric'
    }));
  }, []);

  const handleCaptureSnapshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${(activeRoom.name || 'house_design').toLowerCase().replace(/\s+/g, '_')}-3d-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="relative w-screen h-screen bg-[#E4E3E0] text-[#141414] flex flex-col overflow-hidden font-sans">
      {/* Primary Viewport: 3D Canvas OR 2D CAD Map */}
      {settings.viewMode === 'map_2d' ? (
        <div className="absolute inset-0 z-0 pt-28">
          <HouseMapDesigner2D
            house={house}
            unit={settings.unit}
            onUpdateHouse={setHouse}
            onSelectRoom={(roomId) => {
              handleSelectRoom(roomId);
              setSettings((prev) => ({ ...prev, viewMode: 'single_room' }));
            }}
            onOpenSuggestions={() => setActiveDrawer('suggestions')}
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-0">
          <ThreeCanvas
            settings={settings}
            lighting={lighting}
            specs={activeRoom.specs}
            housePlan={house}
            onSelectRoom={handleSelectRoom}
            onSelectFeature={(feature) => setActiveHotspot(feature)}
            activeHotspot={activeHotspot}
            onCameraChange={(preset) => handleUpdateSettings({ cameraPreset: preset })}
            onUpdateSettings={handleUpdateSettings}
            selectedObject={selectedObject}
            onSelectObject={setSelectedObject}
            focusTrigger={focusTrigger}
          />
        </div>
      )}

      {/* Floating Header & Navigation Toolbar */}
      <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
        <Toolbar
          settings={settings}
          house={house}
          activeRoom={activeRoom}
          onUpdateSettings={handleUpdateSettings}
          onUpdateHouse={setHouse}
          onSelectRoom={handleSelectRoom}
          onCaptureSnapshot={handleCaptureSnapshot}
          onOpenExpanderModal={() => setIsExpanderModalOpen(true)}
          onOpenTakeoffModal={() => setIsTakeoffModalOpen(true)}
          onOpenMeasurementInspector={() => setIsMeasurementModalOpen(true)}
          onOpenRoomManager={() => setIsRoomManagerOpen(true)}
          onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
          onOpenSiteModal={() => setIsSiteModalOpen(true)}
          activeDrawer={activeDrawer}
          onToggleDrawer={(drawer) => setActiveDrawer(drawer)}
        />
      </header>

      {/* Floating Room Info Badge (Top Left of 3D Viewport) */}
      {settings.viewMode !== 'map_2d' && settings.cameraPreset !== 'first_person' && (
        <aside
          aria-label="Room details"
          className="hidden lg:flex flex-col gap-2.5 absolute top-28 left-6 z-20 pointer-events-auto select-none"
        >
          <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#141414]/15 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-xs space-y-1.5 w-64">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#0284C7] font-semibold">
                {activeRoom.name}
              </span>
              <span className="font-mono text-[10px] bg-[#EAE8E3] text-[#141414] px-1.5 py-0.5 rounded border border-[#141414]/10 font-medium">
                {settings.viewMode === 'whole_house' ? 'Whole House 3D' : 'Focused Room'}
              </span>
            </div>
            <div className="flex justify-between text-[#5A5A58]">
              <span>Dimensions (W × D):</span>
              <span className="font-mono font-medium text-[#141414]">
                {formatDimension(activeRoom.specs.width, settings.unit)} × {formatDimension(activeRoom.specs.depth, settings.unit)}
              </span>
            </div>
            <div className="flex justify-between text-[#5A5A58]">
              <span>Ceiling Height:</span>
              <span className="font-mono font-medium text-[#B45309]">
                {formatDimension(activeRoom.specs.height, settings.unit)}
              </span>
            </div>
            <div className="flex justify-between text-[#5A5A58]">
              <span>Furnishings Count:</span>
              <span className="font-mono font-semibold text-[#7C3AED]">
                {activeRoom.furniture.length} items
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-[#141414]/10">
              <button
                onClick={() => setActiveDrawer('editor')}
                className="py-1.5 px-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-[11px] font-medium flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
              >
                <Sliders className="w-3 h-3" />
                <span>Edit Room</span>
              </button>

              <button
                onClick={() => setActiveDrawer('furniture')}
                className="py-1.5 px-2 bg-[#FAF5FF] hover:bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE] rounded-xl text-[11px] font-medium flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Armchair className="w-3 h-3" />
                <span>Furnish</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (selectedObject) setSelectedObject(null);
              }}
              className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                selectedObject
                  ? 'bg-[#E0F2FE] border-[#38BDF8] text-[#0369A1] shadow-sm animate-pulse'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]'
              }`}
            >
              <MousePointerClick className="w-3.5 h-3.5 text-[#0284C7]" />
              <span className="truncate">
                {selectedObject ? `Selected: ${selectedObject.name} (Click to Deselect)` : 'Click Any 3D Object to Customize'}
              </span>
            </button>
          </div>
        </aside>
      )}

      {/* Floating Drawers */}
      {activeDrawer && (
        <div className="pointer-events-auto">
          {activeDrawer === 'furniture' ? (
            <FurnitureCatalogDrawer
              house={house}
              activeRoomId={activeRoom.id}
              onUpdateHouse={setHouse}
              onClose={() => setActiveDrawer(null)}
            />
          ) : (
            <section aria-label="Tool drawer" className="fixed top-24 right-4 sm:right-8 z-40 max-h-[85vh] overflow-visible">
              {activeDrawer === 'suggestions' && (
                <SmartSuggestionsPanel
                  house={house}
                  activeRoomId={activeRoom.id}
                  onUpdateHouse={setHouse}
                  onClose={() => setActiveDrawer(null)}
                />
              )}

              {activeDrawer === 'editor' && (
                <DesignEditor
                  specs={activeRoom.specs}
                  settings={settings}
                  onUpdateSpecs={handleUpdateRoomSpecs}
                  onResetSpecs={handleResetRoomSpecs}
                  onClose={() => setActiveDrawer(null)}
                />
              )}

              {activeDrawer === 'specs' && (
                <SpecsPanel
                  settings={settings}
                  activeRoom={activeRoom}
                  specs={activeRoom.specs}
                  onUpdateSpecs={handleUpdateRoomSpecs}
                  onClose={() => setActiveDrawer(null)}
                  onJumpToFeature={(preset: CameraPreset) => handleUpdateSettings({ cameraPreset: preset })}
                />
              )}

              {activeDrawer === 'lighting' && (
                <LightingControls
                  lighting={lighting}
                  settings={settings}
                  onUpdateLighting={handleUpdateLighting}
                  onUpdateSettings={handleUpdateSettings}
                  onClose={() => setActiveDrawer(null)}
                />
              )}

              {activeDrawer === 'sightline' && (
                <SightlineAnalyzer
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onClose={() => setActiveDrawer(null)}
                  onJumpToDoorway={() => {
                    handleUpdateSettings({ cameraPreset: 'doorway_eye' });
                    setActiveDrawer(null);
                  }}
                />
              )}
            </section>
          )}
        </div>
      )}

      {/* One-Bedroom to Full House Expander Modal */}
      {isExpanderModalOpen && (
        <OneBedToFullHouseModal
          currentRoom={activeRoom}
          onApplyExpandedHouse={handleApplyExpandedHouse}
          onClose={() => setIsExpanderModalOpen(false)}
        />
      )}

      {/* Architectural Project Spec Sheet & BOQ Takeoff Modal */}
      {isTakeoffModalOpen && (
        <ProjectTakeoffModal
          house={house}
          unit={settings.unit}
          onClose={() => setIsTakeoffModalOpen(false)}
        />
      )}

      {/* Architectural Clearance & Code Inspector Modal */}
      {isMeasurementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <MeasurementInspector
            room={activeRoom}
            unit={settings.unit}
            onClose={() => setIsMeasurementModalOpen(false)}
          />
        </div>
      )}

      {/* Room Directory & Management Modal */}
      {isRoomManagerOpen && (
        <RoomManagementModal
          house={house}
          activeRoomId={activeRoom.id}
          unit={settings.unit}
          onUpdateHouse={setHouse}
          onSelectRoom={handleSelectRoom}
          onClose={() => setIsRoomManagerOpen(false)}
        />
      )}

      {/* Project Database & Memory Manager Modal */}
      {isDatabaseModalOpen && (
        <ProjectDatabaseModal
          currentHouse={house}
          settings={settings}
          lighting={lighting}
          unit={settings.unit}
          onLoadProject={(loadedHouse, loadedSettings, loadedLighting) => {
            setHouse(loadedHouse);
            if (loadedSettings) setSettings((prev) => ({ ...prev, ...loadedSettings }));
            if (loadedLighting) setLighting((prev) => ({ ...prev, ...loadedLighting }));
            if (loadedHouse.rooms.length > 0) {
              setActiveRoomId(loadedHouse.rooms[0].id);
            }
          }}
          onClose={() => setIsDatabaseModalOpen(false)}
        />
      )}

      {/* Site Context, Roads & Surrounding Buildings Modal */}
      {isSiteModalOpen && (
        <SiteEnvironmentModal
          isOpen={isSiteModalOpen}
          site={house.siteEnvironment || DEFAULT_SITE_ENVIRONMENT}
          onUpdateSite={(updatedSite) => setHouse((prev) => ({ ...prev, siteEnvironment: updatedSite }))}
          onClose={() => setIsSiteModalOpen(false)}
          unit={settings.unit}
        />
      )}

      {/* 3D Click-to-Customize Object Customization Panel */}
      {selectedObject && (
        <ObjectCustomizerPanel
          selectedObject={selectedObject}
          house={house}
          activeRoom={activeRoom}
          settings={settings}
          onClose={() => setSelectedObject(null)}
          onFocusObject={handleFocusObject}
          onUpdateFurniture={handleUpdateFurniture}
          onDuplicateFurniture={handleDuplicateFurniture}
          onDeleteFurniture={handleDeleteFurniture}
          onUpdateRoomSpecs={handleUpdateRoomSpecsForRoom}
          onUpdateSettings={handleUpdateSettings}
          onUpdateHouse={setHouse}
        />
      )}

      {/* Floating Quick Architectural Controls HUD (Docked at bottom center) */}
      {settings.viewMode !== 'map_2d' && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <ArchitecturalHUD
            settings={settings}
            lighting={lighting}
            onUpdateSettings={handleUpdateSettings}
            onUpdateLighting={handleUpdateLighting}
            unit={settings.unit}
          />
        </div>
      )}

      {/* Footer Helper */}
      <footer className="absolute bottom-3 left-4 right-4 z-10 pointer-events-none flex items-center justify-between text-[11px] text-[#5A5A58] select-none">
        <div className="bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-[#141414]/15 shadow-sm pointer-events-auto hidden sm:block font-mono">
          360° Orbit: Left Drag • Pan: Right Drag • Walk Mode: WASD Keys / Joystick • Minimap: Click to Teleport
        </div>
        <div className="bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-[#141414]/15 shadow-sm pointer-events-auto font-mono">
          {house.name} • {house.rooms.length} Rooms
        </div>
      </footer>
    </div>
  );
}
