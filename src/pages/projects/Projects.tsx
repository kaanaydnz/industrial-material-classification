/*
 * Copyright (c) Siemens 2018 - 2026
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import { IxContentHeader, IxMessageBar, IxButton, IxInput, IxIcon } from '@siemens/ix-react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { getMaterials } from '../../services/mockApi';
import type { Material } from '../../types/material';
import { iconSearch } from '@siemens/ix-icons/icons';
import { getIxTheme } from '@siemens/ix-aggrid';
import { useTranslation } from 'react-i18next';
import * as agGrid from 'ag-grid-community';
import styles from './Projects.module.css';

const ixTheme = getIxTheme(agGrid, {
  stripedRows: true,
});

function Projects() {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const columnDefs: ColDef<Material>[] = [
    { field: 'materialNumber', headerName: t('projects.materialNumber') },
    { field: 'name', headerName: t('projects.name') },
    { field: 'category', headerName: t('projects.category') },
    { field: 'materialType', headerName: t('projects.materialType') },
    { field: 'status', headerName: t('projects.status') },
    { field: 'updatedAt', headerName: t('projects.updatedAt') },
  ];

  async function loadMaterials() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getMaterials({ search });
      setMaterials(result);
      setHasLoaded(true);
    } catch {
      setError(t('projects.error'));
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {

    loadMaterials();
  }, [search]);

  return (
    <>
      <IxContentHeader headerTitle={t('projects.title')} />

      <div className={styles.materialList}>

        <div className={styles.searchContainer}>
          <IxIcon name={iconSearch} size="20" />
          <IxInput
            placeholder={t('projects.searchPlaceholder')}
            value={search}
            onValueChange={(event) => setSearch(event.detail)}
          />
        </div>

        <div className={styles.searchingContainer}>
          {isLoading && hasLoaded && (
            <p className={styles.searching}>{t('projects.searching')}</p>
          )}
        </div>

        {isLoading && !hasLoaded ? (
          <p>{t('projects.loading')}</p>
        ) : error ? (
          <IxMessageBar persistent type="warning">
            <div className="message-bar-warning">
              {error}
              <IxButton onClick={() => loadMaterials()}
              >{t('projects.retry')}</IxButton>
            </div>
          </IxMessageBar>
        ) : materials.length === 0 && !isLoading ? (
          <p>{t('projects.empty')}</p>
        ) : (
          <div className={styles.materialGrid}>
            <AgGridReact<Material>
              rowData={materials}
              columnDefs={columnDefs}
              theme={ixTheme}
            />
          </div>
        )}
      </div>

    </>
  );
}

export default Projects;
