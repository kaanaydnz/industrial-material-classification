
export type ClassificationStatus =
    | 'unclassified'
    | 'draft'
    | 'in-review'
    | 'confirmed';

export interface Project {
    id: string;
    projectNumber: string;
    name: string;
    description: string;
    status: 'active' | 'completed';
    updatedAt: string;
}

export interface Material {
    id: string;
    projectId: string;
    materialNumber: string;
    name: string;
    description: string;
    category: string;
    materialType: string;
    unit: string;
    status: ClassificationStatus;
    updatedAt: string;
}

export interface MaterialFilters {
    search?: string;
    status?: ClassificationStatus | 'all';
    category?: string | 'all';
}

export interface MaterialClassification {
    materialId: string;
    category: string;
    materialType: string;
    description: string;
}

export interface ClassificationHistoryEntry {
    id: string;
    materialId: string;
    action: 'created' | 'updated' | 'submitted' | 'confirmed';
    timestamp: string;
    user: string;
    details: string;
}
