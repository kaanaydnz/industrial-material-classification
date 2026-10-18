/*
 * Copyright (c) Siemens 2018 - 2026
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import {
  IxContentHeader,
  IxSelect,
  IxSelectItem,
  IxMessageBar,
  IxButton,
  IxLayoutGrid,
  IxCol,
  IxRow,
  IxInput,
  IxTextarea,
} from '@siemens/ix-react';
import type { Project } from '../../types/material';
import { getProjects, getMaterialsByProjectId } from '../../services/mockApi';
import { useTranslation } from 'react-i18next';
import styles from './Classification.module.css';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import type { Material } from '../../types/material';
import { getIxTheme } from '@siemens/ix-aggrid';
import * as agGrid from 'ag-grid-community';

const ixTheme = getIxTheme(agGrid, {
  stripedRows: true,
});

function Classification() {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const columnDefs: ColDef<Material>[] = [
    {
      field: 'materialNumber',
      headerName: t('classification.materials.number'),
      flex: 1,
    },
    {
      field: 'name',
      headerName: t('classification.materials.name'),
      flex: 1,
    },
    {
      field: 'description',
      headerName: t('classification.materials.description'),
      flex: 2,
    },
    {
      field: 'category',
      headerName: t('classification.materials.category'),
      flex: 1,
    },
    {
      field: 'materialType',
      headerName: t('classification.materials.type'),
      flex: 1,
    },
    {
      field: 'status',
      headerName: t('classification.materials.status'),
      flex: 1,
      valueFormatter: (params) =>
        params.value
          ? t(`projects.statusValues.${params.value}`)
          : '',
    },
    {
      field: 'updatedAt',
      headerName: t('classification.materials.updatedAt'),
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
      setProjects(result);
      setSelectedId(result[0]?.id ?? '');
    } catch {
      setError(t('classification.projects.error'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMaterials([]);
      return;
    }

    async function loadMaterials() {
      setIsLoadingMaterials(true);
      setMaterialsError(null);

      try {
        const result = await getMaterialsByProjectId(selectedId);
        setMaterials(result);
      } catch {
        setMaterialsError(t('classification.projects.error'));
      } finally {
        setIsLoadingMaterials(false);
      }
    }

    loadMaterials();
  }, [selectedId]);

  return (
    <div className={styles.classificationPage}>
      <div className={styles.pageHeader}>
        <IxContentHeader headerTitle={t('classification.title')} />
      </div>

      <div className={styles.classificationContent}>

        {isLoading ? (
          <p>{t('classification.projects.loading')}</p>
        ) : error ? (
          <IxMessageBar persistent type="warning">
            <div className="message-bar-warning">
              {error}
              <IxButton
                className={styles.retryButton}
                onClick={() => loadProjects()}
              >{t('classification.projects.retry')}</IxButton>
            </div>
          </IxMessageBar>
        ) : projects.length === 0 ? (
          <p>{t('classification.projects.empty')}</p>
        ) : (
          <div className={styles.selectorField}>
            <label htmlFor="project-select">
              {t('classification.projects.select')}
            </label>

            <IxSelect
              id="project-select"
              value={selectedId}
              onValueChange={(event) => {
                const value = event.detail;
                setSelectedId(Array.isArray(value) ? value[0] ?? '' : value);
              }}
            >
              {projects.map((project) => (
                <IxSelectItem
                  key={project.id}
                  value={project.id}
                  label={`${project.projectNumber} — ${project.name}`}
                />
              ))}
            </IxSelect>
          </div>
        )}
        {!selectedId ? null : isLoadingMaterials ? (
          <p>{t('classification.projects.loading')}</p>
        ) : materialsError ? (
          <IxMessageBar persistent type="warning">
            <div className="message-bar-warning">
              {materialsError}
            </div>
          </IxMessageBar>
        ) : materials.length === 0 ? (
          <p>{t('classification.projects.empty')}</p>
        ) : (
          <IxLayoutGrid noMargin style={{ "width": '100%' }}>
            <IxRow>
              <IxCol size="12" sizeLg="9">
                <div className={styles.materialsGrid}>
                  <AgGridReact<Material>
                    rowData={materials}
                    columnDefs={columnDefs}
                    theme={ixTheme}
                    onRowClicked={(event) => {
                      setSelectedMaterial(event.data ?? null);
                    }}
                  />
                </div>
              </IxCol>
              <IxCol size="12" sizeLg="3">
                <section className={styles.editor}>
                  <h3>{t('classification.editMaterial.title')}</h3>

                  {selectedMaterial ? (
                    <>
                      <div className={styles.formField}>
                        <label>{t('classification.editMaterial.materialNumber')}</label>
                        <IxInput
                          value={selectedMaterial.materialNumber}
                          disabled
                        />
                      </div>

                      <div className={styles.formField}>
                        <label>{t('classification.editMaterial.name')}</label>
                        <IxInput
                          value={selectedMaterial.name}
                          aria-label={t('classification.editMaterial.name')}
                        />
                      </div>

                      <div className={styles.formField}>
                        <label>{t('classification.editMaterial.category')}</label>
                        <IxInput
                          value={selectedMaterial.category}
                          aria-label={t('classification.editMaterial.category')}
                        />
                      </div>

                      <div className={styles.formField}>
                        <label>{t('classification.editMaterial.type')}</label>
                        <IxInput
                          value={selectedMaterial.materialType}
                          aria-label={t('classification.editMaterial.type')}
                        />
                      </div>

                      <div className={styles.formField}>
                        <label>{t('classification.editMaterial.description')}</label>
                        <IxTextarea
                          value={selectedMaterial.description}
                          aria-label={t('classification.editMaterial.description')}
                        />
                      </div>

                      <div className={styles.editorActions}>
                        <IxButton variant="secondary">
                          {t('classification.editMaterial.cancel')}
                        </IxButton>

                        <IxButton>
                          {t('classification.editMaterial.saveDraft')}
                        </IxButton>
                      </div>
                    </>
                  ) : (
                    <p>{t('classification.editMaterial.selectPrompt')}</p>
                  )}
                </section>
              </IxCol>
            </IxRow>
          </IxLayoutGrid>
        )}
      </div>
    </div >
  );
}

export default Classification;
