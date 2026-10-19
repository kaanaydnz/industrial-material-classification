import type {
    Material,
    MaterialFilters,
    Project,
    ClassificationHistoryEntry,
    ClassificationFieldChange,
} from '../types/material';

const STORAGE_KEYS = {
    materials: 'industrial-classification-materials-v4',
    drafts: 'industrial-classification-drafts-v4',
    history: 'industrial-classification-history-v4',
} as const;

function readStoredData<T>(key: string, fallback: T): T {
    try {
        const stored = localStorage.getItem(key);
        return stored ? (JSON.parse(stored) as T) : fallback;
    } catch {
        return fallback;
    }
}

function persistData<T>(key: string, data: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Failed to persist ${key}:`, error);
    }
}

const projects: Project[] = [
    {
        id: 'PRJ-1001',
        projectNumber: '1001',
        name: 'Mechanical Components & Assemblies',
        description: 'Classification of core drive elements, bearings, and fasteners',
        status: 'active',
        updatedAt: '2026-10-16T10:20:00Z',
    },
    {
        id: 'PRJ-1002',
        projectNumber: '1002',
        name: 'Electrical Infrastructure & Cabling',
        description: 'High-voltage copper wiring, control boards, and switchgear',
        status: 'active',
        updatedAt: '2026-10-15T14:00:00Z',
    },
    {
        id: 'PRJ-1003',
        projectNumber: '1003',
        name: 'HVAC & Industrial Fluid Piping',
        description: 'Valves, pressure fittings, seamless steel pipes, and thermal jackets',
        status: 'active',
        updatedAt: '2026-10-14T11:30:00Z',
    },
    {
        id: 'PRJ-1004',
        projectNumber: '1004',
        name: 'Automotive Chassis Assemblies',
        description: 'Structural steel stampings, aluminum extrusions, and suspension arms',
        status: 'active',
        updatedAt: '2026-10-13T09:15:00Z',
    },
    {
        id: 'PRJ-1005',
        projectNumber: '1005',
        name: 'Aerospace High-Tensile Fasteners',
        description: 'Titanium alloys, high-tensile locknuts, and precision rivets',
        status: 'active',
        updatedAt: '2026-10-12T16:45:00Z',
    },
    {
        id: 'PRJ-1006',
        projectNumber: '1006',
        name: 'Solar & Wind Energy Mounts',
        description: 'Galvanized framing, turbine mounts, and lightning protection kits',
        status: 'active',
        updatedAt: '2026-10-11T08:20:00Z',
    },
    {
        id: 'PRJ-1007',
        projectNumber: '1007',
        name: 'Hydraulic Systems & Power Units',
        description: 'High-pressure hoses, hydraulic cylinders, directional valves, and pumps',
        status: 'active',
        updatedAt: '2026-10-10T13:10:00Z',
    },
    {
        id: 'PRJ-1008',
        projectNumber: '1008',
        name: 'Consumer Electronics Enclosures',
        description: 'Die-cast aluminum frames, silicone gaskets, and molded housings',
        status: 'active',
        updatedAt: '2026-10-09T15:00:00Z',
    },
    {
        id: 'PRJ-1009',
        projectNumber: '1009',
        name: 'Heavy Machinery Gearboxes',
        description: 'Carburized steel spur gears, tapered bearings, and splined shafts',
        status: 'active',
        updatedAt: '2026-10-08T10:00:00Z',
    },
    {
        id: 'PRJ-1010',
        projectNumber: '1010',
        name: 'Marine Grade Structural Steel',
        description: 'Corrosion-resistant marine plates, zinc anodes, and deck hardware',
        status: 'completed',
        updatedAt: '2026-10-07T12:30:00Z',
    },
    {
        id: 'PRJ-1011',
        projectNumber: '1011',
        name: 'Industrial Automation & Sensors',
        description: 'PLC enclosures, inductive proximity switches, and stepper mounts',
        status: 'active',
        updatedAt: '2026-10-06T09:40:00Z',
    },
    {
        id: 'PRJ-1012',
        projectNumber: '1012',
        name: 'Pneumatic Actuators & Tubing',
        description: 'Double-acting air cylinders, solenoid manifolds, and PU hose lines',
        status: 'active',
        updatedAt: '2026-10-05T14:15:00Z',
    },
    {
        id: 'PRJ-1013',
        projectNumber: '1013',
        name: 'Thermal & Refractory Materials',
        description: 'High-temperature ceramic fiber blankets, firebricks, and gaskets',
        status: 'completed',
        updatedAt: '2026-10-04T17:00:00Z',
    },
    {
        id: 'PRJ-1014',
        projectNumber: '1014',
        name: 'EV Battery Pack Enclosures',
        description: 'Extruded aluminum battery trays, copper busbars, and mica barriers',
        status: 'active',
        updatedAt: '2026-10-03T11:50:00Z',
    },
    {
        id: 'PRJ-1015',
        projectNumber: '1015',
        name: 'Precision Optical Assemblies',
        description: 'Anodized lens holders, optical bench rails, and anti-reflective frames',
        status: 'active',
        updatedAt: '2026-10-02T16:10:00Z',
    },
    {
        id: 'PRJ-1016',
        projectNumber: '1016',
        name: 'Railway Rolling Stock Hardware',
        description: 'Cast steel wheelsets, damper springs, and composite brake pads',
        status: 'active',
        updatedAt: '2026-10-01T10:05:00Z',
    },
    {
        id: 'PRJ-1017',
        projectNumber: '1017',
        name: 'Chemical Plant Valve Systems',
        description: 'PTFE-lined ball valves, Hastelloy flange sets, and diaphragm seals',
        status: 'active',
        updatedAt: '2026-09-30T13:25:00Z',
    },
    {
        id: 'PRJ-1018',
        projectNumber: '1018',
        name: 'Architectural Glazing Hardware',
        description: 'Stainless cable stays, spider fittings, and expansion anchor bolts',
        status: 'completed',
        updatedAt: '2026-09-29T15:40:00Z',
    },
    {
        id: 'PRJ-1019',
        projectNumber: '1019',
        name: 'Conveyor & Material Handling',
        description: 'Polyurethane rollers, rubber belting, drive sprockets, and tensioners',
        status: 'active',
        updatedAt: '2026-09-28T09:00:00Z',
    },
    {
        id: 'PRJ-1020',
        projectNumber: '1020',
        name: 'Welding & Fabrication Supplies',
        description: 'TIG welding rods, flux-cored wires, gas nozzles, and alignment clamps',
        status: 'active',
        updatedAt: '2026-09-27T14:30:00Z',
    },
];

const baseMaterials: Material[] = [
    {
        id: 'MAT-1001',
        projectId: 'PRJ-1001',
        materialNumber: '1000001',
        name: 'Hex Bolt M12',
        description: 'Hexagonal steel bolt, M12 x 60 mm',
        category: 'Fasteners',
        materialType: 'Steel',
        unit: 'PCS',
        status: 'confirmed',
        updatedAt: '2026-10-14T09:30:00Z',
    },
    {
        id: 'MAT-1002',
        projectId: 'PRJ-1001',
        materialNumber: '1000002',
        name: 'Steel Plate 5mm',
        description: 'Mild steel plate, 5 mm thickness',
        category: 'Raw Materials',
        materialType: 'Steel',
        unit: 'KG',
        status: 'draft',
        updatedAt: '2026-10-15T11:15:00Z',
    },
    {
        id: 'MAT-1003',
        projectId: 'PRJ-1002',
        materialNumber: '1000003',
        name: 'Copper Cable 2.5mm',
        description: 'Insulated copper electrical cable',
        category: 'Electrical',
        materialType: 'Copper',
        unit: 'M',
        status: 'unclassified',
        updatedAt: '2026-10-15T14:00:00Z',
    },
    {
        id: 'MAT-1004',
        projectId: 'PRJ-1001',
        materialNumber: '1000004',
        name: 'Ball Bearing 6204',
        description: 'Deep groove ball bearing',
        category: 'Mechanical Components',
        materialType: 'Steel',
        unit: 'PCS',
        status: 'unclassified',
        updatedAt: '2026-10-16T08:45:00Z',
    },
    {
        id: 'MAT-1005',
        projectId: 'PRJ-1002',
        materialNumber: '1000005',
        name: 'Aluminium Sheet',
        description: 'Aluminium sheet, 2 mm thickness',
        category: 'Raw Materials',
        materialType: 'Aluminium',
        unit: 'KG',
        status: 'unclassified',
        updatedAt: '2026-10-16T10:20:00Z',
    },
];

function generateLargeDataset(count: number): Material[] {
    const templates = [
        { name: 'DIN 933 Hex Bolt M12x', desc: 'Hexagonal head fully threaded bolt Grade 8.8', category: 'Fasteners', type: 'Steel', unit: 'PCS' },
        { name: 'ISO 4017 Stainless Bolt M', desc: 'Stainless steel A2-70 metric hex bolt', category: 'Fasteners', type: 'Stainless Steel', unit: 'PCS' },
        { name: 'Structural Steel Plate ', desc: 'Hot rolled carbon steel sheet, thickness ', category: 'Raw Materials', type: 'Steel', unit: 'KG' },
        { name: '6061-T6 Aluminum Profile ', desc: 'Anodized architectural aluminum channel ', category: 'Raw Materials', type: 'Aluminium', unit: 'M' },
        { name: 'Multi-Core Shielded Cable ', desc: 'Flexible copper conductor control cable ', category: 'Electrical', type: 'Copper', unit: 'M' },
        { name: 'Industrial Contactor 24V ', desc: '3-Pole AC motor contactor with auxiliary contact', category: 'Electrical', type: 'Plastic', unit: 'PCS' },
        { name: 'Deep Groove Ball Bearing ', desc: 'Precision single row radial ball bearing series ', category: 'Mechanical Components', type: 'Steel', unit: 'PCS' },
        { name: 'Carburized Spur Gear M', desc: 'Hardened alloy steel spur gear module ', category: 'Mechanical Components', type: 'Steel', unit: 'PCS' },
        { name: 'ANSI Flange Valve 2" Class ', desc: 'Cast steel gate valve with flanged connections', category: 'Piping & Valves', type: 'Steel', unit: 'PCS' },
        { name: 'PTFE O-Ring Seal ', desc: 'High temperature chemical resistant gasket seal', category: 'Seals & Rubber', type: 'Polymer', unit: 'PCS' },
        { name: 'High-Pressure Hydraulic Hose ', desc: 'Double wire braid reinforced hydraulic line ', category: 'Hydraulics', type: 'Polymer', unit: 'M' },
        { name: 'Chromed Hydraulic Cylinder Rod ', desc: 'Hard chrome plated steel piston rod diameter ', category: 'Hydraulics', type: 'Steel', unit: 'PCS' },
        { name: 'Pneumatic Solenoid Valve 5/2 ', desc: 'Directional air valve with manual override', category: 'Pneumatics', type: 'Aluminium', unit: 'PCS' },
        { name: 'Aerospace Titanium Nut M', desc: 'Grade 5 titanium alloy self-locking nut', category: 'Fasteners', type: 'Titanium', unit: 'PCS' },
        { name: 'Heavy Duty Busbar Strip ', desc: 'High conductivity electrolytic copper flat bar ', category: 'Electrical', type: 'Copper', unit: 'KG' },
    ];

    const statuses: Material['status'][] = ['confirmed', 'draft', 'unclassified'];
    const generated: Material[] = [];

    for (let i = 6; i <= count; i++) {
        const template = templates[i % templates.length];
        const projectIndex = (i - 1) % projects.length;
        const assignedProjectId = projects[projectIndex].id;
        const dimension = (i % 50) + 5;

        generated.push({
            id: `MAT-${1000 + i}`,
            projectId: assignedProjectId,
            materialNumber: String(1000000 + i),
            name: `${template.name}${dimension}`,
            description: `${template.desc} spec size ${dimension}mm`,
            category: template.category,
            materialType: template.type,
            unit: template.unit,
            status: statuses[i % statuses.length],
            updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
        });
    }

    return generated;
}

const initialMaterials: Material[] = [
    ...baseMaterials,
    ...generateLargeDataset(1000),
];

const materials: Material[] = readStoredData(
    STORAGE_KEYS.materials,
    initialMaterials,
);

const materialDrafts = new Map<string, Material>(
    readStoredData<[string, Material][]>(
        STORAGE_KEYS.drafts,
        [],
    ),
);

const classificationHistory: ClassificationHistoryEntry[] =
    readStoredData<ClassificationHistoryEntry[]>(
        STORAGE_KEYS.history,
        [],
    );

const delay = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

function persistDrafts(): void {
    persistData(
        STORAGE_KEYS.drafts,
        Array.from(materialDrafts.entries()),
    );
}

function getMaterialChanges(
    previous: Material,
    next: Material,
): ClassificationFieldChange[] {
    const fields: ClassificationFieldChange['field'][] = [
        'name',
        'description',
        'category',
        'materialType',
        'status',
    ];

    return fields
        .filter((field) => previous[field] !== next[field])
        .map((field) => ({
            field,
            from: String(previous[field] ?? ''),
            to: String(next[field] ?? ''),
        }));
}

export async function getProjects(): Promise<Project[]> {
    await delay(500);
    return projects.map((project) => ({ ...project }));
}

export async function getProjectById(
    id: string,
): Promise<Project | undefined> {
    await delay(300);

    const project = projects.find((item) => item.id === id);
    return project ? { ...project } : undefined;
}

export async function getMaterials(
    filters: MaterialFilters = {},
): Promise<Material[]> {
    await delay(500);

    const search = filters.search?.trim().toLowerCase();

    return materials
        .filter((material) => {
            const matchesSearch =
                !search ||
                [
                    material.materialNumber,
                    material.name,
                    material.description,
                    material.category,
                ].some((value) => value.toLowerCase().includes(search));

            const matchesStatus =
                !filters.status ||
                filters.status === 'all' ||
                material.status === filters.status;

            const matchesCategory =
                !filters.category ||
                filters.category === 'all' ||
                material.category === filters.category;

            return matchesSearch && matchesStatus && matchesCategory;
        })
        .map((material) => ({ ...material }));
}

export async function getMaterialsByProjectId(
    projectId: string,
): Promise<Material[]> {
    await delay(300);

    return materials
        .filter((material) => material.projectId === projectId)
        .map((material) => ({ ...material }));
}

export async function getMaterialById(
    id: string,
): Promise<Material | undefined> {
    await delay(300);

    const material = materials.find((item) => item.id === id);
    return material ? { ...material } : undefined;
}

export async function updateMaterial(
    id: string,
    changes: Partial<Material>,
): Promise<Material> {
    await delay(300);

    const index = materials.findIndex((material) => material.id === id);

    if (index === -1) {
        throw new Error(`Material not found: ${id}`);
    }

    const previousMaterial = { ...materials[index] };

    const updatedMaterial: Material = {
        ...previousMaterial,
        ...changes,
        id: previousMaterial.id,
        updatedAt: new Date().toISOString(),
    };

    const fieldChanges = getMaterialChanges(
        previousMaterial,
        updatedMaterial,
    );

    materials[index] = updatedMaterial;
    persistData(STORAGE_KEYS.materials, materials);

    addClassificationHistory({
        materialId: id,
        action:
            updatedMaterial.status === 'confirmed'
                ? 'confirmed'
                : 'updated',
        details:
            updatedMaterial.status === 'confirmed'
                ? 'Classification confirmed'
                : 'Material updated',
        changes: fieldChanges,
    });

    return { ...updatedMaterial };
}

export async function getMaterialDrafts(
    projectId?: string,
): Promise<Material[]> {
    await delay(200);

    const drafts = Array.from(materialDrafts.values());

    return drafts
        .filter((draft) => !projectId || draft.projectId === projectId)
        .map((draft) => ({ ...draft }));
}

export async function saveMaterialDraft(
    material: Material,
): Promise<Material> {
    await delay(200);

    const previousDraft = materialDrafts.get(material.id);

    const originalMaterial = materials.find(
        (item) => item.id === material.id,
    );

    const previousMaterial =
        previousDraft ?? originalMaterial ?? material;

    const draft: Material = {
        ...material,
        status: 'draft',
        updatedAt: new Date().toISOString(),
    };

    const fieldChanges = getMaterialChanges(
        previousMaterial,
        draft,
    );

    materialDrafts.set(material.id, draft);
    persistDrafts();

    addClassificationHistory({
        materialId: material.id,
        action: previousDraft ? 'updated' : 'created',
        details: previousDraft ? 'Draft updated' : 'Draft created',
        changes: fieldChanges,
    });

    return { ...draft };
}

export async function deleteMaterialDraft(
    materialId: string,
    recordDiscard = true,
): Promise<void> {
    await delay(200);

    const draft = materialDrafts.get(materialId);

    if (draft && recordDiscard) {
        addClassificationHistory({
            materialId,
            action: 'discarded',
            details: 'Draft discarded',
        });
    }

    materialDrafts.delete(materialId);
    persistDrafts();
}

export async function getClassificationHistory(): Promise<
    ClassificationHistoryEntry[]
> {
    await delay(200);

    return [...classificationHistory].reverse();
}

export function addClassificationHistory(
    entry: Omit<ClassificationHistoryEntry, 'id' | 'timestamp' | 'user'>,
): void {
    classificationHistory.push({
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        user: 'Current User',
    });

    persistData(STORAGE_KEYS.history, classificationHistory);
}