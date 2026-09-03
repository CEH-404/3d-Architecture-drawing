import * as THREE from 'three';
import { HousePlan, HouseRoom, FurnitureItem, ViewSettings, RenderMode, SiteEnvironment, SurroundingBuilding } from '../types';
import { SCALE } from '../utils/constants';
import { createRoomMaterials, RoomMaterials, buildHumanFigure } from './RoomGeometry';
import { createTextSprite } from '../utils/textureGenerators';

/**
 * Builds 3D procedural furniture objects with architectural detail and clean materials.
 */
export function buildFurnitureMesh(
  item: FurnitureItem,
  materials: RoomMaterials,
  roomId?: string,
  roomName?: string
): THREE.Group {
  const group = new THREE.Group();
  group.name = `furniture-${item.id}`;
  group.userData = {
    selectable: true,
    type: 'furniture',
    id: item.id,
    name: item.name,
    roomId,
    roomName,
    furnitureItem: item
  };

  const posX = (item.x || 0) * SCALE;
  const posZ = (item.z || 0) * SCALE;
  const posY = (item.y || 0) * SCALE;
  const rotY = ((item.rotation || 0) * Math.PI) / 180;

  group.position.set(posX, posY, posZ);
  group.rotation.y = rotY;

  // Material helpers
  const customColorVal = item.color ? parseInt(item.color.replace('#', '0x'), 16) : null;
  const woodMat = customColorVal !== null && !isNaN(customColorVal)
    ? new THREE.MeshStandardMaterial({ color: customColorVal, roughness: 0.65 })
    : materials.oakWood;
  const darkSteel = materials.steelFrame;
  const marbleMat = materials.floor;
  const cushionMat = new THREE.MeshStandardMaterial({
    color: customColorVal !== null && !isNaN(customColorVal) ? customColorVal : 0x475569,
    roughness: 0.85
  });
  const whitePorcelain = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.1
  });
  const plantGreen = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.7
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.35,
    metalness: 0.8
  });

  switch (item.itemType) {
    // 1. Living Room L-Shape Sectional Sofa
    case 'sofa_sectional': {
      // Main sofa bench (2.4m x 0.9m)
      const mainBench = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.42, 0.9), cushionMat);
      mainBench.position.set(0, 0.21, 0);
      mainBench.castShadow = true;
      mainBench.receiveShadow = true;

      // Backrest
      const backRest = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 0.22), cushionMat);
      backRest.position.set(0, 0.55, -0.34);
      backRest.castShadow = true;

      // L-Chaise return
      const chaise = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 1.2), cushionMat);
      chaise.position.set(0.65, 0.21, 0.8);
      chaise.castShadow = true;
      chaise.receiveShadow = true;

      // Armrests
      const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.9), cushionMat);
      leftArm.position.set(-1.01, 0.35, 0);
      leftArm.castShadow = true;

      // Throw pillows
      const pillowMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
      const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.12), pillowMat);
      pillow1.position.set(-0.7, 0.5, -0.2);
      pillow1.rotation.y = 0.2;

      const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.12), pillowMat);
      pillow2.position.set(0.4, 0.5, -0.2);
      pillow2.rotation.y = -0.15;

      group.add(mainBench, backRest, chaise, leftArm, pillow1, pillow2);
      break;
    }

    // 2. Coffee Table
    case 'coffee_table': {
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.65), woodMat);
      top.position.set(0, 0.38, 0);
      top.castShadow = true;
      top.receiveShadow = true;

      // Steel legs
      const legGeom = new THREE.CylinderGeometry(0.018, 0.012, 0.36, 8);
      const legPositions = [
        [-0.5, 0.18, -0.25],
        [0.5, 0.18, -0.25],
        [-0.5, 0.18, 0.25],
        [0.5, 0.18, 0.25]
      ];
      legPositions.forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(legGeom, darkSteel);
        leg.position.set(x, y, z);
        leg.castShadow = true;
        group.add(leg);
      });

      // Coffee table book stack
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.03, 0.2), brassMat);
      book.position.set(-0.15, 0.41, 0);
      group.add(top, book);
      break;
    }

    // 3. Media Wall & 75" TV Console
    case 'tv_media_wall': {
      // Low console credenza
      const credenza = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 0.4), woodMat);
      credenza.position.set(0, 0.225, 0);
      credenza.castShadow = true;

      // 75" Flat TV Screen
      const tvScreen = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 0.95, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.9 })
      );
      tvScreen.position.set(0, 1.35, 0.05);
      tvScreen.castShadow = true;

      // TV Soundbar
      const soundbar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.08), darkSteel);
      soundbar.position.set(0, 0.5, 0.05);

      group.add(credenza, tvScreen, soundbar);
      break;
    }

    // 4. King Bed Setup
    case 'king_bed': {
      // Padded Headboard (2.0m wide x 1.2m tall)
      const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.15, 0.14), cushionMat);
      headboard.position.set(0, 0.65, -0.95);
      headboard.castShadow = true;

      // Bed Base / Frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.32, 2.1), woodMat);
      frame.position.set(0, 0.16, 0.05);
      frame.castShadow = true;

      // Mattress
      const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
      const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.28, 2.0), mattressMat);
      mattress.position.set(0, 0.44, 0.05);
      mattress.castShadow = true;

      // Folded Duvet Blanket
      const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.14, 1.4), cushionMat);
      duvet.position.set(0, 0.55, 0.35);
      duvet.castShadow = true;

      // Dual Pillows
      const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.45), pillowMat);
      p1.position.set(-0.5, 0.62, -0.65);
      const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.45), pillowMat);
      p2.position.set(0.5, 0.62, -0.65);

      group.add(headboard, frame, mattress, duvet, p1, p2);
      break;
    }

    // 5. Bedside Nightstand with Lamp
    case 'nightstand': {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.42), woodMat);
      stand.position.set(0, 0.275, 0);
      stand.castShadow = true;

      // Mini Bedside Lamp
      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.2, 12), brassMat);
      lampBase.position.set(0, 0.65, 0);
      const lampShade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 0.22, 12),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4, emissive: 0xca8a04, emissiveIntensity: 0.25 })
      );
      lampShade.position.set(0, 0.82, 0);

      group.add(stand, lampBase, lampShade);
      break;
    }

    // 6. Kitchen Waterfall Island
    case 'kitchen_island': {
      // Marble Island Body (2.2m x 0.9m x 0.9m)
      const island = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.9, 0.95),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.25, metalness: 0.05 })
      );
      island.position.set(0, 0.45, 0);
      island.castShadow = true;
      island.receiveShadow = true;

      // Chrome Under-mount Sink & Faucet
      const sink = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.4), darkSteel);
      sink.position.set(-0.5, 0.91, 0);

      const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8), darkSteel);
      faucet.position.set(-0.5, 1.05, -0.15);

      // 3 Modern Barstools
      for (let s = -1; s <= 1; s++) {
        const stoolSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16), woodMat);
        stoolSeat.position.set(s * 0.65, 0.68, 0.6);
        stoolSeat.castShadow = true;

        const stoolLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.66, 8), darkSteel);
        stoolLeg.position.set(s * 0.65, 0.33, 0.6);
        group.add(stoolSeat, stoolLeg);
      }

      group.add(island, sink, faucet);
      break;
    }

    // 7. Kitchen Cabinet Counters & Cooktop
    case 'kitchen_counters': {
      const counterBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.65), darkSteel);
      counterBase.position.set(0, 0.45, 0);
      counterBase.castShadow = true;

      // Upper Cabinets
      const uppers = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 0.35), woodMat);
      uppers.position.set(0, 2.0, -0.15);
      uppers.castShadow = true;

      // Induction Cooktop
      const cooktop = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.02, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1 })
      );
      cooktop.position.set(0, 0.91, 0);

      group.add(counterBase, uppers, cooktop);
      break;
    }

    // 8. Refrigerator
    case 'refrigerator': {
      const fridge = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.85, 0.75),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.6 })
      );
      fridge.position.set(0, 0.925, 0);
      fridge.castShadow = true;
      group.add(fridge);
      break;
    }

    // 9. Dining Table & 6 Chairs
    case 'dining_table': {
      // Table top (1.8m x 0.9m)
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 0.9), woodMat);
      top.position.set(0, 0.75, 0);
      top.castShadow = true;
      top.receiveShadow = true;

      // 4 Table Legs
      const tLegGeom = new THREE.BoxGeometry(0.06, 0.72, 0.06);
      [
        [-0.8, 0.36, -0.38],
        [0.8, 0.36, -0.38],
        [-0.8, 0.36, 0.38],
        [0.8, 0.36, 0.38]
      ].forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(tLegGeom, darkSteel);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        group.add(leg);
      });

      // 6 Chairs
      const chairPositions = [
        [-0.55, 0, -0.55, 0],
        [0, 0, -0.55, 0],
        [0.55, 0, -0.55, 0],
        [-0.55, 0, 0.55, Math.PI],
        [0, 0, 0.55, Math.PI],
        [0.55, 0, 0.55, Math.PI]
      ];
      chairPositions.forEach(([cx, cy, cz, rot]) => {
        const chairGroup = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.4), cushionMat);
        seat.position.set(0, 0.45, 0);
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.03), cushionMat);
        back.position.set(0, 0.68, -0.18);
        const chairLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.43, 8), darkSteel);
        chairLeg.position.set(0, 0.22, 0);

        chairGroup.position.set(cx, cy, cz);
        chairGroup.rotation.y = rot;
        chairGroup.add(seat, back, chairLeg);
        group.add(chairGroup);
      });

      group.add(top);
      break;
    }

    // 10. Executive Desk & Chair
    case 'desk_setup': {
      // Desk (1.6m x 0.8m x 0.75m)
      const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.8), woodMat);
      deskTop.position.set(0, 0.74, 0);
      deskTop.castShadow = true;

      // Steel frame / legs
      const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 0.76), darkSteel);
      frameL.position.set(-0.76, 0.36, 0);
      const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 0.76), darkSteel);
      frameR.position.set(0.76, 0.36, 0);

      // Dual Monitors
      const monitorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
      const mon1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.02), monitorMat);
      mon1.position.set(-0.25, 1.02, -0.2);
      mon1.rotation.y = 0.1;

      const mon2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.02), monitorMat);
      mon2.position.set(0.25, 1.02, -0.2);
      mon2.rotation.y = -0.1;

      // Desk pad
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.005, 0.4), darkSteel);
      pad.position.set(0, 0.765, 0.05);

      group.add(deskTop, frameL, frameR, mon1, mon2, pad);
      break;
    }

    // 11. Executive Chair
    case 'executive_chair': {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.5), darkSteel);
      seat.position.set(0, 0.48, 0);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.06), darkSteel);
      back.position.set(0, 0.85, -0.22);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.44, 8), darkSteel);
      stem.position.set(0, 0.22, 0);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 5), darkSteel);
      base.position.set(0, 0.02, 0);

      group.add(seat, back, stem, base);
      break;
    }

    // 12. Freestanding Soaking Bathtub
    case 'bathtub': {
      const tubGeom = new THREE.CylinderGeometry(0.45, 0.38, 0.58, 32);
      const tubMesh = new THREE.Mesh(tubGeom, whitePorcelain);
      tubMesh.scale.set(1.7, 1.0, 0.85);
      tubMesh.position.set(0, 0.29, 0);
      tubMesh.castShadow = true;

      // Floor spout
      const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 8), darkSteel);
      spout.position.set(0, 0.4, 0.45);

      group.add(tubMesh, spout);
      break;
    }

    // 13. Vanity & LED Mirror
    case 'vanity_mirror': {
      const vanity = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 0.5), woodMat);
      vanity.position.set(0, 0.65, 0);
      vanity.castShadow = true;

      const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.12, 16), whitePorcelain);
      basin.position.set(0, 0.92, 0);

      // Backlit LED Mirror
      const mirror = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.8, 0.02),
        new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.05, metalness: 0.95 })
      );
      mirror.position.set(0, 1.55, -0.22);

      group.add(vanity, basin, mirror);
      break;
    }

    // 14. Modern Toilet
    case 'toilet': {
      const bowl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 0.6), whitePorcelain);
      bowl.position.set(0, 0.21, 0);
      const tank = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.22), whitePorcelain);
      tank.position.set(0, 0.65, -0.2);

      group.add(bowl, tank);
      break;
    }

    // 15. Sacred Mihrab Arch
    case 'mihrab_arch': {
      const archFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 2.2, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.3 })
      );
      archFrame.position.set(0, 1.1, 0);

      // Inner Arch Niche
      const innerArch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.05, 32, 1, false, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.5 })
      );
      innerArch.rotation.z = Math.PI / 2;
      innerArch.position.set(0, 1.6, 0.03);

      group.add(archFrame, innerArch);
      break;
    }

    // 16. Quran Rehal Stand
    case 'quran_stand': {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.38, 0.25), woodMat);
      stand.position.set(0, 0.19, 0);

      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.04, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.6 })
      );
      book.position.set(0, 0.4, 0);
      book.rotation.x = 0.2;

      group.add(stand, book);
      break;
    }

    // 17. Wardrobe Closet
    case 'wardrobe': {
      const wardrobe = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 2.2, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 })
      );
      wardrobe.position.set(0, 1.1, 0);
      wardrobe.castShadow = true;
      group.add(wardrobe);
      break;
    }

    // 18. Indoor Plant
    case 'indoor_plant': {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.4, 16), whitePorcelain);
      pot.position.set(0, 0.2, 0);
      pot.castShadow = true;

      // Foliage / Canopy
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), plantGreen);
      canopy.position.set(0, 0.75, 0);
      canopy.scale.set(1.0, 1.4, 1.0);
      canopy.castShadow = true;

      group.add(pot, canopy);
      break;
    }

    // 19. Balcony Terrace Set
    case 'balcony_set': {
      const bTable = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.03, 16), woodMat);
      bTable.position.set(0, 0.68, 0);

      const bStem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.66, 8), darkSteel);
      bStem.position.set(0, 0.33, 0);

      for (let s = -1; s <= 1; s += 2) {
        const chair = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.4, 12), brassMat);
        chair.position.set(s * 0.75, 0.35, 0);
        group.add(chair);
      }

      group.add(bTable, bStem);
      break;
    }

    // 20. Bookshelf Wall
    case 'bookshelf_wall': {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.0, 0.35), woodMat);
      shelf.position.set(0, 1.0, 0);
      shelf.castShadow = true;
      group.add(shelf);
      break;
    }

    default: {
      // Generic simple box representation
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), woodMat);
      box.position.set(0, 0.3, 0);
      group.add(box);
      break;
    }
  }

  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData = {
        parentGroup: group,
        selectable: true,
        type: 'furniture',
        id: item.id,
        name: item.name,
        roomId,
        roomName,
        furnitureItem: item
      };
    }
  });

  return group;
}

/**
 * Builds stylized architectural 3D trees with trunk and double foliage layer
 */
export function buildArchitecturalTree(x: number, z: number, scale = 1.0): THREE.Group {
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);

  const trunkGeom = new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 1.3 * scale, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = 0.65 * scale;
  trunk.castShadow = true;
  tree.add(trunk);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.75, flatShading: true });
  const cone1 = new THREE.Mesh(new THREE.ConeGeometry(0.8 * scale, 1.4 * scale, 7), leafMat);
  cone1.position.y = 1.65 * scale;
  cone1.castShadow = true;
  cone1.receiveShadow = true;

  const cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.6 * scale, 1.2 * scale, 7), leafMat);
  cone2.position.y = 2.35 * scale;
  cone2.castShadow = true;
  cone2.receiveShadow = true;

  tree.add(cone1, cone2);
  return tree;
}

/**
 * Builds a surrounding neighboring building with customizable height, style, floor bands, and labels
 */
export function buildSurroundingBuilding(b: SurroundingBuilding): THREE.Group {
  const group = new THREE.Group();
  group.name = `surrounding-bldg-${b.id}`;
  group.userData = {
    selectable: true,
    type: 'site_building',
    id: b.id,
    name: b.name,
    buildingId: b.id
  };

  const W = b.width * SCALE;
  const D = b.depth * SCALE;
  const H = b.height * SCALE;

  group.position.set(b.x * SCALE + W / 2, 0, b.z * SCALE + D / 2);

  let color = 0xd1d5db;
  if (b.style === 'brick') color = 0xa0522d;
  else if (b.style === 'glass') color = 0x64748b;
  else if (b.style === 'classic') color = 0xf5efe6;
  if (b.color) {
    try {
      color = parseInt(b.color.replace('#', '0x'), 16);
    } catch (e) {
      color = 0xd1d5db;
    }
  }

  const bldgMat = new THREE.MeshStandardMaterial({
    color,
    roughness: b.style === 'glass' ? 0.2 : 0.85,
    metalness: b.style === 'glass' ? 0.35 : 0.05
  });

  const mass = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), bldgMat);
  mass.position.y = H / 2;
  mass.castShadow = true;
  mass.receiveShadow = true;
  mass.userData = group.userData;
  group.add(mass);

  // Outline Edge Wireframe
  const edgeLine = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(W, H, D)),
    new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 1.2 })
  );
  edgeLine.position.y = H / 2;
  group.add(edgeLine);

  // Architectural Floor bands / horizontal mullions
  const floorCount = Math.max(1, Math.round(H / 1.0));
  for (let f = 1; f < floorCount; f++) {
    const yPos = f * (H / floorCount);
    const bandMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    const fBand = new THREE.Mesh(new THREE.BoxGeometry(W * 0.95, 0.12, 0.03), bandMat);
    fBand.position.set(0, yPos, -D / 2 - 0.015);
    const bBand = new THREE.Mesh(new THREE.BoxGeometry(W * 0.95, 0.12, 0.03), bandMat);
    bBand.position.set(0, yPos, D / 2 + 0.015);
    group.add(fBand, bBand);
  }

  // Label above building
  const bldgLabel = createTextSprite(`${b.name}\n${Math.round(b.height / 12)}' height`, {
    fontSize: 20,
    color: '#334155',
    bgColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: '#94a3b8',
    padding: 6
  });
  bldgLabel.position.set(0, H + 0.5, 0);
  bldgLabel.scale.set(1.5, 0.75, 1);
  group.add(bldgLabel);

  return group;
}

/**
 * Builds Site Context: Road, Sidewalk, Driveway, Lawn Boundary, Trees, and Neighboring Buildings
 */
export function buildRoadAndSiteEnvironment(
  site: SiteEnvironment,
  houseBounds: { minX: number; maxX: number; minZ: number; maxZ: number }
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'site-environment-group';

  const plotW = (site.plotWidth || 840) * SCALE;
  const plotD = (site.plotDepth || 960) * SCALE;
  const houseCenterX = ((houseBounds.minX + houseBounds.maxX) / 2) * SCALE;
  const houseFrontZ = houseBounds.minZ * SCALE;

  // 1. Plot Perimeter Lawn
  const lawnGeom = new THREE.BoxGeometry(plotW, 0.02, plotD);
  const lawnMat = new THREE.MeshStandardMaterial({
    color: 0x86efac, // soft green lawn
    roughness: 0.9
  });
  const lawn = new THREE.Mesh(lawnGeom, lawnMat);
  lawn.position.set(houseCenterX, -0.015, houseFrontZ + plotD / 2 - 2.0);
  lawn.receiveShadow = true;
  group.add(lawn);

  // Plot Boundary Wall / Border
  if (site.showPlotBoundary) {
    const boundaryGeom = new THREE.BoxGeometry(plotW + 0.08, 0.1, plotD + 0.08);
    const boundaryLine = new THREE.LineSegments(
      new THREE.EdgesGeometry(boundaryGeom),
      new THREE.LineBasicMaterial({ color: 0x15803d, linewidth: 2 })
    );
    boundaryLine.position.copy(lawn.position);
    group.add(boundaryLine);
  }

  // 2. Road (Asphalt)
  if (site.showRoad) {
    const roadW = 55.0; // span wide across scenery
    const roadDepth = (site.roadWidth || 260) * SCALE;
    const roadZ = houseFrontZ - 2.0 - roadDepth / 2;

    const roadGeom = new THREE.BoxGeometry(roadW, 0.025, roadDepth);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // dark charcoal asphalt
      roughness: 0.85
    });
    const road = new THREE.Mesh(roadGeom, roadMat);
    road.position.set(houseCenterX, -0.01, roadZ);
    road.receiveShadow = true;
    group.add(road);

    // Yellow Dashed Centerline
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const numDashes = 20;
    for (let i = -numDashes; i <= numDashes; i++) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.08), dashMat);
      dash.position.set(houseCenterX + i * 1.3, 0.005, roadZ);
      group.add(dash);
    }

    // Concrete Curbs
    const curbGeom = new THREE.BoxGeometry(roadW, 0.08, 0.15);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const northCurb = new THREE.Mesh(curbGeom, curbMat);
    northCurb.position.set(houseCenterX, 0.02, roadZ + roadDepth / 2 + 0.075);
    const southCurb = new THREE.Mesh(curbGeom, curbMat);
    southCurb.position.set(houseCenterX, 0.02, roadZ - roadDepth / 2 - 0.075);
    group.add(northCurb, southCurb);

    // Sidewalk
    if (site.showSidewalk) {
      const walkGeom = new THREE.BoxGeometry(roadW, 0.04, 1.2);
      const walkMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 });
      const sidewalk = new THREE.Mesh(walkGeom, walkMat);
      sidewalk.position.set(houseCenterX, 0.01, roadZ + roadDepth / 2 + 0.15 + 0.6);
      sidewalk.receiveShadow = true;
      group.add(sidewalk);
    }

    // Driveway connecting house to road
    if (site.showDriveway) {
      const driveW = 3.6; // ~12 ft driveway
      const driveDepth = Math.max(1.8, Math.abs(lawn.position.z - roadZ));
      const driveGeom = new THREE.BoxGeometry(driveW, 0.03, driveDepth);
      const driveMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 });
      const driveway = new THREE.Mesh(driveGeom, driveMat);
      driveway.position.set(houseCenterX - 2.0, 0.005, (houseFrontZ + roadZ + roadDepth / 2) / 2);
      driveway.receiveShadow = true;
      group.add(driveway);
    }
  }

  // 3. Landscape Trees
  if (site.showTrees) {
    const treePositions = [
      [houseCenterX - plotW / 2 + 1.2, houseFrontZ + 1.2],
      [houseCenterX + plotW / 2 - 1.4, houseFrontZ + 1.2],
      [houseCenterX - plotW / 2 + 1.4, houseFrontZ + plotD - 3.2],
      [houseCenterX + plotW / 2 - 1.2, houseFrontZ + plotD - 3.5],
      [houseCenterX + 3.8, houseFrontZ - 0.8] // street-facing tree
    ];
    treePositions.slice(0, site.treeCount || 5).forEach(([tx, tz]) => {
      group.add(buildArchitecturalTree(tx, tz, 1.0));
    });
  }

  // 4. Surrounding Neighbor Buildings
  if (site.surroundingBuildings && site.surroundingBuildings.length > 0) {
    site.surroundingBuildings.forEach((bldg) => {
      group.add(buildSurroundingBuilding(bldg));
    });
  }

  return group;
}

/**
 * Builds the entire multi-room 3D House Plan with connected walls,
 * individual room floors, furniture meshes, and 3D room label badges.
 */
export function buildHouse3DPlan(
  house: HousePlan,
  materials: RoomMaterials,
  settings: ViewSettings,
  onSelectRoom?: (roomId: string) => void
): {
  houseGroup: THREE.Group;
  labelsGroup: THREE.Group;
} {
  const houseGroup = new THREE.Group();
  const labelsGroup = new THREE.Group();
  houseGroup.name = 'house-3d-root';

  // Ground Plot / Exterior Terrain
  if (house.showExteriorGround) {
    const groundGeom = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xeae8e3,
      roughness: 0.95
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.04;
    ground.receiveShadow = true;
    houseGroup.add(ground);
  }

  // Iterate over each room in the house plan
  house.rooms.forEach((room) => {
    const roomGroup = new THREE.Group();
    roomGroup.name = `house-room-${room.id}`;

    const rOffsetX = room.gridX * SCALE;
    const rOffsetZ = room.gridZ * SCALE;
    roomGroup.position.set(rOffsetX, 0, rOffsetZ);

    const W = room.specs.width * SCALE;
    const D = room.specs.depth * SCALE;
    const H = (settings.wallCutawayHeight > 0
      ? settings.wallCutawayHeight
      : room.specs.height) * SCALE;

    const wallThick = 0.12;

    // 1. Room Floor
    let floorMat = materials.floor;
    if (room.specs.floorMaterial === 'hardwood') floorMat = materials.oakWood;
    else if (room.specs.floorMaterial === 'marble') floorMat = materials.floor;
    else if (room.specs.floorMaterial === 'carpet') floorMat = materials.acousticFelt;
    else if (room.specs.floorMaterial === 'terrazzo') floorMat = materials.floor;

    const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), floorMat);
    floorMesh.position.set(W / 2, -0.02, D / 2);
    floorMesh.receiveShadow = true;
    floorMesh.userData = {
      selectable: true,
      type: 'floor',
      id: `floor-${room.id}`,
      name: `${room.name} Floor`,
      roomId: room.id,
      roomName: room.name
    };
    roomGroup.add(floorMesh);

    // Floor Perimeter Edge Line
    const floorEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(W, 0.04, D)),
      new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 1.5 })
    );
    floorEdge.position.copy(floorMesh.position);
    roomGroup.add(floorEdge);

    // 2. Room Walls
    const isFocused = house.activeRoomId === room.id;
    const roomWallMat = isFocused
      ? new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
      : materials.wall;

    // Front Wall (with door)
    const doorW = room.specs.doorWidth * SCALE;
    const doorH = room.specs.doorHeight * SCALE;
    const leftW = room.specs.doorOffsetLeft * SCALE;
    const rightW = Math.max(0.1, (room.specs.width - room.specs.doorOffsetLeft - room.specs.doorWidth) * SCALE);

    // Front Left
    const fLeft = new THREE.Mesh(new THREE.BoxGeometry(leftW, H, wallThick), roomWallMat);
    fLeft.position.set(leftW / 2, H / 2, -wallThick / 2);
    fLeft.castShadow = true;
    fLeft.receiveShadow = true;
    fLeft.userData = {
      selectable: true,
      type: 'wall',
      id: `wall-front-${room.id}`,
      name: `${room.name} Entrance Wall`,
      wallPosition: 'front',
      roomId: room.id,
      roomName: room.name
    };

    // Front Right
    const fRight = new THREE.Mesh(new THREE.BoxGeometry(rightW, H, wallThick), roomWallMat);
    fRight.position.set(leftW + doorW + rightW / 2, H / 2, -wallThick / 2);
    fRight.castShadow = true;
    fRight.receiveShadow = true;
    fRight.userData = fLeft.userData;

    // Header over Door
    const headerH = Math.max(0, H - doorH);
    if (headerH > 0) {
      const fHead = new THREE.Mesh(new THREE.BoxGeometry(doorW, headerH, wallThick), roomWallMat);
      fHead.position.set(leftW + doorW / 2, doorH + headerH / 2, -wallThick / 2);
      fHead.userData = fLeft.userData;
      roomGroup.add(fHead);
    }
    roomGroup.add(fLeft, fRight);

    // Dynamic Door Leaf
    if (room.specs.doorType !== 'open_arch') {
      const doorLeafThick = 0.04;
      const doorLeafGeom = new THREE.BoxGeometry(doorW, doorH, doorLeafThick);
      const doorLeafMesh = new THREE.Mesh(doorLeafGeom, materials.oakWood);
      doorLeafMesh.castShadow = true;
      const doorPivot = new THREE.Group();
      doorPivot.name = `door-${room.id}`;
      const angle = ((room.specs.doorOpenAngle ?? 45) * Math.PI) / 180;
      if (room.specs.doorHinge === 'left') {
        doorPivot.position.set(leftW, 0, -wallThick / 2);
        doorLeafMesh.position.set(doorW / 2, doorH / 2, 0);
        doorPivot.rotation.y = angle;
      } else {
        doorPivot.position.set(leftW + doorW, 0, -wallThick / 2);
        doorLeafMesh.position.set(-doorW / 2, doorH / 2, 0);
        doorPivot.rotation.y = -angle;
      }
      doorPivot.add(doorLeafMesh);
      const doorUserData = {
        selectable: true,
        type: 'door',
        id: `door-${room.id}`,
        name: `${room.name} Door`,
        roomId: room.id,
        roomName: room.name
      };
      doorPivot.userData = doorUserData;
      doorLeafMesh.userData = doorUserData;
      roomGroup.add(doorPivot);
    }

    // Left Wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, H, D), roomWallMat);
    leftWall.position.set(-wallThick / 2, H / 2, D / 2);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    leftWall.userData = {
      selectable: true,
      type: 'wall',
      id: `wall-left-${room.id}`,
      name: `${room.name} Left Wall`,
      wallPosition: 'left',
      roomId: room.id,
      roomName: room.name
    };
    roomGroup.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, H, D), roomWallMat);
    rightWall.position.set(W + wallThick / 2, H / 2, D / 2);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    rightWall.userData = {
      selectable: true,
      type: 'wall',
      id: `wall-right-${room.id}`,
      name: `${room.name} Right Wall`,
      wallPosition: 'right',
      roomId: room.id,
      roomName: room.name
    };
    roomGroup.add(rightWall);

    // Back Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(W, H, wallThick), roomWallMat);
    backWall.position.set(W / 2, H / 2, D + wallThick / 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    backWall.userData = {
      selectable: true,
      type: 'wall',
      id: `wall-back-${room.id}`,
      name: `${room.name} Back Wall`,
      wallPosition: 'back',
      roomId: room.id,
      roomName: room.name
    };
    roomGroup.add(backWall);

    // 2.b Structural Stud Framing (if enabled)
    if (settings.showStudFraming) {
      const studMat = materials.studs;
      const studSpacing = 0.6;
      for (let sx = 0.3; sx < W; sx += studSpacing) {
        const sFront = new THREE.Mesh(new THREE.BoxGeometry(0.04, H, 0.08), studMat);
        sFront.position.set(sx, H / 2, -wallThick / 2);
        const sBack = new THREE.Mesh(new THREE.BoxGeometry(0.04, H, 0.08), studMat);
        sBack.position.set(sx, H / 2, D + wallThick / 2);
        roomGroup.add(sFront, sBack);
      }
      for (let sz = 0.3; sz < D; sz += studSpacing) {
        const sLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, H, 0.04), studMat);
        sLeft.position.set(-wallThick / 2, H / 2, sz);
        const sRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, H, 0.04), studMat);
        sRight.position.set(W + wallThick / 2, H / 2, sz);
        roomGroup.add(sLeft, sRight);
      }
    }

    // 2.c Room Ceiling (if Solid or Transparent)
    if (settings.ceilingMode === 'solid') {
      const ceilGeom = new THREE.BoxGeometry(W, 0.04, D);
      const ceilMesh = new THREE.Mesh(ceilGeom, materials.ceiling);
      ceilMesh.position.set(W / 2, H + 0.02, D / 2);
      ceilMesh.castShadow = true;
      ceilMesh.receiveShadow = true;
      ceilMesh.userData = {
        selectable: true,
        type: 'ceiling',
        id: `ceiling-${room.id}`,
        name: `${room.name} Ceiling`,
        roomId: room.id,
        roomName: room.name
      };
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
      ceilMesh.userData = {
        selectable: true,
        type: 'ceiling',
        id: `ceiling-${room.id}`,
        name: `${room.name} Ceiling`,
        roomId: room.id,
        roomName: room.name
      };
      roomGroup.add(ceilMesh);
    }

    // 2.d Human Scale Reference Figure (if enabled)
    if (settings.showHumanFigure && (isFocused || room.id === house.rooms[0]?.id)) {
      const human = buildHumanFigure(W / 2 - 0.5, 0, D / 2);
      roomGroup.add(human);
    }

    // 3. Privacy Partition if specified
    if (room.specs.partitionDepth > 0) {
      const partD = room.specs.partitionDepth * SCALE;
      const partH = Math.min(H, room.specs.partitionHeight * SCALE);
      const partT = room.specs.partitionThickness * SCALE;
      const partX = (room.specs.partitionPositionX || 90) * SCALE;

      let pMat = materials.partition;
      if (room.specs.partitionStyle === 'timber_slats') pMat = materials.oakWood;
      else if (room.specs.partitionStyle === 'fluted_glass') pMat = materials.flutedGlass;
      else if (room.specs.partitionStyle === 'mashrabiya') pMat = materials.mashrabiya;

      const partMesh = new THREE.Mesh(new THREE.BoxGeometry(partT, partH, partD), pMat);
      partMesh.position.set(partX + partT / 2, partH / 2, partD / 2);
      partMesh.castShadow = true;
      partMesh.userData = {
        selectable: true,
        type: 'partition',
        id: `partition-${room.id}`,
        name: `${room.name} Partition`,
        roomId: room.id,
        roomName: room.name
      };
      roomGroup.add(partMesh);
    }

    // 4. Furniture Items in this Room
    const furnitureContainer = new THREE.Group();
    furnitureContainer.position.set(W / 2, 0, D / 2); // centered in room
    room.furniture.forEach((item) => {
      if (item.enabled) {
        const itemMesh = buildFurnitureMesh(item, materials, room.id, room.name);
        furnitureContainer.add(itemMesh);
      }
    });
    roomGroup.add(furnitureContainer);

    // 5. 3D Floating Room Label Badge
    if (house.showRoomLabels3D) {
      const sqFt = Math.round((room.specs.width * room.specs.depth) / 144);
      const labelText = `${room.name}\n${sqFt} sq ft`;
      const labelSprite = createTextSprite(labelText, {
        fontSize: 26,
        color: isFocused ? '#0284C7' : '#1e293b',
        bgColor: isFocused ? 'rgba(224, 242, 254, 0.95)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: isFocused ? '#0284C7' : 'rgba(0,0,0,0.15)',
        padding: 10
      });
      labelSprite.position.set(rOffsetX + W / 2, H + 0.6, rOffsetZ + D / 2);
      labelSprite.scale.set(1.8, 0.9, 1);
      labelsGroup.add(labelSprite);
    }

    houseGroup.add(roomGroup);
  });

  // 6. Site Context (Road, Sidewalk, Lawn, Trees, Surrounding Buildings)
  if (house.siteEnvironment) {
    let minX = 0, maxX = 300, minZ = 0, maxZ = 300;
    house.rooms.forEach((r) => {
      if (r.gridX < minX) minX = r.gridX;
      if (r.gridX + r.specs.width > maxX) maxX = r.gridX + r.specs.width;
      if (r.gridZ < minZ) minZ = r.gridZ;
      if (r.gridZ + r.specs.depth > maxZ) maxZ = r.gridZ + r.specs.depth;
    });
    const siteMesh = buildRoadAndSiteEnvironment(house.siteEnvironment, { minX, maxX, minZ, maxZ });
    houseGroup.add(siteMesh);
  }

  return { houseGroup, labelsGroup };
}
