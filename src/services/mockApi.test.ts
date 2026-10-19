
import { describe, it, expect } from 'vitest';
import {
    getMaterials,
    getMaterialById,
    getProjects,
    getProjectById,
} from './mockApi';

describe('mockApi', () => {
    it('returns materials', async () => {
        const materials = await getMaterials();

        expect(materials.length).toBeGreaterThan(0);
    });

    it('finds a material by ID', async () => {
        const material = await getMaterialById('MAT-1001');

        expect(material?.name).toBe('Hex Bolt M12');
    });

    it('returns undefined for an unknown material ID', async () => {
        const material = await getMaterialById('UNKNOWN');

        expect(material).toBeUndefined();
    });

    it('returns projects', async () => {
        const projects = await getProjects();

        expect(projects.length).toBeGreaterThan(0);
    });

    it('finds a project by ID', async () => {
        const project = await getProjectById('PRJ-1001');

        expect(project?.name).toBe('Mechanical Components');
    });

    it('returns undefined for an unknown project ID', async () => {
        const project = await getProjectById('UNKNOWN');

        expect(project).toBeUndefined();
    });
});