
import type {
    Material,
    MaterialFilters,
} from '../types/material';

const materials: Material[] = [
    {
        id: 'MAT-1001',
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
