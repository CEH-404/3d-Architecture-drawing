import { HouseRoom, HousePlan, DesignSuggestion, RoomType } from '../types';
import { createDefaultFurnitureForRoom } from './houseTemplates';

export function analyzeRoomSuggestions(room: HouseRoom, house?: HousePlan): DesignSuggestion[] {
  const suggestions: DesignSuggestion[] = [];
  const { specs, type } = room;

  // 1. Daylight & Glazing Ratio Check
  const floorAreaSqFt = (specs.width * specs.depth) / 144;
  const windowAreaSqFt = (specs.windowWidth * specs.windowHeight) / 144;
  const glazingRatio = (windowAreaSqFt / floorAreaSqFt) * 100;

  if (glazingRatio < 10) {
    suggestions.push({
      id: `daylight-expand-${room.id}`,
      title: "Expand Natural Daylight Glazing",
      category: "daylight",
      impact: "high",
      roomType: type,
      description: `Current window area is only ${glazingRatio.toFixed(1)}% of floor area. International architectural standards recommend 12% to 18% for optimal circadian health and reduced daytime lighting loads.`,
      benefit: "Boosts natural illumination, visual spaciousness and energy efficiency."
    });
  } else if (glazingRatio > 25) {
    suggestions.push({
      id: `glazing-solar-${room.id}`,
      title: "Add Triple Mullions & Solar Shading",
      category: "daylight",
      impact: "medium",
      roomType: type,
      description: `High glazing ratio (${glazingRatio.toFixed(1)}%) creates great views but may cause solar heat gain. We suggest multi-pane mullions or low-E tinted glazing.`,
      benefit: "Prevents direct glare on screens/prayer mats while retaining exterior vistas."
    });
  }

  // 2. Doorway & Walkway Ergonomics
  if (specs.doorWidth < 36) {
    suggestions.push({
      id: `door-widen-${room.id}`,
      title: "Widen Entry Doorway to 36\"+ (Universal Access)",
      category: "ergonomics",
      impact: "high",
      roomType: type,
      description: `Current door width is ${specs.doorWidth}". Expanding to standard 36" or 42" allows comfortable wheelchair access, furniture delivery, and grand architectural proportion.`,
      benefit: "Complies with Universal Design (ADA/Part M) guidelines."
    });
  }

  // 3. Room-Specific Architectural Recommendations
  if (type === 'prayer_room') {
    if (!specs.showPrayerMat) {
      suggestions.push({
        id: `pr-sajjadah-${room.id}`,
        title: "Place Emerald Velvet Sajjadah Carpets",
        category: "sacred_orientation",
        impact: "high",
        roomType: "prayer_room",
        description: "Equip the Musalla with plush emerald prayer rugs aligned toward the back Qibla focal wall.",
        benefit: "Provides immediate sacred atmosphere and clean designated prayer rows."
      });
    }
    if (specs.partitionStyle !== 'mashrabiya' && specs.partitionStyle !== 'timber_slats') {
      suggestions.push({
        id: `pr-mashrabiya-${room.id}`,
        title: "Upgrade to Islamic Mashrabiya Privacy Wing",
        category: "sacred_orientation",
        impact: "high",
        roomType: "prayer_room",
        description: "Replace standard drywall partition with handcrafted geometric Mashrabiya lattice for authentic visual seclusion without blocking air and light.",
        benefit: "Shields worshipers from entrance sightlines while introducing spiritual geometry."
      });
    }
    if (!specs.showEntryBench) {
      suggestions.push({
        id: `pr-bench-${room.id}`,
        title: "Add Entryway Shoe Console & Bench",
        category: "furniture",
        impact: "recommended",
        roomType: "prayer_room",
        description: "Include a low shoe bench near the entrance door to organize footwear cleanly before stepping onto prayer carpets.",
        benefit: "Maintains ritual cleanliness (Taharah) and floor tidiness."
      });
    }
  }

  if (type === 'living_room') {
    if (!room.furniture.some(f => f.itemType === 'sofa_sectional')) {
      suggestions.push({
        id: `lr-sofa-${room.id}`,
        title: "Furnish with Deep L-Shape Sectional & Media Wall",
        category: "furniture",
        impact: "high",
        roomType: "living_room",
        description: "Anchor the living room with a premium upholstered sectional sofa facing the feature media console wall.",
        benefit: "Maximizes comfortable family seating and creates defined conversational zones."
      });
    }
    if (specs.floorMaterial !== 'hardwood' && specs.floorMaterial !== 'marble' && specs.floorMaterial !== 'terrazzo') {
      suggestions.push({
        id: `lr-floor-${room.id}`,
        title: "Upgrade to Warm Oak Plank Flooring",
        category: "layout",
        impact: "medium",
        roomType: "living_room",
        description: "Switch raw concrete to warm wide-plank European oak flooring with satin polyurethane finish.",
        benefit: "Adds acoustic warmth, timeless luxury, and easy maintenance."
      });
    }
  }

  if (type === 'master_bedroom') {
    if (!room.furniture.some(f => f.itemType === 'king_bed')) {
      suggestions.push({
        id: `mb-bed-${room.id}`,
        title: "Place King Bed with Fluted Glass Privacy Screen",
        category: "furniture",
        impact: "high",
        roomType: "master_bedroom",
        description: "Center a King-size bed on the solid feature wall, accompanied by dual floating nightstands and a fluted glass entrance partition.",
        benefit: "Protects sleeping area from corridor door sightlines and gives 5-star hotel comfort."
      });
    }
  }

  if (type === 'kitchen') {
    if (!room.furniture.some(f => f.itemType === 'kitchen_island')) {
      suggestions.push({
        id: `k-island-${room.id}`,
        title: "Install Marble Waterfall Island with Barstools",
        category: "furniture",
        impact: "high",
        roomType: "kitchen",
        description: "Add a central 7ft marble island with undercounter storage and 3 leather barstools for casual dining and prep space.",
        benefit: "Optimizes the kitchen work triangle (fridge-sink-cooktop) and creates an open social hub."
      });
    }
    if (specs.doorType !== 'open_arch' && specs.doorType !== 'sliding') {
      suggestions.push({
        id: `k-arch-${room.id}`,
        title: "Convert Door to Open Architectural Arch",
        category: "layout",
        impact: "medium",
        roomType: "kitchen",
        description: "Remove swinging door obstruction and create a clean 4'0\" drywall cased opening for effortless serving flow to dining.",
        benefit: "Improves food transit and visual connection between culinary prep and living zones."
      });
    }
  }

  if (type === 'home_office') {
    if (specs.partitionStyle !== 'fluted_glass' && specs.partitionStyle !== 'acoustic_felt') {
      suggestions.push({
        id: `ho-acoustic-${room.id}`,
        title: "Install Acoustic Felt or Fluted Glass Partition",
        category: "ergonomics",
        impact: "high",
        roomType: "home_office",
        description: "Add sound-absorbing acoustic felt or ribbed glass partition to dampen keyboard clicks and video call reverberation.",
        benefit: "Creates an acoustically isolated productivity environment."
      });
    }
    if (!specs.showBookshelf) {
      suggestions.push({
        id: `ho-books-${room.id}`,
        title: "Add Floor-to-Ceiling Library Bookcase",
        category: "furniture",
        impact: "recommended",
        roomType: "home_office",
        description: "Integrate a built-in walnut shelving unit along the side wall for reference books, art display and camera backdrop.",
        benefit: "Enhances video meeting background aesthetics and executive storage."
      });
    }
  }

  if (type === 'bathroom') {
    if (!room.furniture.some(f => f.itemType === 'bathtub')) {
      suggestions.push({
        id: `ba-tub-${room.id}`,
        title: "Add Freestanding Oval Soaking Tub & Double Vanity",
        category: "furniture",
        impact: "high",
        roomType: "bathroom",
        description: "Transform bathroom into a wellness spa with freestanding acrylic tub, dual backlit mirrors and marble slab tiles.",
        benefit: "Elevates daily self-care and increases property appraisal value."
      });
    }
  }

  // 4. Ceiling Height & Volume
  if (specs.height >= 144) {
    suggestions.push({
      id: `ceil-pendant-${room.id}`,
      title: "Add Statement Architectural Pendant Fixture",
      category: "lighting",
      impact: "recommended",
      roomType: type,
      description: `With a generous ${Math.round(specs.height / 12)}ft ceiling, a suspended pendant or cove chandelier fills vertical negative space with warm diffuse illumination.`,
      benefit: "Anchors the room vertically and prevents hollow acoustic echo."
    });
  }

  return suggestions;
}

export function applySuggestionToRoom(
  suggestionId: string,
  room: HouseRoom
): HouseRoom {
  const updated = JSON.parse(JSON.stringify(room)) as HouseRoom;

  if (suggestionId.startsWith('daylight-expand')) {
    updated.specs.windowWidth = Math.min(120, Math.round(updated.specs.width * 0.55));
    updated.specs.windowHeight = 54;
    updated.specs.windowSillHeight = 36;
  } else if (suggestionId.startsWith('door-widen')) {
    updated.specs.doorWidth = 42;
  } else if (suggestionId.startsWith('pr-sajjadah')) {
    updated.specs.showPrayerMat = true;
    updated.specs.prayerMatCount = 2;
    updated.specs.prayerMatPattern = 'classic_emerald';
    if (!updated.furniture.some(f => f.itemType === 'prayer_rug')) {
      updated.furniture.push({
        id: `f-pr-rug-${Date.now()}`,
        name: 'Emerald Sajjadah Carpet',
        category: 'prayer',
        itemType: 'prayer_rug',
        x: 0,
        z: 40,
        rotation: 0,
        enabled: true,
        color: '#047857'
      });
    }
  } else if (suggestionId.startsWith('pr-mashrabiya')) {
    updated.specs.partitionStyle = 'mashrabiya';
    updated.specs.partitionHeight = Math.min(updated.specs.height - 24, 96);
  } else if (suggestionId.startsWith('pr-bench')) {
    updated.specs.showEntryBench = true;
  } else if (suggestionId.startsWith('lr-sofa')) {
    updated.furniture = createDefaultFurnitureForRoom('living_room');
    updated.specs.floorMaterial = 'hardwood';
  } else if (suggestionId.startsWith('lr-floor')) {
    updated.specs.floorMaterial = 'hardwood';
  } else if (suggestionId.startsWith('mb-bed')) {
    updated.furniture = createDefaultFurnitureForRoom('master_bedroom');
    updated.specs.partitionStyle = 'fluted_glass';
    updated.specs.floorMaterial = 'carpet';
  } else if (suggestionId.startsWith('k-island')) {
    updated.furniture = createDefaultFurnitureForRoom('kitchen');
    updated.specs.floorMaterial = 'marble';
  } else if (suggestionId.startsWith('k-arch')) {
    updated.specs.doorType = 'open_arch';
    updated.specs.doorWidth = 48;
  } else if (suggestionId.startsWith('ho-acoustic')) {
    updated.specs.partitionStyle = 'acoustic_felt';
  } else if (suggestionId.startsWith('ho-books')) {
    updated.specs.showBookshelf = true;
  } else if (suggestionId.startsWith('ba-tub')) {
    updated.furniture = createDefaultFurnitureForRoom('bathroom');
    updated.specs.floorMaterial = 'marble';
  } else if (suggestionId.startsWith('ceil-pendant')) {
    updated.specs.showPendantLight = true;
  }

  return updated;
}

export function applyAllSuggestionsToRoom(room: HouseRoom): HouseRoom {
  const suggestions = analyzeRoomSuggestions(room);
  let result = room;
  for (const s of suggestions) {
    result = applySuggestionToRoom(s.id, result);
  }
  return result;
}
