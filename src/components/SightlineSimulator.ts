import * as THREE from 'three';
import { ViewSettings, RoomDimensions } from '../types';
import { ROOM_SPECS, SCALE } from '../utils/constants';

export function buildSightlineVisualization(
  settings: ViewSettings,
  specs: RoomDimensions = ROOM_SPECS
): { sightlineGroup: THREE.Group; observerPosition: THREE.Vector3; eyePosition: THREE.Vector3 } {
  const sightlineGroup = new THREE.Group();

  const W = specs.width * SCALE;
  const D = specs.depth * SCALE;

  // Doorway dimensions
  const doorLeft = specs.doorOffsetLeft * SCALE;
  const doorWidth = specs.doorWidth * SCALE;
  const doorCenter = doorLeft + doorWidth / 2; // ~1.75m

  // Partition boundaries
  const partX = (specs.partitionPositionX || (specs.doorOffsetLeft + specs.doorWidth)) * SCALE;
  const partDepth = specs.partitionDepth * SCALE;
  const partHeight = specs.partitionHeight * SCALE;
  const partThick = specs.partitionThickness * SCALE;

  // Observer position based on setting
  let observerPos = new THREE.Vector3(doorCenter, 0, -0.6); // standing in front of open doorway
  if (settings.interactiveSightlineOrigin === 'door_threshold') {
    observerPos.set(doorCenter, 0, 0.05);
  } else if (settings.interactiveSightlineOrigin === 'inside_entry') {
    observerPos.set(doorCenter, 0, 1.4); // stepped past threshold
  }

  const eyeHeight = 1.676; // 5'6" (66 inches)
  const eyePos = observerPos.clone().add(new THREE.Vector3(0, eyeHeight, 0));

  // 1. Human Scale Figure
  if (settings.showHumanFigure || settings.showSightlines) {
    const avatarGroup = new THREE.Group();
    const avatarMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.5,
      metalness: 0.1
    });

    // Head
    const headGeom = new THREE.SphereGeometry(0.11, 16, 16);
    const headMesh = new THREE.Mesh(headGeom, avatarMat);
    headMesh.position.set(0, eyeHeight, 0);
    avatarGroup.add(headMesh);

    // Torso / Body
    const bodyGeom = new THREE.CylinderGeometry(0.16, 0.18, 0.7, 16);
    const bodyMesh = new THREE.Mesh(bodyGeom, avatarMat);
    bodyMesh.position.set(0, 1.15, 0);
    avatarGroup.add(bodyMesh);

    // Legs
    const legGeom = new THREE.CylinderGeometry(0.06, 0.05, 0.8, 12);
    const leg1 = new THREE.Mesh(legGeom, avatarMat);
    leg1.position.set(-0.09, 0.4, 0);
    const leg2 = new THREE.Mesh(legGeom, avatarMat);
    leg2.position.set(0.09, 0.4, 0);
    avatarGroup.add(leg1, leg2);

    // Floor Base circle
    const baseGeom = new THREE.RingGeometry(0.18, 0.22, 32);
    const baseMesh = new THREE.Mesh(
      baseGeom,
      new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide })
    );
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.y = 0.01;
    avatarGroup.add(baseMesh);

    avatarGroup.position.copy(observerPos);
    sightlineGroup.add(avatarGroup);
  }

  // 2. Sightline Rays (Laser Ray-Casting from 5'6" eye height)
  if (settings.showSightlines) {
    // Generate fan of rays across room targets
    const numHorizontalAngles = 25;
    const horizontalFov = (Math.PI / 180) * 85; // 85 deg FOV
    const baseYaw = Math.PI / 2; // looking into +Z

    // Partition bounding box for ray intersection
    const partMin = new THREE.Vector3(partX, 0, 0);
    const partMax = new THREE.Vector3(partX + partThick, partHeight, partDepth);

    // Room bounding box
    const roomMin = new THREE.Vector3(0, 0, 0);
    const roomMax = new THREE.Vector3(W, specs.height * SCALE, D);

    for (let i = 0; i < numHorizontalAngles; i++) {
      const t = i / (numHorizontalAngles - 1) - 0.5;
      const angleY = t * horizontalFov;

      // Pitch variation (slightly up and slightly down)
      for (const pitch of [-0.08, 0, 0.08]) {
        const dir = new THREE.Vector3(
          Math.sin(angleY),
          pitch,
          Math.cos(angleY)
        ).normalize();

        // Raycasting step
        let hitPoint = eyePos.clone().add(dir.clone().multiplyScalar(6.0));
        let isBlockedByPartition = false;

        // Simple ray-AABB intersection with partition
        const ray = new THREE.Ray(eyePos, dir);
        const partBox = new THREE.Box3(partMin, partMax);
        const partIntersection = new THREE.Vector3();
        
        if (ray.intersectBox(partBox, partIntersection)) {
          hitPoint = partIntersection;
          isBlockedByPartition = true;
        } else {
          // Intersect with room shell walls
          const roomBox = new THREE.Box3(roomMin, roomMax);
          const roomIntersection = new THREE.Vector3();
          if (ray.intersectBox(roomBox, roomIntersection)) {
            hitPoint = roomIntersection;
          }
        }

        // Create colored line segment
        const points = [eyePos, hitPoint];
        const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: isBlockedByPartition ? 0xef4444 : 0x10b981,
          transparent: true,
          opacity: isBlockedByPartition ? 0.85 : 0.4,
          linewidth: isBlockedByPartition ? 2 : 1
        });
        const rayLine = new THREE.Line(lineGeom, lineMat);
        sightlineGroup.add(rayLine);

        // Impact dot if blocked by partition
        if (isBlockedByPartition) {
          const dotGeom = new THREE.SphereGeometry(0.025, 8, 8);
          const dotMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const dotMesh = new THREE.Mesh(dotGeom, dotMat);
          dotMesh.position.copy(hitPoint);
          sightlineGroup.add(dotMesh);
        }
      }
    }

    // 3. Privacy Zone Floor Overlay (Showing area protected from doorway sightlines)
    const privacyShape = new THREE.Shape();
    // Polygon covering the protected room region
    privacyShape.moveTo(0, 0);
    privacyShape.lineTo(0, D);
    privacyShape.lineTo(W, D);
    privacyShape.lineTo(W, partDepth);
    privacyShape.lineTo(partX + partThick, partDepth);
    privacyShape.lineTo(partX + partThick, 0);
    privacyShape.lineTo(doorLeft + doorWidth, 0);

    const privacyGeom = new THREE.ShapeGeometry(privacyShape);
    const privacyMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide
    });
    const privacyMesh = new THREE.Mesh(privacyGeom, privacyMat);
    privacyMesh.rotation.x = -Math.PI / 2;
    privacyMesh.position.set(0, 0.015, 0);
    sightlineGroup.add(privacyMesh);
  }

  return { sightlineGroup, observerPosition: observerPos, eyePosition: eyePos };
}

