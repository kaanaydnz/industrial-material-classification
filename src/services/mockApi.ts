import type {
    Material,
    MaterialFilters,
    Project,
} from '../types/material';

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

const materials: Material[] = [
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

const delay = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function getProjects(): Promise<Project[]> {
    await delay(500);
    return projects;
}

export async function getProjectById(
    id: string,
): Promise<Project | undefined> {
    await delay(300);
    return projects.find((project) => project.id === id);
}

export async function getMaterials(
    filters: MaterialFilters = {},
): Promise<Material[]> {
    await delay(500);

    const search = filters.search?.trim().toLowerCase();

    return materials.filter((material) => {
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
    });
}

export async function getMaterialsByProjectId(
    projectId: string,
): Promise<Material[]> {
    await delay(300);

    return materials.filter(
        (material) => material.projectId === projectId,
    );
}

export async function getMaterialById(
    id: string,
): Promise<Material | undefined> {
    await delay(300);
    return materials.find((material) => material.id === id);
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

    materials[index] = {
        ...materials[index],
        ...changes,
        id: materials[index].id,
        updatedAt: new Date().toISOString(),
    };

    return { ...materials[index] };
}