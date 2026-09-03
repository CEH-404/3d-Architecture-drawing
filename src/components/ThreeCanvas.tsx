import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { ViewSettings, LightingState, CameraPreset, RoomDimensions, HousePlan, SelectedObjectInfo } from '../types';
import { DEFAULT_ROOM_SPECS, SCALE } from '../utils/constants';
import { createRoomMaterials, buildRoomShell } from './RoomGeometry';
import { buildSightlineVisualization } from './SightlineSimulator';
import { buildHouse3DPlan, buildFurnitureMesh } from './House3DGeometry';
import { ArchitecturalPlan2D } from './ArchitecturalPlan2D';
import { playFootstepSound } from '../utils/audioSynth';
import {
  RotateCw,
  RotateCcw,
  Play,
  Pause,
  Compass,
  Camera,
  Volume2,
  VolumeX,
  Flashlight,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  MapPin,
  Move,
  Layers,
  Sparkles,
  Home
} from 'lucide-react';

interface ThreeCanvasProps {
  settings: ViewSettings;
  lighting: LightingState;
  specs?: RoomDimensions;
  housePlan?: HousePlan;
  onSelectRoom?: (roomId: string) => void;
  onSelectFeature?: (featureName: string) => void;
  activeHotspot: string | null;
  onCameraChange?: (preset: CameraPreset) => void;
  onUpdateSettings?: (settings: Partial<ViewSettings>) => void;
  selectedObject?: SelectedObjectInfo | null;
  onSelectObject?: (obj: SelectedObjectInfo | null) => void;
  focusTrigger?: { obj: SelectedObjectInfo; timestamp: number } | null;
}

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl') || canvas.getContext('webgl2'))
    );
  } catch (e) {
    return false;
  }
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  settings,
  lighting,
  specs = DEFAULT_ROOM_SPECS,
  housePlan,
  onSelectRoom,
  onSelectFeature,
  activeHotspot,
  onCameraChange,
  onUpdateSettings,
  selectedObject,
  onSelectObject,
  focusTrigger
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [webglAvailable, setWebglAvailable] = useState<boolean>(true);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // 360-degree rotation states
  const [isAutoRotating360, setIsAutoRotating360] = useState<boolean>(settings.is360Rotating || false);
  const [rotation360Speed, setRotation360Speed] = useState<number>(settings.rotation360Speed || 1.0);
  const [rotation360Dir, setRotation360Dir] = useState<'cw' | 'ccw'>(settings.rotation360Direction || 'cw');
  const [currentAzimuthAngle, setCurrentAzimuthAngle] = useState<number>(0);

  // Walkthrough First-Person HUD states
  const [walkEyeHeight, setWalkEyeHeight] = useState<number>(settings.walkEyeHeight || 66); // inches (5'6")
  const [walkSpeedMode, setWalkSpeedMode] = useState<'stroll' | 'normal' | 'sprint'>(settings.walkSpeed || 'normal');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.walkSoundEnabled ?? true);
  const [flashlightEnabled, setFlashlightEnabled] = useState<boolean>(settings.walkFlashlightEnabled ?? false);
  const [showMinimap, setShowMinimap] = useState<boolean>(settings.showMinimap ?? true);
  const [playerPosition, setPlayerPosition] = useState<{ x: number; z: number; heading: number }>({ x: 0, z: 0, heading: 0 });
  const [currentRoomName, setCurrentRoomName] = useState<string>(specs.roomName || 'Active Room');

  // Flashlight ref
  const flashlightRef = useRef<THREE.SpotLight | null>(null);

  // Group references
  const currentRoomGroupRef = useRef<THREE.Group | null>(null);
  const currentDimensionsGroupRef = useRef<THREE.Group | null>(null);
  const currentSightlineGroupRef = useRef<THREE.Group | null>(null);
  const currentHouseGroupRef = useRef<THREE.Group | null>(null);
  const currentLabelsGroupRef = useRef<THREE.Group | null>(null);

  // Sun and ambient light refs
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  const isWholeHouseMode = settings.viewMode === 'whole_house' && !!housePlan;
  const isFirstPerson = settings.cameraPreset === 'first_person';

  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const settingsRef = useRef<ViewSettings>(settings);
  settingsRef.current = settings;
  const isFirstPersonRef = useRef<boolean>(isFirstPerson);
  isFirstPersonRef.current = isFirstPerson;

  const onSelectObjectRef = useRef(onSelectObject);
  onSelectObjectRef.current = onSelectObject;
  const onSelectRoomRef = useRef(onSelectRoom);
  onSelectRoomRef.current = onSelectRoom;
  const selectionHighlightGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Calculate center of scene
  const roomCenterRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.5, 0));

  useEffect(() => {
    if (isWholeHouseMode && housePlan && housePlan.rooms.length > 0) {
      let minX = 0, maxX = 100, minZ = 0, maxZ = 100;
      housePlan.rooms.forEach((r) => {
        if (r.gridX < minX) minX = r.gridX;
        if (r.gridX + r.specs.width > maxX) maxX = r.gridX + r.specs.width;
        if (r.gridZ < minZ) minZ = r.gridZ;
        if (r.gridZ + r.specs.depth > maxZ) maxZ = r.gridZ + r.specs.depth;
      });
      roomCenterRef.current.set(
        ((minX + maxX) / 2) * SCALE,
        1.5,
        ((minZ + maxZ) / 2) * SCALE
      );
    } else {
      roomCenterRef.current.set(
        (specs.width * SCALE) / 2,
        (specs.height * SCALE) / 2,
        (specs.depth * SCALE) / 2
      );
    }

    if (controlsRef.current && !isFirstPerson) {
      controlsRef.current.target.copy(roomCenterRef.current);
    }
  }, [isWholeHouseMode, housePlan, specs.width, specs.height, specs.depth, isFirstPerson]);

  // First-person movement state
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const lastFootstepTimeRef = useRef<number>(0);
  const joystickVectorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleRetryWebGL = useCallback(() => {
    setWebglError(null);
    setWebglAvailable(true);
    setRetryCount((prev) => prev + 1);
  }, []);

  // Initialize Scene with Safe WebGL Detection
  useEffect(() => {
    if (!containerRef.current) return;

    if (!isWebGLAvailable()) {
      setWebglAvailable(false);
      setWebglError('WebGL context is not supported or is disabled in this environment.');
      return;
    }

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    let renderer: THREE.WebGLRenderer | null = null;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'default'
      });
    } catch (err1) {
      console.warn('Initial WebGL creation failed, attempting low-spec fallback...', err1);
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false
        });
      } catch (err2) {
        console.error('All WebGL initialization attempts failed:', err2);
        setWebglAvailable(false);
        setWebglError(err2 instanceof Error ? err2.message : 'Could not create a WebGL context');
        return;
      }
    }

    if (!renderer) {
      setWebglAvailable(false);
      setWebglError('Could not initialize 3D WebGL renderer.');
      return;
    }

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(settings.renderMode === 'blueprint' ? '#0A111E' : '#E4E3E0');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.05, 200);
    camera.position.set(-4.5, 7.5, -5.5);
    cameraRef.current = camera;

    // 3. Configure Renderer
    try {
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      containerRef.current.replaceChildren(renderer.domElement);
      rendererRef.current = renderer;
    } catch (e) {
      console.error('Error configuring WebGL renderer:', e);
      setWebglAvailable(false);
      setWebglError(e instanceof Error ? e.message : 'Error setting up WebGL');
      return;
    }

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 0.2;
    controls.maxDistance = 80;
    controls.target.copy(roomCenterRef.current);
    controlsRef.current = controls;

    // 5. Lighting Setup
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd4d0c7, 0.85);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 16;
    sunLight.shadow.camera.bottom = -16;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);
    scene.add(sunLight.target);
    sunLightRef.current = sunLight;
    sunLight.target.position.copy(roomCenterRef.current);

    // Flashlight for First Person Walk Mode
    const spotLight = new THREE.SpotLight(0xfffaed, 2.5, 15, Math.PI / 6, 0.4, 1.5);
    spotLight.castShadow = true;
    spotLight.visible = false;
    scene.add(spotLight);
    scene.add(spotLight.target);
    flashlightRef.current = spotLight;

    // Ground plane
    const groundGeom = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.22 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.03;
    ground.receiveShadow = true;
    scene.add(ground);

    // Coordinate Grid Helper
    const gridHelper = new THREE.GridHelper(50, 50, 0x64748b, 0xcbd5e1);
    gridHelper.position.y = -0.028;
    gridHelper.visible = !!settingsRef.current.showGrid;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Selection Highlight Group
    scene.add(selectionHighlightGroupRef.current);

    // 3D Object Click-to-Customize Raycasting
    const pointerDownPos = { x: 0, y: 0, time: 0 };
    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos.x = e.clientX;
      pointerDownPos.y = e.clientY;
      pointerDownPos.time = Date.now();
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      const elapsed = Date.now() - pointerDownPos.time;

      // Only fire on distinct click (ignore camera orbit/pan drag)
      if (dist > 6 || elapsed > 450) return;
      if (!cameraRef.current || !sceneRef.current || !rendererRef.current) return;

      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

      let selectedMesh: THREE.Object3D | null = null;
      let selectedData: any = null;

      for (const hit of intersects) {
        if (hit.object === ground || hit.object === gridHelper) continue;
        if (
          hit.object.type === 'LineSegments' ||
          hit.object.type === 'GridHelper' ||
          hit.object.type === 'Box3Helper' ||
          hit.object.name?.startsWith('sightline')
        ) {
          continue;
        }

        let cur: THREE.Object3D | null = hit.object;
        while (cur && cur !== sceneRef.current) {
          if (cur.userData && cur.userData.selectable) {
            selectedMesh = cur;
            selectedData = cur.userData;
            break;
          }
          cur = cur.parent;
        }
        if (selectedMesh) break;
      }

      if (selectedData && selectedMesh) {
        const worldPos = new THREE.Vector3();
        selectedMesh.getWorldPosition(worldPos);

        const objInfo: SelectedObjectInfo = {
          type: selectedData.type,
          id: selectedData.id,
          name: selectedData.name || 'Selected Element',
          roomId: selectedData.roomId,
          roomName: selectedData.roomName,
          furnitureItem: selectedData.furnitureItem,
          wallPosition: selectedData.wallPosition,
          buildingId: selectedData.buildingId,
          worldPosition: { x: worldPos.x, y: worldPos.y, z: worldPos.z }
        };

        if (selectedData.roomId && onSelectRoomRef.current) {
          onSelectRoomRef.current(selectedData.roomId);
        }

        onSelectObjectRef.current?.(objInfo);
      } else {
        onSelectObjectRef.current?.(null);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!cameraRef.current || !sceneRef.current || !rendererRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

      let isSelectable = false;
      for (const hit of intersects) {
        if (hit.object === ground || hit.object === gridHelper) continue;
        if (hit.object.type === 'LineSegments' || hit.object.type === 'GridHelper' || hit.object.type === 'Box3Helper') continue;
        let cur: THREE.Object3D | null = hit.object;
        while (cur && cur !== sceneRef.current) {
          if (cur.userData && cur.userData.selectable) {
            isSelectable = true;
            break;
          }
          cur = cur.parent;
        }
        if (isSelectable) break;
      }

      if (rendererRef.current?.domElement) {
        rendererRef.current.domElement.style.cursor = isSelectable ? 'pointer' : 'grab';
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    // Keyboard handlers for Walkthrough
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Handle 360-Degree Continuous Turntable Rotation via OrbitControls
      if (controlsRef.current) {
        const isSpinning = !!settingsRef.current.is360Rotating && !isFirstPersonRef.current;
        controlsRef.current.autoRotate = isSpinning;
        const dirMultiplier = settingsRef.current.rotation360Direction === 'ccw' ? -2.2 : 2.2;
        controlsRef.current.autoRotateSpeed = (settingsRef.current.rotation360Speed || 1.5) * dirMultiplier;
      }

      // Compute Azimuth Angle for compass
      if (cameraRef.current && controlsRef.current) {
        const offset = cameraRef.current.position.clone().sub(controlsRef.current.target);
        let angleDeg = Math.round((Math.atan2(offset.x, offset.z) * 180) / Math.PI);
        if (angleDeg < 0) angleDeg += 360;
        setCurrentAzimuthAngle((prev) => (prev !== angleDeg ? angleDeg : prev));
      }

      // Handle First-Person Walking Movement
      if (isFirstPerson && cameraRef.current && controlsRef.current) {
        const cam = cameraRef.current;
        const targetHeight = (walkEyeHeight * SCALE);

        const forward = new THREE.Vector3();
        cam.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        const moveVec = new THREE.Vector3();

        // Keyboard inputs
        if (keysPressedRef.current['w'] || keysPressedRef.current['arrowup']) moveVec.add(forward);
        if (keysPressedRef.current['s'] || keysPressedRef.current['arrowdown']) moveVec.sub(forward);
        if (keysPressedRef.current['d'] || keysPressedRef.current['arrowright']) moveVec.add(right);
        if (keysPressedRef.current['a'] || keysPressedRef.current['arrowleft']) moveVec.sub(right);

        // Joystick inputs
        if (joystickVectorRef.current.y !== 0) {
          moveVec.add(forward.clone().multiplyScalar(-joystickVectorRef.current.y));
        }
        if (joystickVectorRef.current.x !== 0) {
          moveVec.add(right.clone().multiplyScalar(joystickVectorRef.current.x));
        }

        // Q & E keys rotate camera smoothly in first person
        if (keysPressedRef.current['q']) {
          const rotMatrix = new THREE.Matrix4().makeRotationY(0.04);
          forward.applyMatrix4(rotMatrix);
          controlsRef.current.target.copy(cam.position).add(forward.multiplyScalar(2.0));
        }
        if (keysPressedRef.current['e']) {
          const rotMatrix = new THREE.Matrix4().makeRotationY(-0.04);
          forward.applyMatrix4(rotMatrix);
          controlsRef.current.target.copy(cam.position).add(forward.multiplyScalar(2.0));
        }

        if (moveVec.lengthSq() > 0) {
          const speedScalar = walkSpeedMode === 'sprint' ? 0.15 : walkSpeedMode === 'stroll' ? 0.05 : 0.09;
          moveVec.normalize().multiplyScalar(speedScalar);
          const newPos = cam.position.clone().add(moveVec);
          newPos.y = targetHeight;
          cam.position.copy(newPos);
          controlsRef.current.target.add(moveVec);

          // Audio Footsteps
          const now = Date.now();
          const stepInterval = walkSpeedMode === 'sprint' ? 300 : walkSpeedMode === 'stroll' ? 600 : 420;
          if (soundEnabled && now - lastFootstepTimeRef.current > stepInterval) {
            playFootstepSound(specs.floorMaterial || 'hardwood');
            lastFootstepTimeRef.current = now;
          }
        } else {
          cam.position.y = targetHeight;
        }

        // Update Flashlight position & target
        if (flashlightRef.current) {
          flashlightRef.current.position.copy(cam.position);
          const flashlightTargetPos = cam.position.clone().add(forward.clone().multiplyScalar(6));
          flashlightRef.current.target.position.copy(flashlightTargetPos);
        }

        // Update player position state for Minimap
        const headingDeg = Math.round((Math.atan2(forward.x, forward.z) * 180) / Math.PI);
        setPlayerPosition({
          x: cam.position.x / SCALE,
          z: cam.position.z / SCALE,
          heading: headingDeg
        });

        // Determine current room if whole house
        if (housePlan && housePlan.rooms.length > 0) {
          const px = cam.position.x / SCALE;
          const pz = cam.position.z / SCALE;
          const found = housePlan.rooms.find(
            (r) =>
              px >= r.gridX &&
              px <= r.gridX + r.specs.width &&
              pz >= r.gridZ &&
              pz <= r.gridZ + r.specs.depth
          );
          if (found) {
            setCurrentRoomName(found.name);
          }
        }
      }

      controls.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (rendererRef.current?.domElement) {
        rendererRef.current.domElement.removeEventListener('pointerdown', handlePointerDown);
        rendererRef.current.domElement.removeEventListener('pointerup', handlePointerUp);
        rendererRef.current.domElement.removeEventListener('pointermove', handlePointerMove);
      }
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [retryCount, isAutoRotating360, rotation360Speed, rotation360Dir, isFirstPerson, walkEyeHeight, walkSpeedMode, soundEnabled, specs.floorMaterial, housePlan]);

  // Toggle Flashlight visibility
  useEffect(() => {
    if (flashlightRef.current) {
      flashlightRef.current.visible = isFirstPerson && flashlightEnabled;
    }
  }, [isFirstPerson, flashlightEnabled]);

  // Update Floor Grid Visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = !!settings.showGrid;
    }
  }, [settings.showGrid]);

  // Update Background Tone on Render Mode
  useEffect(() => {
    if (!sceneRef.current) return;
    if (settings.renderMode === 'blueprint') {
      sceneRef.current.background = new THREE.Color('#0A111E');
    } else if (settings.renderMode === 'clay') {
      sceneRef.current.background = new THREE.Color('#ECEBE8');
    } else if (settings.renderMode === 'xray') {
      sceneRef.current.background = new THREE.Color('#0B1120');
    } else {
      sceneRef.current.background = new THREE.Color('#E4E3E0');
    }
  }, [settings.renderMode]);

  // Update Sun and Sky Lighting with Plot Solar Alignment & Sunset
  useEffect(() => {
    if (!sunLightRef.current || !hemiLightRef.current || !sceneRef.current) return;

    const { timeOfDay, sunIntensity, ambientIntensity } = lighting;
    const plotNorthDeg = housePlan?.siteEnvironment?.plotOrientationNorth || 0;
    const northRad = (plotNorthDeg * Math.PI) / 180;

    // Solar angle throughout 24-hour day:
    const solarHour = Math.max(0, Math.min(24, timeOfDay));
    const dayProgress = (solarHour - 6) / 12; // 0 at 6 AM, 0.5 at 12 PM, 1.0 at 6 PM
    const baseElevation = Math.sin(dayProgress * Math.PI);

    // Azimuth: rotates with time of day, offset by True North heading
    const solarAzimuth = (solarHour / 24) * Math.PI * 2 - Math.PI / 2 + northRad;

    const sunDist = 22;
    const elevation = Math.max(0.04, baseElevation);
    const sunX = roomCenterRef.current.x + Math.cos(solarAzimuth) * sunDist;
    const sunZ = roomCenterRef.current.z + Math.sin(solarAzimuth) * sunDist;
    const sunY = Math.max(0.8, elevation * 16 + 1.2);

    sunLightRef.current.position.set(sunX, sunY, sunZ);
    sunLightRef.current.target.position.copy(roomCenterRef.current);

    const isSunset = solarHour >= 17.5 && solarHour <= 19.5;
    const isDawn = solarHour >= 5.5 && solarHour < 7.5;
    const isNight = solarHour > 20 || solarHour < 5;

    if (isSunset) {
      // Golden Hour / Sunset Amber Glow
      sunLightRef.current.color.setHex(0xff7a29);
      sunLightRef.current.intensity = sunIntensity * 1.6;
      hemiLightRef.current.color.setHex(0xffaa77);
      hemiLightRef.current.groundColor.setHex(0x382020);
      hemiLightRef.current.intensity = ambientIntensity * 0.9;
      if (settings.renderMode === 'raw_drywall') {
        sceneRef.current.background = new THREE.Color('#2b212c');
      }
    } else if (isDawn) {
      // Soft Morning Dawn
      sunLightRef.current.color.setHex(0xffd59e);
      sunLightRef.current.intensity = sunIntensity * 1.3;
      hemiLightRef.current.color.setHex(0xfff1cf);
      hemiLightRef.current.groundColor.setHex(0xd4d0c7);
      hemiLightRef.current.intensity = ambientIntensity;
      if (settings.renderMode === 'raw_drywall') {
        sceneRef.current.background = new THREE.Color('#dbeafe');
      }
    } else if (isNight) {
      // Twilight Moonlight
      sunLightRef.current.color.setHex(0x93c5fd);
      sunLightRef.current.intensity = 0.2;
      hemiLightRef.current.color.setHex(0x1e293b);
      hemiLightRef.current.groundColor.setHex(0x0f172a);
      hemiLightRef.current.intensity = 0.35;
      if (settings.renderMode === 'raw_drywall') {
        sceneRef.current.background = new THREE.Color('#090d16');
      }
    } else {
      // Standard Daytime
      sunLightRef.current.color.setHex(0xfffef7);
      sunLightRef.current.intensity = Math.max(0.5, elevation) * sunIntensity;
      hemiLightRef.current.color.setHex(0xffffff);
      hemiLightRef.current.groundColor.setHex(0xd4d0c7);
      hemiLightRef.current.intensity = ambientIntensity;
      if (settings.renderMode === 'raw_drywall') {
        sceneRef.current.background = new THREE.Color('#E4E3E0');
      }
    }
  }, [lighting, housePlan?.siteEnvironment?.plotOrientationNorth, settings.renderMode]);

  // Camera presets
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    const cam = cameraRef.current;
    const controls = controlsRef.current;
    const center = roomCenterRef.current;
    const eyeHeight = (walkEyeHeight * SCALE);

    if (isWholeHouseMode && housePlan) {
      switch (settings.cameraPreset) {
        case 'isometric':
          cam.position.set(center.x - 9, 13, center.z - 9);
          controls.target.copy(center);
          break;
        case 'top_down':
          cam.position.set(center.x, 22, center.z + 0.001);
          controls.target.copy(center);
          break;
        case 'first_person':
          cam.position.set(center.x, eyeHeight, center.z - 2);
          controls.target.set(center.x, eyeHeight, center.z + 2);
          break;
        default:
          cam.position.set(center.x - 8, 10, center.z - 8);
          controls.target.copy(center);
          break;
      }
    } else {
      const W = specs.width * SCALE;
      const D = specs.depth * SCALE;
      const doorCenter = (specs.doorOffsetLeft + specs.doorWidth / 2) * SCALE;

      switch (settings.cameraPreset) {
        case 'doorway_eye':
          cam.position.set(doorCenter, eyeHeight, -0.6);
          controls.target.set(doorCenter + 0.2, eyeHeight - 0.05, 3.0);
          break;
        case 'isometric':
          cam.position.set(-2.8, 4.2, -3.2);
          controls.target.copy(center);
          break;
        case 'top_down':
          cam.position.set(W / 2, Math.max(6, Math.max(W, D) * 1.6), D / 2 + 0.001);
          controls.target.set(W / 2, 0, D / 2);
          break;
        case 'inside_qibla':
          cam.position.set(W / 2, eyeHeight, 0.8);
          controls.target.set(W / 2, eyeHeight * 0.9, D);
          break;
        case 'window_view':
          cam.position.set(W - 0.4, eyeHeight, (specs.windowOffsetFront + specs.windowWidth / 2) * SCALE);
          controls.target.set(0, (specs.windowSillHeight + specs.windowHeight / 2) * SCALE, cam.position.z);
          break;
        case 'partition_closeup':
          const partX = (specs.partitionPositionX || (specs.doorOffsetLeft + specs.doorWidth)) * SCALE;
          cam.position.set(partX - 1.2, 1.8, 0.3);
          controls.target.set(partX + 0.1, 1.4, (specs.partitionDepth * SCALE) / 2);
          break;
        case 'first_person':
          cam.position.set(doorCenter, eyeHeight, 0.3);
          controls.target.set(doorCenter, eyeHeight, 2.5);
          break;
      }
    }

    controls.update();
  }, [settings.cameraPreset, isWholeHouseMode, housePlan, specs, walkEyeHeight]);

  // Rebuild 3D Geometry
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clean up previous groups
    if (currentRoomGroupRef.current) scene.remove(currentRoomGroupRef.current);
    if (currentDimensionsGroupRef.current) scene.remove(currentDimensionsGroupRef.current);
    if (currentSightlineGroupRef.current) scene.remove(currentSightlineGroupRef.current);
    if (currentHouseGroupRef.current) scene.remove(currentHouseGroupRef.current);
    if (currentLabelsGroupRef.current) scene.remove(currentLabelsGroupRef.current);

    const materials = createRoomMaterials(settings.renderMode, settings.wallOpacity, specs);

    if (isWholeHouseMode && housePlan) {
      // Build Full House 3D
      const { houseGroup, labelsGroup } = buildHouse3DPlan(
        housePlan,
        materials,
        settings,
        onSelectRoom
      );
      scene.add(houseGroup);
      currentHouseGroupRef.current = houseGroup;

      scene.add(labelsGroup);
      currentLabelsGroupRef.current = labelsGroup;
    } else {
      // Build Single Room 3D
      const { roomGroup, dimensionsGroup } = buildRoomShell(materials, settings, specs);
      const { sightlineGroup } = buildSightlineVisualization(settings, specs);

      // Render all active room furniture in Single Room mode
      const activeRoom =
        housePlan?.rooms.find(
          (r) => r.id === housePlan.activeRoomId || r.specs.roomName === specs.roomName
        ) || housePlan?.rooms[0];

      if (activeRoom && activeRoom.furniture) {
        activeRoom.furniture.forEach((item) => {
          if (item.enabled !== false) {
            const mesh = buildFurnitureMesh(item, materials, activeRoom?.id, activeRoom?.name);
            mesh.position.x = (specs.width * SCALE) / 2 + (item.x || 0) * SCALE;
            mesh.position.z = (specs.depth * SCALE) / 2 + (item.z || 0) * SCALE;
            mesh.position.y = (item.y || 0) * SCALE;
            roomGroup.add(mesh);
          }
        });
      }

      scene.add(roomGroup);
      currentRoomGroupRef.current = roomGroup;

      scene.add(dimensionsGroup);
      currentDimensionsGroupRef.current = dimensionsGroup;

      scene.add(sightlineGroup);
      currentSightlineGroupRef.current = sightlineGroup;
    }
  }, [
    isWholeHouseMode,
    housePlan,
    housePlan?.siteEnvironment,
    settings.renderMode,
    settings.unit,
    settings.showDimensions,
    settings.showSightlines,
    settings.showStudFraming,
    settings.showHumanFigure,
    settings.ceilingMode,
    settings.wallCutawayHeight,
    settings.wallOpacity,
    settings.interactiveSightlineOrigin,
    specs
  ]);

  // Visual Selection Highlight Bounding Box, Footprint Ring & Beacon
  useEffect(() => {
    const highlightGroup = selectionHighlightGroupRef.current;
    if (!highlightGroup || !sceneRef.current) return;

    // Clear previous highlights
    while (highlightGroup.children.length > 0) {
      const child = highlightGroup.children[0];
      highlightGroup.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
    }

    if (!selectedObject) return;

    let targetMesh: THREE.Object3D | null = null;
    sceneRef.current.traverse((obj) => {
      if (targetMesh) return;
      if (obj.userData && obj.userData.id === selectedObject.id) {
        targetMesh = obj;
      }
    });

    if (targetMesh) {
      const box = new THREE.Box3().setFromObject(targetMesh);
      if (!box.isEmpty()) {
        // Sky blue highlight bounding frame
        const boxHelper = new THREE.Box3Helper(box, new THREE.Color(0x0284c7));
        highlightGroup.add(boxHelper);

        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);

        // Ground footprint ring
        const radius = Math.max(0.2, Math.hypot(size.x, size.z) / 2 + 0.05);
        const ringGeom = new THREE.RingGeometry(radius, radius + 0.035, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.set(center.x, 0.005, center.z);
        highlightGroup.add(ringMesh);

        // Floating diamond indicator
        const beaconGeom = new THREE.OctahedronGeometry(0.12);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const beacon = new THREE.Mesh(beaconGeom, beaconMat);
        beacon.position.set(center.x, box.max.y + 0.24, center.z);
        highlightGroup.add(beacon);
      }
    }
  }, [selectedObject, housePlan, specs]);

  // Smooth Camera Focus on Selected Object
  useEffect(() => {
    if (!focusTrigger || !cameraRef.current || !controlsRef.current || !sceneRef.current) return;
    const { obj } = focusTrigger;
    let targetMesh: THREE.Object3D | null = null;

    sceneRef.current.traverse((child) => {
      if (targetMesh) return;
      if (child.userData && child.userData.id === obj.id) {
        targetMesh = child;
      }
    });

    if (targetMesh) {
      const box = new THREE.Box3().setFromObject(targetMesh);
      if (!box.isEmpty()) {
        const center = new THREE.Vector3();
        box.getCenter(center);

        controlsRef.current.target.copy(center);
        const maxDim = Math.max(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z);
        const dist = Math.max(2.2, maxDim * 2.5);

        cameraRef.current.position.set(
          center.x - dist * 0.7,
          center.y + dist * 0.8,
          center.z - dist * 0.7
        );
        controlsRef.current.update();
      }
    }
  }, [focusTrigger]);

  // Jump to 360 degree angle preset
  const handleJumpTo360Angle = (targetDeg: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const target = controlsRef.current.target;
    const rad = (targetDeg * Math.PI) / 180;
    const dist = isWholeHouseMode ? 14 : 5.5;
    const height = isWholeHouseMode ? 9 : 3.8;

    cam.position.set(
      target.x + dist * Math.sin(rad),
      height,
      target.z + dist * Math.cos(rad)
    );
    controlsRef.current.update();
  };

  // Teleport Walker via Minimap click
  const handleTeleportWalker = (worldX: number, worldZ: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const target = controlsRef.current.target;
    const currentDir = new THREE.Vector3();
    cam.getWorldDirection(currentDir);
    currentDir.y = 0;
    currentDir.normalize();

    cam.position.set(worldX * SCALE, (walkEyeHeight * SCALE), worldZ * SCALE);
    target.copy(cam.position).add(currentDir.multiplyScalar(2.5));
    controlsRef.current.update();
  };

  if (!webglAvailable) {
    return (
      <ArchitecturalPlan2D
        settings={settings}
        lighting={lighting}
        onUpdateSettings={onUpdateSettings}
        onRetryWebGL={handleRetryWebGL}
        webglErrorMessage={webglError}
      />
    );
  }

  return (
    <div className="relative w-full h-full select-none overflow-hidden" ref={containerRef}>
      {/* 1. 360-DEGREE VIEW CONTROLS & COMPASS HUD (When NOT in Walk Mode) */}
      {!isFirstPerson && (
        <div className="absolute bottom-6 left-6 z-20 pointer-events-auto flex flex-col gap-2">
          {/* 360 Degree Turntable Floating Card */}
          <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#141414]/15 shadow-lg flex flex-col gap-2.5 min-w-[280px]">
            {/* Header: Live Azimuth Compass & Auto-Rotate Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-6 h-6 rounded-full border border-[#0284C7] bg-[#E0F2FE] flex items-center justify-center">
                  <Compass
                    className="w-4 h-4 text-[#0284C7] transition-transform duration-75"
                    style={{ transform: `rotate(${currentAzimuthAngle}deg)` }}
                  />
                </div>
                <div>
                  <div className="text-[11px] font-bold font-mono text-[#141414]">
                    360° Angle: {currentAzimuthAngle}°
                  </div>
                  <div className="text-[9px] text-[#5A5A58] uppercase tracking-wider font-mono">
                    {currentAzimuthAngle >= 315 || currentAzimuthAngle < 45
                      ? 'North / Front'
                      : currentAzimuthAngle < 135
                      ? 'East / Right'
                      : currentAzimuthAngle < 225
                      ? 'South / Back'
                      : 'West / Left'}
                  </div>
                </div>
              </div>

              {/* 360 Auto-Rotate Play/Pause */}
              <button
                onClick={() => setIsAutoRotating360(!isAutoRotating360)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isAutoRotating360
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#141414] border border-[#141414]/15'
                }`}
                title={isAutoRotating360 ? 'Pause 360° Auto-Rotation' : 'Start 360° Continuous Turntable'}
              >
                {isAutoRotating360 ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoRotating360 ? 'Rotating' : '360° View'}</span>
              </button>
            </div>

            {/* Rotation Controls Sub-Bar (Speed & Direction) */}
            {isAutoRotating360 && (
              <div className="flex items-center justify-between pt-1 border-t border-[#141414]/10 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#717170] font-mono mr-1">Speed:</span>
                  {[0.5, 1.0, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRotation360Speed(s)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition cursor-pointer ${
                        rotation360Speed === s
                          ? 'bg-[#141414] text-white'
                          : 'bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#5A5A58]'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setRotation360Dir(rotation360Dir === 'cw' ? 'ccw' : 'cw')}
                  className="p-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#141414] border border-[#141414]/10 transition cursor-pointer"
                  title="Reverse 360° Rotation Direction"
                >
                  {rotation360Dir === 'cw' ? <RotateCw className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Quick 360° Angle Presets */}
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#141414]/10">
              <span className="text-[10px] font-mono uppercase text-[#717170] mr-1">Snap:</span>
              {[
                { deg: 0, label: '0° Front' },
                { deg: 45, label: '45° Iso' },
                { deg: 90, label: '90° East' },
                { deg: 180, label: '180° Back' },
                { deg: 270, label: '270° West' }
              ].map((p) => (
                <button
                  key={p.deg}
                  onClick={() => handleJumpTo360Angle(p.deg)}
                  className="px-1.5 py-0.5 bg-[#FAF9F5] hover:bg-[#0284C7] hover:text-white rounded text-[10px] font-mono text-[#5A5A58] border border-[#141414]/10 transition cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. FULL 3D WALK-IN EXPERIENCE HUD (When in Walk Mode) */}
      {isFirstPerson && (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between pt-28 pb-6 px-6">
          {/* Top Walk Mode Header (Positioned below the main toolbar) */}
          <div className="flex items-center justify-between w-full pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#141414]/15 shadow-md flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
              <div>
                <span className="text-xs font-bold text-[#141414] font-serif">
                  3D Walk-In Walkthrough
                </span>
                <span className="mx-2 text-[#717170]">•</span>
                <span className="text-xs font-semibold text-[#0284C7] font-mono">
                  {currentRoomName}
                </span>
              </div>
            </div>

            {/* Walk Controls Bar (Eye Level, Speed, Sound, Flashlight) */}
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[#141414]/15 shadow-md">
              {/* Eye Height Selector */}
              <div className="flex items-center gap-1 text-xs">
                <Eye className="w-3.5 h-3.5 text-[#5A5A58]" />
                <select
                  value={walkEyeHeight}
                  onChange={(e) => setWalkEyeHeight(Number(e.target.value))}
                  className="text-xs font-mono font-medium text-[#141414] bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value={66}>5' 6" Eye Level (Standing)</option>
                  <option value={44}>3' 8" Eye Level (Seated)</option>
                  <option value={48}>4' 0" Eye Level (Child)</option>
                  <option value={96}>8' 0" Vantage Sightline</option>
                </select>
              </div>

              <div className="h-4 w-px bg-[#141414]/15 mx-1" />

              {/* Speed Mode */}
              <div className="flex items-center gap-1">
                {(['stroll', 'normal', 'sprint'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setWalkSpeedMode(mode)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold transition cursor-pointer ${
                      walkSpeedMode === mode
                        ? 'bg-[#141414] text-white'
                        : 'bg-[#FAF9F5] text-[#5A5A58] hover:text-[#141414]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-[#141414]/15 mx-1" />

              {/* Sound Footsteps Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-xl border transition cursor-pointer ${
                  soundEnabled
                    ? 'bg-[#FAF9F5] text-[#0284C7] border-[#0284C7]/30'
                    : 'bg-[#FAF9F5] text-[#717170] border-[#141414]/15'
                }`}
                title={soundEnabled ? 'Disable Footstep Sound' : 'Enable Footstep Sound'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Flashlight Toggle */}
              <button
                onClick={() => setFlashlightEnabled(!flashlightEnabled)}
                className={`p-1.5 rounded-xl border transition cursor-pointer ${
                  flashlightEnabled
                    ? 'bg-[#FEF3C7] text-[#D97706] border-[#F59E0B]/40'
                    : 'bg-[#FAF9F5] text-[#717170] border-[#141414]/15'
                }`}
                title={flashlightEnabled ? 'Turn Off Flashlight' : 'Turn On Flashlight (Dark Simulation)'}
              >
                <Flashlight className="w-3.5 h-3.5" />
              </button>

              {/* Minimap Toggle */}
              <button
                onClick={() => setShowMinimap(!showMinimap)}
                className={`p-1.5 rounded-xl border transition cursor-pointer ${
                  showMinimap
                    ? 'bg-[#E0F2FE] text-[#0284C7] border-[#0284C7]/30'
                    : 'bg-[#FAF9F5] text-[#717170] border-[#141414]/15'
                }`}
                title="Toggle Live 2D Minimap Radar"
              >
                <MapPin className="w-3.5 h-3.5" />
              </button>

              {/* Exit Walk Mode */}
              <button
                onClick={() => {
                  onCameraChange?.('isometric');
                  onUpdateSettings?.({ cameraPreset: 'isometric' });
                }}
                className="ml-1 px-2.5 py-1 bg-[#141414] hover:bg-[#2D2D2D] text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-sm"
              >
                Exit Walk Mode
              </button>
            </div>
          </div>

          {/* Center Aiming Sightline Crosshair Reticle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <div className="w-3 h-3 rounded-full border border-[#0284C7] bg-[#0284C7]/30 animate-pulse" />
          </div>

          {/* Bottom Walk Controls & Live Minimap Radar */}
          <div className="flex items-end justify-between w-full pointer-events-auto">
            {/* Virtual Joystick / D-Pad for Touch/Mouse */}
            <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#141414]/15 shadow-lg flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#717170] font-semibold">
                Walk Pad:
              </span>
              <div className="grid grid-cols-3 gap-1 w-28">
                <div />
                <button
                  onMouseDown={() => { keysPressedRef.current['w'] = true; }}
                  onMouseUp={() => { keysPressedRef.current['w'] = false; }}
                  onTouchStart={() => { keysPressedRef.current['w'] = true; }}
                  onTouchEnd={() => { keysPressedRef.current['w'] = false; }}
                  className="p-2 bg-[#FAF9F5] hover:bg-[#0284C7] hover:text-white rounded-lg text-xs font-mono font-bold text-center border border-[#141414]/15 cursor-pointer select-none active:bg-[#0284C7] active:text-white"
                >
                  W
                </button>
                <div />

                <button
                  onMouseDown={() => { keysPressedRef.current['a'] = true; }}
                  onMouseUp={() => { keysPressedRef.current['a'] = false; }}
                  onTouchStart={() => { keysPressedRef.current['a'] = true; }}
                  onTouchEnd={() => { keysPressedRef.current['a'] = false; }}
                  className="p-2 bg-[#FAF9F5] hover:bg-[#0284C7] hover:text-white rounded-lg text-xs font-mono font-bold text-center border border-[#141414]/15 cursor-pointer select-none active:bg-[#0284C7] active:text-white"
                >
                  A
                </button>
                <button
                  onMouseDown={() => { keysPressedRef.current['s'] = true; }}
                  onMouseUp={() => { keysPressedRef.current['s'] = false; }}
                  onTouchStart={() => { keysPressedRef.current['s'] = true; }}
                  onTouchEnd={() => { keysPressedRef.current['s'] = false; }}
                  className="p-2 bg-[#FAF9F5] hover:bg-[#0284C7] hover:text-white rounded-lg text-xs font-mono font-bold text-center border border-[#141414]/15 cursor-pointer select-none active:bg-[#0284C7] active:text-white"
                >
                  S
                </button>
                <button
                  onMouseDown={() => { keysPressedRef.current['d'] = true; }}
                  onMouseUp={() => { keysPressedRef.current['d'] = false; }}
                  onTouchStart={() => { keysPressedRef.current['d'] = true; }}
                  onTouchEnd={() => { keysPressedRef.current['d'] = false; }}
                  className="p-2 bg-[#FAF9F5] hover:bg-[#0284C7] hover:text-white rounded-lg text-xs font-mono font-bold text-center border border-[#141414]/15 cursor-pointer select-none active:bg-[#0284C7] active:text-white"
                >
                  D
                </button>
              </div>
              <div className="text-[10px] text-[#717170] font-mono mt-0.5">
                Keyboard: WASD / Arrow Keys
              </div>
            </div>

            {/* Live Minimap Radar HUD (Interactive Floorplan) */}
            {showMinimap && (
              <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#141414]/15 shadow-lg flex flex-col gap-1.5 w-60">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#5A5A58]">
                  <span className="font-semibold uppercase tracking-wider text-[#0284C7]">Live Radar</span>
                  <span>Click map to teleport</span>
                </div>

                {/* Radar SVG */}
                <div className="relative w-full h-36 bg-[#0A111E] rounded-xl overflow-hidden border border-[#141414]/15 flex items-center justify-center">
                  <svg
                    className="w-full h-full cursor-crosshair"
                    viewBox="-250 -250 500 500"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = ((e.clientX - rect.left) / rect.width - 0.5) * 500;
                      const clickZ = ((e.clientY - rect.top) / rect.height - 0.5) * 500;
                      handleTeleportWalker(clickX, clickZ);
                    }}
                  >
                    {/* Grid lines */}
                    <circle cx="0" cy="0" r="100" fill="none" stroke="#1E293B" strokeWidth="1" />
                    <circle cx="0" cy="0" r="200" fill="none" stroke="#1E293B" strokeWidth="1" />
                    <line x1="-250" y1="0" x2="250" y2="0" stroke="#1E293B" strokeWidth="1" />
                    <line x1="0" y1="-250" x2="0" y2="250" stroke="#1E293B" strokeWidth="1" />

                    {/* Rooms Layout */}
                    {housePlan && housePlan.rooms.length > 0 ? (
                      housePlan.rooms.map((r) => (
                        <g key={r.id}>
                          <rect
                            x={r.gridX}
                            y={r.gridZ}
                            width={r.specs.width}
                            height={r.specs.depth}
                            fill={r.id === housePlan.activeRoomId ? '#0284C7' : '#334155'}
                            fillOpacity="0.35"
                            stroke="#64748B"
                            strokeWidth="2"
                          />
                          <text
                            x={r.gridX + r.specs.width / 2}
                            y={r.gridZ + r.specs.depth / 2}
                            fill="#94A3B8"
                            fontSize="16"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontFamily="monospace"
                          >
                            {r.name.slice(0, 8)}
                          </text>
                        </g>
                      ))
                    ) : (
                      <rect
                        x={0}
                        y={0}
                        width={specs.width}
                        height={specs.depth}
                        fill="#0284C7"
                        fillOpacity="0.4"
                        stroke="#38BDF8"
                        strokeWidth="2"
                      />
                    )}

                    {/* Walker Player Indicator Dot & FOV Cone */}
                    <g transform={`translate(${playerPosition.x}, ${playerPosition.z})`}>
                      {/* FOV cone */}
                      <path
                        d="M 0 0 L -35 -70 A 80 80 0 0 1 35 -70 Z"
                        fill="#38BDF8"
                        fillOpacity="0.3"
                        transform={`rotate(${playerPosition.heading})`}
                      />
                      {/* Center blip */}
                      <circle cx="0" cy="0" r="8" fill="#38BDF8" />
                      <circle cx="0" cy="0" r="14" fill="none" stroke="#38BDF8" strokeWidth="2" className="animate-ping" />
                    </g>
                  </svg>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-[#717170]">
                  <span>Pos: ({Math.round(playerPosition.x)}", {Math.round(playerPosition.z)}")</span>
                  <span>Heading: {playerPosition.heading}°</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
