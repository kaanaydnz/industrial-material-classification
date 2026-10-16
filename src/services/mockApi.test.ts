import { describe, it, expect } from 'vitest';
import { getMaterials, getMaterialById } from './mockApi';

describe('mockApi', () => {
    it('returns materials', async () => {
        const materials = await getMaterials();

        expect(materials.length).toBeGreaterThan(0);
    });

    it('finds a material by ID', async () => {
        const material = await getMaterialById('MAT-1001');

        expect(material?.name).toBe('Hex Bolt M12');
    });

    it('returns undefined for an unknown ID', async () => {
        const material = await getMaterialById('UNKNOWN');

        expect(material).toBeUndefined();
    });
});