
import type {
    Material,
    MaterialFilters,
    Project,
    ClassificationHistoryEntry,
    ClassificationFieldChange,
} from '../types/material';

const STORAGE_KEYS = {
    materials: 'industrial-classification-materials',
    drafts: 'industrial-classification-drafts',
    history: 'industrial-classification-history',
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
        name: 'Mechanical Components',
        description: 'Classification of mechanical parts and raw materials',
        status: 'active',
        updatedAt: '2026-10-16T10:20:00Z',
    },
    {
        id: 'PRJ-1002',
        projectNumber: '1002',
        name: 'Electrical Components',
        description: 'Classification of electrical materials and components',
        status: 'active',
        updatedAt: '2026-10-15T14:00:00Z',
    },
];

const initialMaterials: Material[] = [
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
        status: 'in-review',
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
