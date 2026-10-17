/*
 * Copyright (c) Siemens 2018 - 2026
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import {
  IxContentHeader,
  IxMessageBar,
  IxButton,
  IxInput,
  IxIcon,
} from '@siemens/ix-react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import {
  getProjects,
  getMaterialsByProjectId,
} from '../../services/mockApi';
import type { Material, Project } from '../../types/material';
import { iconSearch } from '@siemens/ix-icons/icons';
import { getIxTheme } from '@siemens/ix-aggrid';
import { useTranslation } from 'react-i18next';
import * as agGrid from 'ag-grid-community';
import styles from './Projects.module.css';

const ixTheme = getIxTheme(agGrid, {
  stripedRows: true,
});


function Projects() {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const columnDefs: ColDef<Project>[] = [
    {
      field: 'projectNumber',
      headerName: t('projects.columns.projectNumber'),
      flex: 1,
    },
    {
      field: 'name',
      headerName: t('projects.columns.projectName'),
      flex: 1,
    },
    {
      field: 'description',
      headerName: t('projects.columns.description'),
      flex: 2,
      minWidth: 300,
    },
    {
      field: 'status',
      headerName: t('projects.columns.status'),
      flex: 1,
      valueFormatter: (params) =>
        params.value
          ? t(`projects.statuses.${String(params.value).toLowerCase()}`)
          : '',
    },
    {
      field: 'updatedAt',
      headerName: t('projects.columns.lastUpdated'),
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return '';

        return new Intl.DateTimeFormat(
          i18n.language.startsWith('tr') ? 'tr-TR' : 'en-GB',
          { dateStyle: 'medium', timeStyle: 'short' },
        ).format(new Date(params.value));
      },
    },
  ];

  async function loadProjects() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getProjects();
      const query = search.trim().toLowerCase();

      const filteredProjects = result.filter((project) =>
        [
          project.projectNumber,
          project.name,
          project.description,
        ].some((value) => value.toLowerCase().includes(query)),
      );

      setProjects(filteredProjects);
      setHasLoaded(true);
    } catch {
      setError(t('projects.error'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [search]);

  return (
    <>
      <IxContentHeader headerTitle={t('projects.title')} />

      <div className={styles.pageContent}>

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
              <IxButton
                className={styles.retryButton}
                onClick={() => loadProjects()}
              >
                {t('projects.retry')}
              </IxButton>
            </div>
          </IxMessageBar>
        ) : projects.length === 0 && !isLoading ? (
          <p>{t('projects.empty')}</p>
        ) : (
          <div className={styles.projectsGrid}>
            <AgGridReact<Project>
              rowData={projects}
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
