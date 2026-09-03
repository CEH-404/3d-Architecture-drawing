import * as THREE from 'three';
import { RenderMode, MeasurementUnit, ViewSettings, RoomDimensions, PartitionStyle } from '../types';
import { SCALE, formatDimension } from '../utils/constants';
import {
  createConcreteTexture,
  createDrywallTexture,
  createTimberTexture,
  createBlueprintGridTexture,
  createHardwoodTexture,
  createMarbleTexture,
  createTerrazzoTexture,
  createCarpetTexture,
  createMashrabiyaTexture,
  createPrayerRugTexture,
  createTextSprite
} from '../utils/textureGenerators';

export interface RoomMaterials {
  wall: THREE.Material;
  floor: THREE.Material;
  ceiling: THREE.Material;
  partition: THREE.Material;
  studs: THREE.Material;
  glass: THREE.Material;
  frame: THREE.Material;
  qiblaAccent: THREE.Material;
  dimensionLine: THREE.LineBasicMaterial;
  sightlineBlocked: THREE.Material;
  sightlineOpen: THREE.Material;
  oakWood: THREE.Material;
  flutedGlass: THREE.Material;
  mashrabiya: THREE.Material;
  steelFrame: THREE.Material;
  acousticFelt: THREE.Material;
  rugEmerald: THREE.Material;
  rugGold: THREE.Material;
  rugSlate: THREE.Material;
  rugTerracotta: THREE.Material;
}

export function createRoomMaterials(
  renderMode: RenderMode,
  wallOpacity = 1.0,
  specs?: RoomDimensions
): RoomMaterials {
  const isTransparent = wallOpacity < 0.99 || renderMode === 'xray';
  const opacity = renderMode === 'xray' ? 0.35 : wallOpacity;

  // Base procedural textures
  const drywallTex = createDrywallTexture();
  const concreteTex = createConcreteTexture();
  const timberTex = createTimberTexture();
  const hardwoodTex = createHardwoodTexture();
  const marbleTex = createMarbleTexture();
  const terrazzoTex = createTerrazzoTexture();
  const carpetTex = createCarpetTexture();
  const mashrabiyaTex = createMashrabiyaTexture();

  let activeFloorMap: THREE.Texture = concreteTex;
  if (specs?.floorMaterial === 'hardwood') activeFloorMap = hardwoodTex;
  else if (specs?.floorMaterial === 'marble') activeFloorMap = marbleTex;
  else if (specs?.floorMaterial === 'terrazzo') activeFloorMap = terrazzoTex;
  else if (specs?.floorMaterial === 'carpet') activeFloorMap = carpetTex;

  const oakWood = new THREE.MeshStandardMaterial({
    map: hardwoodTex,
    roughness: 0.6,
    metalness: 0.05
  });

  const flutedGlass = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transmission: 0.85,
    opacity: 1,
    transparent: true,
    roughness: 0.35,
    ior: 1.5,
    thickness: 0.04
  });

  const mashrabiya = new THREE.MeshStandardMaterial({
    map: mashrabiyaTex,
    transparent: true,
    alphaTest: 0.4,
    roughness: 0.7,
    side: THREE.DoubleSide
  });

  const steelFrame = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.35,
    metalness: 0.8
  });

  const acousticFelt = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.95,
    metalness: 0.0
  });

  const rugEmerald = new THREE.MeshStandardMaterial({
    map: createPrayerRugTexture('classic_emerald'),
    roughness: 0.85,
    side: THREE.DoubleSide
  });
  const rugGold = new THREE.MeshStandardMaterial({
    map: createPrayerRugTexture('gold_arch'),
    roughness: 0.85,
    side: THREE.DoubleSide
  });
  const rugSlate = new THREE.MeshStandardMaterial({
    map: createPrayerRugTexture('modern_slate'),
    roughness: 0.85,
    side: THREE.DoubleSide
  });
  const rugTerracotta = new THREE.MeshStandardMaterial({
    map: createPrayerRugTexture('terracotta'),
    roughness: 0.85,
    side: THREE.DoubleSide
  });

  switch (renderMode) {
    case 'blueprint': {
      const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
      return {
        wall: new THREE.MeshStandardMaterial({
          color: 0x142850,
          roughness: 0.7,
          metalness: 0.1,
          transparent: isTransparent,
          opacity: opacity,
          wireframe: false,
          side: THREE.DoubleSide
        }),
        floor: new THREE.MeshStandardMaterial({
          map: createBlueprintGridTexture(),
          roughness: 0.8,
          metalness: 0.1,
          side: THREE.DoubleSide
        }),
        ceiling: new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.9,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide
        }),
        partition: new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.5,
          transparent: isTransparent,
          opacity: opacity,
          side: THREE.DoubleSide
        }),
        studs: new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          wireframe: true,
          side: THREE.DoubleSide
        }),
        glass: new THREE.MeshStandardMaterial({
          color: 0x7dd3fc,
          transparent: true,
          opacity: 0.4,
          roughness: 0.1
        }),
        frame: new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.3
        }),
        qiblaAccent: new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.4
        }),
        dimensionLine: lineMat,
        sightlineBlocked: new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 }),
        sightlineOpen: new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.45 }),
        oakWood,
        flutedGlass,
        mashrabiya,
        steelFrame,
        acousticFelt,
        rugEmerald,
        rugGold,
        rugSlate,
        rugTerracotta
      };
    }

    case 'clay': {
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0xf5f3ee,
        roughness: 0.9,
        metalness: 0.05,
        transparent: isTransparent,
        opacity: opacity,
        side: THREE.DoubleSide
      });
      return {
        wall: wallMat,
        floor: new THREE.MeshStandardMaterial({
          color: 0xe5e2d8,
          roughness: 0.95,
          metalness: 0.02,
          side: THREE.DoubleSide
        }),
        ceiling: new THREE.MeshStandardMaterial({
          color: 0xfaf8f4,
          roughness: 0.9,
          side: THREE.DoubleSide
        }),
        partition: new THREE.MeshStandardMaterial({
          color: 0xd9d5c8,
          roughness: 0.85,
          transparent: isTransparent,
          opacity: opacity,
          side: THREE.DoubleSide
        }),
        studs: new THREE.MeshStandardMaterial({
          color: 0xc8aa80,
          roughness: 0.8
        }),
        glass: new THREE.MeshStandardMaterial({
          color: 0xdbeafe,
          transparent: true,
          opacity: 0.35,
          roughness: 0.1
        }),
        frame: new THREE.MeshStandardMaterial({
          color: 0x525252,
          roughness: 0.6
        }),
        qiblaAccent: new THREE.MeshStandardMaterial({
          color: 0xca8a04,
          roughness: 0.5
        }),
        dimensionLine: new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 2 }),
        sightlineBlocked: new THREE.MeshBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.55 }),
        sightlineOpen: new THREE.MeshBasicMaterial({ color: 0x059669, transparent: true, opacity: 0.4 }),
        oakWood,
        flutedGlass,
        mashrabiya,
        steelFrame,
        acousticFelt,
        rugEmerald,
        rugGold,
        rugSlate,
        rugTerracotta
      };
    }

    case 'xray': {
      return {
        wall: new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.4,
          metalness: 0.1,
          transparent: true,
          opacity: 0.28,
          side: THREE.DoubleSide
        }),
        floor: new THREE.MeshStandardMaterial({
          color: 0x64748b,
          roughness: 0.6,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide
        }),
        ceiling: new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.4,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide
        }),
        partition: new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.3,
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide
        }),
        studs: new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          roughness: 0.5
        }),
        glass: new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.5
        }),
        frame: new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.2
        }),
        qiblaAccent: new THREE.MeshStandardMaterial({
          color: 0x38bdf8
        }),
        dimensionLine: new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 }),
        sightlineBlocked: new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.7 }),
        sightlineOpen: new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 }),
        oakWood,
        flutedGlass,
        mashrabiya,
        steelFrame,
        acousticFelt,
        rugEmerald,
        rugGold,
        rugSlate,
        rugTerracotta
      };
    }

    case 'studs_exposed':
    case 'raw_drywall':
    default: {
      return {
        wall: new THREE.MeshStandardMaterial({
          map: drywallTex,
          roughness: 0.85,
          metalness: 0.05,
          transparent: isTransparent,
          opacity: opacity,
          side: THREE.DoubleSide
        }),
        floor: new THREE.MeshStandardMaterial({
          map: activeFloorMap,
          roughness: 0.88,
          metalness: 0.1,
          side: THREE.DoubleSide
        }),
        ceiling: new THREE.MeshStandardMaterial({
          map: drywallTex,
          roughness: 0.9,
          metalness: 0.02,
          side: THREE.DoubleSide
        }),
        partition: new THREE.MeshStandardMaterial({
          map: drywallTex,
          roughness: 0.82,
          metalness: 0.05,
          transparent: isTransparent,
          opacity: opacity,
          side: THREE.DoubleSide
        }),
        studs: new THREE.MeshStandardMaterial({
          map: timberTex,
          roughness: 0.75,
          metalness: 0.05
        }),
        glass: new THREE.MeshStandardMaterial({
          color: 0xa5f3fc,
          transparent: true,
          opacity: 0.28,
          roughness: 0.05,
          metalness: 0.1
        }),
        frame: new THREE.MeshStandardMaterial({
          color: 0x292524,
          roughness: 0.6,
          metalness: 0.4
        }),
        qiblaAccent: new THREE.MeshStandardMaterial({
          color: 0xb45309,
          roughness: 0.4,
          metalness: 0.3
        }),
        dimensionLine: new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 2 }),
        sightlineBlocked: new THREE.MeshBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.6 }),
        sightlineOpen: new THREE.MeshBasicMaterial({ color: 0x16a34a, transparent: true, opacity: 0.45 }),
        oakWood,
        flutedGlass,
        mashrabiya,
        steelFrame,
        acousticFelt,
        rugEmerald,
        rugGold,
        rugSlate,
        rugTerracotta
      };
    }
  }
}

/**
 * Creates an architectural human scale silhouette (5'6" / 1.68m)
 */
export function buildHumanFigure(x = 0, y = 0, z = 0): THREE.Group {
  const group = new THREE.Group();
  group.name = 'human-scale-figure';
  group.position.set(x, y, z);

  const mat = new THREE.MeshStandardMaterial({
    color: 0x334155, // slate-700 architectural silhouette
    roughness: 0.8,
    metalness: 0.1
  });

  // Legs (two slender cylinders)
  const legGeom = new THREE.CylinderGeometry(0.045, 0.04, 0.78, 8);
  const leftLeg = new THREE.Mesh(legGeom, mat);
  leftLeg.position.set(-0.07, 0.39, 0);
  leftLeg.castShadow = true;
  const rightLeg = new THREE.Mesh(legGeom, mat);
  rightLeg.position.set(0.07, 0.39, 0);
  rightLeg.castShadow = true;

  // Torso / Jacket
  const torsoGeom = new THREE.BoxGeometry(0.3, 0.58, 0.16);
  const torso = new THREE.Mesh(torsoGeom, mat);
  torso.position.set(0, 0.78 + 0.29, 0);
  torso.castShadow = true;

  // Head
  const headGeom = new THREE.SphereGeometry(0.09, 12, 12);
  const head = new THREE.Mesh(headGeom, mat);
  head.position.set(0, 0.78 + 0.58 + 0.13, 0);
  head.castShadow = true;

  group.add(leftLeg, rightLeg, torso, head);
  return group;
}

/**
 * Creates dimension line with arrows and sprite label
 */
export function createDimensionMarker(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  label: string,
  sublabel?: string,
  offsetDirection = new THREE.Vector3(0, 1, 0),
  offsetDist = 0.3,
  highlight = false
): THREE.Group {
  const group = new THREE.Group();

  const start = p1.clone().add(offsetDirection.clone().multiplyScalar(offsetDist));
  const end = p2.clone().add(offsetDirection.clone().multiplyScalar(offsetDist));

  // Extension witness lines from geometry to dimension line
  const extLineMat = new THREE.LineDashedMaterial({
    color: highlight ? 0x0284c7 : 0x64748b,
    dashSize: 0.05,
    gapSize: 0.03,
    linewidth: 1
  });
  
  const extGeom1 = new THREE.BufferGeometry().setFromPoints([p1, start]);
  const extGeom2 = new THREE.BufferGeometry().setFromPoints([p2, end]);
  const extLine1 = new THREE.Line(extGeom1, extLineMat);
  const extLine2 = new THREE.Line(extGeom2, extLineMat);
  extLine1.computeLineDistances();
  extLine2.computeLineDistances();
  group.add(extLine1, extLine2);

  // Main dimension line
  const mainLineMat = new THREE.LineBasicMaterial({
    color: highlight ? 0x0284c7 : 0x475569,
    linewidth: 2
  });
  const mainGeom = new THREE.BufferGeometry().setFromPoints([start, end]);
  const mainLine = new THREE.Line(mainGeom, mainLineMat);
  group.add(mainLine);

  // Arrows/Ticks at both ends
  const arrowSize = 0.08;
  const dir = end.clone().sub(start).normalize();
  
  const coneMat = new THREE.MeshBasicMaterial({ color: highlight ? 0x0284c7 : 0x475569 });
  const coneGeom = new THREE.ConeGeometry(arrowSize * 0.4, arrowSize, 8);
  
  const cone1 = new THREE.Mesh(coneGeom, coneMat);
  cone1.position.copy(start);
  cone1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  
  const cone2 = new THREE.Mesh(coneGeom, coneMat);
  cone2.position.copy(end);
  cone2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().negate());

  group.add(cone1, cone2);

  // Sprite label centered between start and end
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const sprite = createTextSprite(label, sublabel, highlight);
  sprite.position.copy(mid).add(offsetDirection.clone().multiplyScalar(0.12));
  group.add(sprite);

  return group;
}

/**
 * Builds the complete 3D Room Shell with all exact architectural specifications.
 */
export function buildRoomShell(
  materials: RoomMaterials,
  settings: ViewSettings,
  specs: RoomDimensions
): { roomGroup: THREE.Group; dimensionsGroup: THREE.Group } {
  const roomGroup = new THREE.Group();
  const dimensionsGroup = new THREE.Group();

  const W = specs.width * SCALE;
  const D = specs.depth * SCALE;
  const H = (settings.wallCutawayHeight > 0 
    ? settings.wallCutawayHeight 
    : specs.height) * SCALE;

  const wallThickness = 0.12; // ~4.7 inches solid representation

  // ==========================================
  // 1. FLOOR (Y = 0)
  // ==========================================
  const floorGeom = new THREE.BoxGeometry(W, 0.05, D);
  const floorMesh = new THREE.Mesh(floorGeom, materials.floor);
  floorMesh.position.set(W / 2, -0.025, D / 2);
  floorMesh.receiveShadow = true;
  floorMesh.userData = {
    selectable: true,
    type: 'floor',
    id: 'active-floor',
    name: `${specs.roomName || 'Room'} Floor`
  };
  roomGroup.add(floorMesh);

  // ==========================================
  // 2. CEILING (Y = H or Full Deck)
  // ==========================================
  if (settings.ceilingMode !== 'open') {
    const ceilHeight = specs.height * SCALE;
    const ceilGeom = new THREE.BoxGeometry(W, 0.05, D);
    const ceilMat = settings.ceilingMode === 'transparent'
      ? new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })
      : materials.ceiling;
    const ceilMesh = new THREE.Mesh(ceilGeom, ceilMat);
    ceilMesh.position.set(W / 2, ceilHeight + 0.025, D / 2);
    ceilMesh.castShadow = true;
    ceilMesh.receiveShadow = true;
    ceilMesh.userData = {
      selectable: true,
      type: 'ceiling',
      id: 'active-ceiling',
      name: 'Ceiling'
    };
    roomGroup.add(ceilMesh);
  }

  // ==========================================
  // 3. ENTRANCE WALL (Front Wall at Z = 0)
  // ==========================================
  const doorW = specs.doorWidth * SCALE;
  const doorH = specs.doorHeight * SCALE;
  const leftSegW = specs.doorOffsetLeft * SCALE;
  const rightSegW = Math.max(0.1, (specs.width - specs.doorOffsetLeft - specs.doorWidth) * SCALE);

  const frontWallData = {
    selectable: true,
    type: 'wall',
    id: 'wall-front',
    name: 'Entrance Wall (Front)',
    wallPosition: 'front'
  };

  // Left solid segment
  const frontLeftGeom = new THREE.BoxGeometry(leftSegW, H, wallThickness);
  const frontLeftMesh = new THREE.Mesh(frontLeftGeom, materials.wall);
  frontLeftMesh.position.set(leftSegW / 2, H / 2, -wallThickness / 2);
  frontLeftMesh.castShadow = true;
  frontLeftMesh.receiveShadow = true;
  frontLeftMesh.userData = frontWallData;
  roomGroup.add(frontLeftMesh);

  // Lintel / Header above Door
  const headerHeight = Math.max(0, H - doorH);
  if (headerHeight > 0) {
    const doorHeaderGeom = new THREE.BoxGeometry(doorW, headerHeight, wallThickness);
    const doorHeaderMesh = new THREE.Mesh(doorHeaderGeom, materials.wall);
    doorHeaderMesh.position.set(leftSegW + doorW / 2, doorH + headerHeight / 2, -wallThickness / 2);
    doorHeaderMesh.castShadow = true;
    doorHeaderMesh.receiveShadow = true;
    doorHeaderMesh.userData = frontWallData;
    roomGroup.add(doorHeaderMesh);
  }

  // Right solid segment
  const frontRightGeom = new THREE.BoxGeometry(rightSegW, H, wallThickness);
  const frontRightMesh = new THREE.Mesh(frontRightGeom, materials.wall);
  frontRightMesh.position.set(leftSegW + doorW + rightSegW / 2, H / 2, -wallThickness / 2);
  frontRightMesh.castShadow = true;
  frontRightMesh.receiveShadow = true;
  frontRightMesh.userData = frontWallData;
  roomGroup.add(frontRightMesh);

  // Door Opening Frame Outline
  const doorFrameGeom = new THREE.BoxGeometry(doorW, doorH, 0.02);
  const doorFrameEdges = new THREE.EdgesGeometry(doorFrameGeom);
  const doorFrameLine = new THREE.LineSegments(
    doorFrameEdges,
    new THREE.LineBasicMaterial({ color: 0x64748b, linewidth: 2 })
  );
  doorFrameLine.position.set(leftSegW + doorW / 2, doorH / 2, 0);
  doorFrameLine.userData = {
    selectable: true,
    type: 'door',
    id: 'active-door',
    name: 'Entrance Door'
  };
  roomGroup.add(doorFrameLine);

  // Dynamic Door Leaf (Both open and closed states)
  if (specs.doorType !== 'open_arch') {
    const doorLeafThick = 0.04;
    const doorLeafGeom = new THREE.BoxGeometry(doorW, doorH, doorLeafThick);
    const doorLeafMesh = new THREE.Mesh(doorLeafGeom, materials.oakWood);
    doorLeafMesh.castShadow = true;
    
    // Hinge at left or right side of frame
    const doorPivot = new THREE.Group();
    const openAngleRad = ((specs.doorOpenAngle || 0) * Math.PI) / 180;
    if (specs.doorHinge === 'left') {
      doorPivot.position.set(leftSegW, 0, 0);
      doorLeafMesh.position.set(doorW / 2, doorH / 2, 0);
      doorPivot.rotation.y = openAngleRad;
    } else {
      doorPivot.position.set(leftSegW + doorW, 0, 0);
      doorLeafMesh.position.set(-doorW / 2, doorH / 2, 0);
      doorPivot.rotation.y = -openAngleRad;
    }
    const doorData = {
      selectable: true,
      type: 'door',
      id: 'active-door',
      name: 'Entrance Door'
    };
    doorPivot.userData = doorData;
    doorLeafMesh.userData = doorData;
    doorPivot.add(doorLeafMesh);
    roomGroup.add(doorPivot);
  }

  // ==========================================
  // 4. LEFT, RIGHT, BACK WALLS WITH WINDOW
  // ==========================================
  const winW = specs.windowWidth * SCALE;
  const winH = specs.windowHeight * SCALE;
  const winSillH = specs.windowSillHeight * SCALE;
  const winTopH = winSillH + winH;
  const winOffset = (specs.windowOffsetFront || 40) * SCALE;

  // Helper to build a wall with or without window
  const buildWallWithWindow = (
    wallLength: number,
    isWindowWall: boolean,
    wallPos: 'left' | 'right' | 'back'
  ) => {
    const group = new THREE.Group();
    const wallUserData = {
      selectable: true,
      type: 'wall',
      id: `wall-${wallPos}`,
      name: `${wallPos === 'back' ? 'Back / Qibla' : wallPos === 'left' ? 'Left' : 'Right'} Wall`,
      wallPosition: wallPos
    };
    const windowUserData = {
      selectable: true,
      type: 'window',
      id: `window-${wallPos}`,
      name: `${wallPos.toUpperCase()} Window Opening`,
      wallPosition: wallPos
    };
    group.userData = wallUserData;

    if (!isWindowWall) {
      // Solid Wall
      const wallGeom = new THREE.BoxGeometry(
        wallPos === 'back' ? wallLength : wallThickness,
        H,
        wallPos === 'back' ? wallThickness : wallLength
      );
      const wallMesh = new THREE.Mesh(wallGeom, materials.wall);
      if (wallPos === 'back') {
        wallMesh.position.set(wallLength / 2, H / 2, 0);
      } else {
        wallMesh.position.set(0, H / 2, wallLength / 2);
      }
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      wallMesh.userData = wallUserData;
      group.add(wallMesh);
      return group;
    }

    // Window Wall with opening
    const frontSegLen = Math.max(0.1, winOffset);
    const backSegLen = Math.max(0.1, wallLength - winOffset - winW);

    if (wallPos === 'left' || wallPos === 'right') {
      // Front segment
      const frontGeom = new THREE.BoxGeometry(wallThickness, H, frontSegLen);
      const frontMesh = new THREE.Mesh(frontGeom, materials.wall);
      frontMesh.position.set(0, H / 2, frontSegLen / 2);
      frontMesh.castShadow = true;
      frontMesh.receiveShadow = true;
      frontMesh.userData = wallUserData;
      group.add(frontMesh);

      // Sill segment below window
      const actualSillH = Math.min(H, winSillH);
      if (actualSillH > 0) {
        const sillGeom = new THREE.BoxGeometry(wallThickness, actualSillH, winW);
        const sillMesh = new THREE.Mesh(sillGeom, materials.wall);
        sillMesh.position.set(0, actualSillH / 2, frontSegLen + winW / 2);
        sillMesh.castShadow = true;
        sillMesh.receiveShadow = true;
        sillMesh.userData = wallUserData;
        group.add(sillMesh);
      }

      // Header segment above window
      const headerH = Math.max(0, H - winTopH);
      if (headerH > 0) {
        const winHeadGeom = new THREE.BoxGeometry(wallThickness, headerH, winW);
        const winHeadMesh = new THREE.Mesh(winHeadGeom, materials.wall);
        winHeadMesh.position.set(0, winTopH + headerH / 2, frontSegLen + winW / 2);
        winHeadMesh.castShadow = true;
        winHeadMesh.receiveShadow = true;
        winHeadMesh.userData = wallUserData;
        group.add(winHeadMesh);
      }

      // Back segment
      const backGeom = new THREE.BoxGeometry(wallThickness, H, backSegLen);
      const backMesh = new THREE.Mesh(backGeom, materials.wall);
      backMesh.position.set(0, H / 2, frontSegLen + winW + backSegLen / 2);
      backMesh.castShadow = true;
      backMesh.receiveShadow = true;
      backMesh.userData = wallUserData;
      group.add(backMesh);

      // Glass Pane & Frame
      if (H >= winSillH) {
        const glassGeom = new THREE.BoxGeometry(0.015, winH, winW);
        const glassMesh = new THREE.Mesh(glassGeom, materials.glass);
        glassMesh.position.set(0, winSillH + winH / 2, frontSegLen + winW / 2);
        glassMesh.userData = windowUserData;
        group.add(glassMesh);

        const frameOuterGeom = new THREE.BoxGeometry(0.06, winH, winW);
        const frameLine = new THREE.LineSegments(
          new THREE.EdgesGeometry(frameOuterGeom),
          new THREE.LineBasicMaterial({ color: 0x1e293b, linewidth: 2 })
        );
        frameLine.position.set(0, winSillH + winH / 2, frontSegLen + winW / 2);
        frameLine.userData = windowUserData;
        group.add(frameLine);

        // Center Mullion
        const mullionGeom = new THREE.BoxGeometry(0.04, winH, 0.04);
        const mullionMesh = new THREE.Mesh(mullionGeom, materials.frame);
        mullionMesh.position.set(0, winSillH + winH / 2, frontSegLen + winW / 2);
        mullionMesh.userData = windowUserData;
        group.add(mullionMesh);
      }
    } else if (wallPos === 'back') {
      // Back window wall
      const leftSeg = Math.max(0.1, winOffset);
      const rightSeg = Math.max(0.1, wallLength - winOffset - winW);

      const leftGeom = new THREE.BoxGeometry(leftSeg, H, wallThickness);
      const leftMesh = new THREE.Mesh(leftGeom, materials.wall);
      leftMesh.position.set(leftSeg / 2, H / 2, 0);
      leftMesh.userData = wallUserData;
      group.add(leftMesh);

      if (winSillH > 0) {
        const sillGeom = new THREE.BoxGeometry(winW, winSillH, wallThickness);
        const sillMesh = new THREE.Mesh(sillGeom, materials.wall);
        sillMesh.position.set(leftSeg + winW / 2, winSillH / 2, 0);
        sillMesh.userData = wallUserData;
        group.add(sillMesh);
      }

      const headerH = Math.max(0, H - winTopH);
      if (headerH > 0) {
        const headGeom = new THREE.BoxGeometry(winW, headerH, wallThickness);
        const headMesh = new THREE.Mesh(headGeom, materials.wall);
        headMesh.position.set(leftSeg + winW / 2, winTopH + headerH / 2, 0);
        headMesh.userData = wallUserData;
        group.add(headMesh);
      }

      const rightGeom = new THREE.BoxGeometry(rightSeg, H, wallThickness);
      const rightMesh = new THREE.Mesh(rightGeom, materials.wall);
      rightMesh.position.set(leftSeg + winW + rightSeg / 2, H / 2, 0);
      rightMesh.userData = wallUserData;
      group.add(rightMesh);

      const glassGeom = new THREE.BoxGeometry(winW, winH, 0.015);
      const glassMesh = new THREE.Mesh(glassGeom, materials.glass);
      glassMesh.position.set(leftSeg + winW / 2, winSillH + winH / 2, 0);
      glassMesh.userData = windowUserData;
      group.add(glassMesh);
    }

    return group;
  };

  // Build Left Wall (X = 0)
  const leftWallGroup = buildWallWithWindow(D, specs.windowWall === 'left', 'left');
  leftWallGroup.position.set(-wallThickness / 2, 0, 0);
  roomGroup.add(leftWallGroup);

  // Build Right Wall (X = W)
  const rightWallGroup = buildWallWithWindow(D, specs.windowWall === 'right', 'right');
  rightWallGroup.position.set(W + wallThickness / 2, 0, 0);
  roomGroup.add(rightWallGroup);

  // Build Back / Qibla Wall (Z = D)
  const backWallGroup = buildWallWithWindow(W, specs.windowWall === 'back', 'back');
  backWallGroup.position.set(0, 0, D + wallThickness / 2);
  roomGroup.add(backWallGroup);

  // Qibla Focal Indicator on Back Wall
  const qiblaIndicatorGeom = new THREE.BoxGeometry(0.45, 0.01, 0.45);
  const qiblaIndicator = new THREE.Mesh(qiblaIndicatorGeom, materials.qiblaAccent);
  qiblaIndicator.position.set(W / 2, 0.006, D - 0.5);
  qiblaIndicator.rotation.y = Math.PI / 4;
  roomGroup.add(qiblaIndicator);

  // ==========================================
  // 5. PRIVACY PARTITION (WING WALL)
  // ==========================================
  const partDepth = specs.partitionDepth * SCALE;
  const partHeight = Math.min(H, specs.partitionHeight * SCALE);
  const partThick = specs.partitionThickness * SCALE;
  const partPosX = (specs.partitionPositionX || (specs.doorOffsetLeft + specs.doorWidth)) * SCALE;

  const style = specs.partitionStyle || 'drywall';
  const partitionUserData = {
    selectable: true,
    type: 'partition',
    id: 'active-partition',
    name: 'Privacy Partition'
  };

  if (settings.renderMode === 'studs_exposed' || settings.showStudFraming) {
    // 2x4 Timber Stud Framing representation
    const studsGroup = new THREE.Group();
    studsGroup.userData = partitionUserData;
    const studWidth = 0.038;
    const studDepth = 0.089;
    const studSpacing = 0.4064;

    const solePlate = new THREE.Mesh(new THREE.BoxGeometry(studDepth, studWidth, partDepth), materials.studs);
    solePlate.position.set(partPosX + studDepth / 2, studWidth / 2, partDepth / 2);
    solePlate.userData = partitionUserData;
    studsGroup.add(solePlate);

    const topPlate = solePlate.clone();
    topPlate.position.y = partHeight - studWidth / 2;
    topPlate.userData = partitionUserData;
    studsGroup.add(topPlate);

    const numStuds = Math.ceil(partDepth / studSpacing) + 1;
    for (let i = 0; i < numStuds; i++) {
      const zPos = Math.min(partDepth - studWidth / 2, i * studSpacing + studWidth / 2);
      const vStud = new THREE.Mesh(new THREE.BoxGeometry(studDepth, partHeight - 2 * studWidth, studWidth), materials.studs);
      vStud.position.set(partPosX + studDepth / 2, partHeight / 2, zPos);
      vStud.userData = partitionUserData;
      studsGroup.add(vStud);
    }
    roomGroup.add(studsGroup);
  } else if (style === 'timber_slats') {
    // Japandi Vertical Louvers / Slats
    const slatsGroup = new THREE.Group();
    slatsGroup.userData = partitionUserData;
    const slatW = 0.04;
    const slatD = 0.08;
    const numSlats = Math.floor(partDepth / 0.12);

    for (let i = 0; i < numSlats; i++) {
      const z = i * 0.12 + slatD / 2;
      const slatGeom = new THREE.BoxGeometry(slatW, partHeight, slatD);
      const slatMesh = new THREE.Mesh(slatGeom, materials.oakWood);
      slatMesh.position.set(partPosX + slatW / 2, partHeight / 2, z);
      slatMesh.castShadow = true;
      slatMesh.receiveShadow = true;
      slatMesh.userData = partitionUserData;
      slatsGroup.add(slatMesh);
    }
    roomGroup.add(slatsGroup);
  } else if (style === 'fluted_glass') {
    // Fluted Reeded Glass Panel with Black Metal Frame
    const glassGroup = new THREE.Group();
    glassGroup.userData = partitionUserData;
    const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(partThick, partHeight, partDepth), materials.steelFrame);
    frameMesh.position.set(partPosX + partThick / 2, partHeight / 2, partDepth / 2);
    frameMesh.userData = partitionUserData;
    
    const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(0.02, partHeight - 0.08, partDepth - 0.08), materials.flutedGlass);
    glassMesh.position.set(partPosX + partThick / 2, partHeight / 2, partDepth / 2);
    glassMesh.userData = partitionUserData;
    
    glassGroup.add(frameMesh, glassMesh);
    roomGroup.add(glassGroup);
  } else if (style === 'mashrabiya') {
    // Islamic Mashrabiya Geometric Lattice
    const mashrabiyaGroup = new THREE.Group();
    mashrabiyaGroup.userData = partitionUserData;
    const frameGeom = new THREE.BoxGeometry(partThick, partHeight, partDepth);
    const latticeMesh = new THREE.Mesh(frameGeom, materials.mashrabiya);
    latticeMesh.position.set(partPosX + partThick / 2, partHeight / 2, partDepth / 2);
    latticeMesh.castShadow = true;
    latticeMesh.userData = partitionUserData;
    mashrabiyaGroup.add(latticeMesh);
    roomGroup.add(mashrabiyaGroup);
  } else if (style === 'acoustic_felt') {
    // Acoustic Felt Grooved Panel
    const feltGeom = new THREE.BoxGeometry(partThick, partHeight, partDepth);
    const feltMesh = new THREE.Mesh(feltGeom, materials.acousticFelt);
    feltMesh.position.set(partPosX + partThick / 2, partHeight / 2, partDepth / 2);
    feltMesh.castShadow = true;
    feltMesh.receiveShadow = true;
    feltMesh.userData = partitionUserData;
    roomGroup.add(feltMesh);
  } else if (style === 'half_wall') {
    // 42" Half Wall with Wood Cap
    const halfH = Math.min(partHeight, 1.0668); // 42"
    const halfGeom = new THREE.BoxGeometry(partThick, halfH, partDepth);
    const halfMesh = new THREE.Mesh(halfGeom, materials.partition);
    halfMesh.position.set(partPosX + partThick / 2, halfH / 2, partDepth / 2);
    halfMesh.userData = partitionUserData;
    
    const capGeom = new THREE.BoxGeometry(partThick + 0.04, 0.03, partDepth + 0.02);
    const capMesh = new THREE.Mesh(capGeom, materials.oakWood);
    capMesh.position.set(partPosX + partThick / 2, halfH + 0.015, partDepth / 2);
    capMesh.userData = partitionUserData;
    
    roomGroup.add(halfMesh, capMesh);
  } else {
    // Standard Solid Drywall Partition Shell
    const partGeom = new THREE.BoxGeometry(partThick, partHeight, partDepth);
    const partMesh = new THREE.Mesh(partGeom, materials.partition);
    partMesh.position.set(partPosX + partThick / 2, partHeight / 2, partDepth / 2);
    partMesh.castShadow = true;
    partMesh.receiveShadow = true;
    partMesh.userData = partitionUserData;
    roomGroup.add(partMesh);

    const partLine = new THREE.LineSegments(
      new THREE.EdgesGeometry(partGeom),
      new THREE.LineBasicMaterial({ color: 0x334155, linewidth: 1.5 })
    );
    partLine.position.copy(partMesh.position);
    partLine.userData = partitionUserData;
    roomGroup.add(partLine);
  }

  // ==========================================
  // 6. INTERIOR AMENITIES & FURNITURE (IF ENABLED)
  // ==========================================
  
  // A. Prayer Rug(s) (Sajjadah)
  if (specs.showPrayerMat) {
    const matW = 0.65; // ~26"
    const matD = 1.15; // ~45"
    const count = specs.prayerMatCount || 1;
    let rugMat = materials.rugEmerald;
    if (specs.prayerMatPattern === 'gold_arch') rugMat = materials.rugGold;
    else if (specs.prayerMatPattern === 'modern_slate') rugMat = materials.rugSlate;
    else if (specs.prayerMatPattern === 'terracotta') rugMat = materials.rugTerracotta;

    const startX = W / 2 - ((count - 1) * 0.75) / 2;
    for (let c = 0; c < count; c++) {
      const rugGeom = new THREE.BoxGeometry(matW, 0.008, matD);
      const rugMesh = new THREE.Mesh(rugGeom, rugMat);
      rugMesh.position.set(startX + c * 0.75, 0.004, D - 1.2);
      rugMesh.receiveShadow = true;
      roomGroup.add(rugMesh);
    }
  }

  // B. Shoe Storage & Entry Bench
  if (specs.showEntryBench) {
    const benchGroup = new THREE.Group();
    const benchW = Math.min(partDepth - 0.1, 0.9);
    const benchD = 0.35;
    const benchH = 0.45;

    const woodGeom = new THREE.BoxGeometry(benchD, benchH - 0.06, benchW);
    const woodMesh = new THREE.Mesh(woodGeom, materials.oakWood);
    woodMesh.position.set(partPosX + partThick + benchD / 2 + 0.05, (benchH - 0.06) / 2, benchW / 2 + 0.05);
    
    // Cushion
    const cushionGeom = new THREE.BoxGeometry(benchD + 0.02, 0.06, benchW + 0.02);
    const cushionMesh = new THREE.Mesh(cushionGeom, materials.acousticFelt);
    cushionMesh.position.set(partPosX + partThick + benchD / 2 + 0.05, benchH - 0.03, benchW / 2 + 0.05);

    benchGroup.add(woodMesh, cushionMesh);
    roomGroup.add(benchGroup);
  }

  // C. Bookshelf / Qur'an Credenza
  if (specs.showBookshelf) {
    const shelfGroup = new THREE.Group();
    const shelfW = 0.8;
    const shelfD = 0.28;
    const shelfH = 0.95;

    const bodyGeom = new THREE.BoxGeometry(shelfD, shelfH, shelfW);
    const bodyMesh = new THREE.Mesh(bodyGeom, materials.oakWood);
    bodyMesh.position.set(W - shelfD / 2 - 0.05, shelfH / 2, D - 1.0);
    bodyMesh.castShadow = true;

    shelfGroup.add(bodyMesh);
    roomGroup.add(shelfGroup);
  }

  // D. Indoor Ceramic Planter
  if (specs.showIndoorPlant) {
    const plantGroup = new THREE.Group();
    const potGeom = new THREE.CylinderGeometry(0.16, 0.12, 0.4, 16);
    const potMesh = new THREE.Mesh(potGeom, new THREE.MeshStandardMaterial({ color: 0xF4F4F0, roughness: 0.4 }));
    potMesh.position.set(0.4, 0.2, D - 0.4);
    
    // Foliage Spheres
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2D5A27, roughness: 0.6 });
    for (let f = 0; f < 4; f++) {
      const leafMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), leafMat);
      leafMesh.position.set(0.4 + (f % 2 === 0 ? 0.06 : -0.06), 0.45 + f * 0.12, D - 0.4 + (f > 1 ? 0.05 : -0.05));
      plantGroup.add(leafMesh);
    }
    plantGroup.add(potMesh);
    roomGroup.add(plantGroup);
  }

  // E. Designer Pendant Ceiling Light
  if (specs.showPendantLight) {
    const pendantGroup = new THREE.Group();
    const ringGeom = new THREE.TorusGeometry(0.35, 0.02, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.9, roughness: 0.2 });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(W / 2, Math.min(H, 3.2) - 0.6, D / 2);

    // Cable to ceiling
    const cableGeom = new THREE.CylinderGeometry(0.004, 0.004, 0.6, 8);
    const cableMesh = new THREE.Mesh(cableGeom, new THREE.MeshBasicMaterial({ color: 0x111111 }));
    cableMesh.position.set(W / 2, Math.min(H, 3.2) - 0.3, D / 2);

    pendantGroup.add(ringMesh, cableMesh);
    roomGroup.add(pendantGroup);
  }

  // F. Wall Calligraphy Art Frame
  if (specs.showWallArt) {
    const artGroup = new THREE.Group();
    const frameGeom = new THREE.BoxGeometry(0.7, 0.5, 0.02);
    const artMesh = new THREE.Mesh(frameGeom, new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 }));
    artMesh.position.set(W / 2, 1.8, D - 0.02);
    artGroup.add(artMesh);
    roomGroup.add(artGroup);
  }

  // ==========================================
  // G. CEILING (IF NOT OPEN)
  // ==========================================
  if (settings.ceilingMode === 'solid') {
    const ceilGeom = new THREE.BoxGeometry(W, 0.04, D);
    const ceilMesh = new THREE.Mesh(ceilGeom, materials.ceiling);
    ceilMesh.position.set(W / 2, H + 0.02, D / 2);
    ceilMesh.castShadow = true;
    ceilMesh.receiveShadow = true;
    roomGroup.add(ceilMesh);
  } else if (settings.ceilingMode === 'transparent') {
    const ceilGeom = new THREE.BoxGeometry(W, 0.02, D);
    const ceilMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.8
    });
    const ceilMesh = new THREE.Mesh(ceilGeom, ceilMat);
    ceilMesh.position.set(W / 2, H + 0.01, D / 2);

    const beamMat = materials.steelFrame;
    const beam1 = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, 0.04), beamMat);
    beam1.position.set(W / 2, H + 0.02, D / 2);
    const beam2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, D), beamMat);
    beam2.position.set(W / 2, H + 0.02, D / 2);
    roomGroup.add(ceilMesh, beam1, beam2);
  }

  // ==========================================
  // H. HUMAN SCALE REFERENCE FIGURE (5'6")
  // ==========================================
  if (settings.showHumanFigure) {
    const human = buildHumanFigure(specs.doorOffsetLeft * SCALE + 0.6, 0, 1.0);
    roomGroup.add(human);
  }

  // ==========================================
  // 7. DYNAMIC DIMENSION OVERLAYS
  // ==========================================
  if (settings.showDimensions) {
    const unit = settings.unit;

    // Room Width
    dimensionsGroup.add(createDimensionMarker(
      new THREE.Vector3(0, 0.02, -0.1),
      new THREE.Vector3(W, 0.02, -0.1),
      formatDimension(specs.width, unit),
      'Room Width',
      new THREE.Vector3(0, 0, -1),
      0.4,
      true
    ));

    // Room Depth
    dimensionsGroup.add(createDimensionMarker(
      new THREE.Vector3(W + 0.1, 0.02, 0),
      new THREE.Vector3(W + 0.1, 0.02, D),
      formatDimension(specs.depth, unit),
      'Room Depth (Front to Qibla)',
      new THREE.Vector3(1, 0, 0),
      0.4,
      true
    ));

    // Ceiling Height
    dimensionsGroup.add(createDimensionMarker(
      new THREE.Vector3(W + 0.1, 0, D),
      new THREE.Vector3(W + 0.1, specs.height * SCALE, D),
      formatDimension(specs.height, unit),
      'Ceiling Height',
      new THREE.Vector3(1, 0, 0),
      0.4,
      true
    ));

    // Door Width
    dimensionsGroup.add(createDimensionMarker(
      new THREE.Vector3(leftSegW, 0.02, -0.05),
      new THREE.Vector3(leftSegW + doorW, 0.02, -0.05),
      formatDimension(specs.doorWidth, unit),
      'Door Width',
      new THREE.Vector3(0, 0, -1),
      0.15
    ));

    // Partition Depth
    dimensionsGroup.add(createDimensionMarker(
      new THREE.Vector3(partPosX + partThick + 0.05, 0.02, 0),
      new THREE.Vector3(partPosX + partThick + 0.05, 0.02, partDepth),
      formatDimension(specs.partitionDepth, unit),
      'Privacy Wing Depth',
      new THREE.Vector3(1, 0, 0),
      0.25,
      true
    ));

    // Partition Height
    dimensionsGroup.add(createDimensionMarker(
      new THREE.Vector3(partPosX + partThick + 0.05, 0, partDepth),
      new THREE.Vector3(partPosX + partThick + 0.05, partHeight, partDepth),
      formatDimension(specs.partitionHeight, unit),
      'Partition Height',
      new THREE.Vector3(1, 0, 0),
      0.25,
      true
    ));
  }

  return { roomGroup, dimensionsGroup };
}

