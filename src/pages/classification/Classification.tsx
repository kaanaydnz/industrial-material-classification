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
  showToast
} from '@siemens/ix-react';
import type { Project } from '../../types/material';
import {
  getProjects,
  getMaterialsByProjectId,
  saveMaterialDraft,
  getMaterialDrafts,
} from '../../services/mockApi';
import { useTranslation } from 'react-i18next';
import styles from './Classification.module.css';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import type { Material } from '../../types/material';
import { getIxTheme } from '@siemens/ix-aggrid';
import * as agGrid from 'ag-grid-community';
import ExcelJS from 'exceljs';

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
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [draftMaterials, setDraftMaterials] = useState<Record<string, Material>>({});
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
      setDraftMaterials({});
      return;
    }

    async function loadMaterials() {
      setIsLoadingMaterials(true);
      setMaterialsError(null);

      try {
        const [result, drafts] = await Promise.all([
          getMaterialsByProjectId(selectedId),
          getMaterialDrafts(selectedId),
        ]);

        const draftsByNumber: Record<string, Material> = {};

        drafts.forEach((draft) => {
          draftsByNumber[draft.materialNumber] = draft;
        });

        setDraftMaterials(draftsByNumber);

        setMaterials(
          result.map((material) => {
            const draft = draftsByNumber[material.materialNumber];
            return draft ?? material;
          }),
        );
      } catch {
        setMaterialsError(t('classification.projects.error'));
      } finally {
        setIsLoadingMaterials(false);
      }
    }

    loadMaterials();
  }, [selectedId]);


  async function handleSaveDraft() {
    if (!editingMaterial) return;

    try {
      const savedDraft = await saveMaterialDraft(editingMaterial);

      setDraftMaterials((current) => ({
        ...current,
        [savedDraft.materialNumber]: savedDraft,
      }));

      setMaterials((current) =>
        current.map((material) =>
          material.id === savedDraft.id
            ? savedDraft
            : material,
        ),
      );

      setSelectedMaterial(savedDraft);
      setEditingMaterial(savedDraft);

      showToast({
        message: t('classification.editMaterial.draftSaved'),
        type: 'success',
      });
    } catch {
      showToast({
        message: t('classification.projects.error'),
        type: 'error',
      });
    }
  }

  function handleCancel() {
    if (!selectedMaterial) return;

    setEditingMaterial(
      draftMaterials[selectedMaterial.materialNumber] ?? selectedMaterial,
    );

    showToast({
      message: t('classification.editMaterial.changesDiscarded'),
      type: 'info',
    });
  }

  async function handleExportExcel() {
    if (materials.length === 0) return;

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Materials');

      worksheet.columns = [
        { header: t('classification.materials.number'), key: 'materialNumber', width: 20 },
        { header: t('classification.materials.name'), key: 'name', width: 28 },
        { header: t('classification.materials.description'), key: 'description', width: 40 },
        { header: t('classification.materials.category'), key: 'category', width: 22 },
        { header: t('classification.materials.type'), key: 'materialType', width: 22 },
        { header: t('classification.materials.status'), key: 'status', width: 18 },
        { header: t('classification.materials.updatedAt'), key: 'updatedAt', width: 24 },
      ];

      materials.forEach((material) => {
        worksheet.addRow({
          materialNumber: material.materialNumber,
          name: material.name,
          description: material.description,
          category: material.category,
          materialType: material.materialType,
          status: material.status
            ? t(`projects.statusValues.${material.status}`)
            : '',
          updatedAt: material.updatedAt
            ? new Intl.DateTimeFormat(
              i18n.language.startsWith('tr') ? 'tr-TR' : 'en-GB',
              { dateStyle: 'medium', timeStyle: 'short' },
            ).format(new Date(material.updatedAt))
            : '',
        });
      });

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF008A95' },
      };
      headerRow.alignment = { vertical: 'middle' };

      worksheet.views = [{ state: 'frozen', ySplit: 1 }];
      worksheet.autoFilter = {
        from: 'A1',
        to: `G${materials.length + 1}`,
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([new Uint8Array(buffer)], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const project = projects.find((item) => item.id === selectedId);
      const filename = (project?.projectNumber ?? 'materials')
        .replace(/[^a-zA-Z0-9_-]/g, '_');

      link.href = url;
      link.download = `${filename}-materials.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      showToast({
        message: t('classification.exportExcelSuccess'),
        type: 'success',
      });
    } catch (error) {
      console.error('Excel export failed:', error);

      showToast({
        message: t('classification.exportExcelError'),
        type: 'error',
      });
    }
  }

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
              className={styles.classificationSearch}
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
            <div className={styles.materialsToolbar}>
              <IxButton onClick={handleExportExcel}>
                {t('classification.exportExcel')}
              </IxButton>
            </div>
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
          <IxLayoutGrid noMargin>
            <IxRow>
              <IxCol size="12" sizeLg="9">



                <div className={styles.materialsGrid}>
                  <AgGridReact<Material>
                    rowData={materials}
                    columnDefs={columnDefs}
                    theme={ixTheme}
                    onRowClicked={(event) => {
                      const material = event.data;
                      if (!material) return;

                      const draft = draftMaterials[material.materialNumber];
                      const currentMaterial = draft ?? material;

                      setSelectedMaterial(currentMaterial);
                      setEditingMaterial(currentMaterial);
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
                          value={editingMaterial?.name ?? ''}
                          aria-label={t('classification.editMaterial.name')}
                          onValueChange={(event) => {
                            setEditingMaterial((current) =>
                              current
                                ? { ...current, name: event.detail }
                                : current,
                            );
                          }}
                        />
                      </div>

                      <div className={styles.formField}>
                        <label>{t('classification.editMaterial.category')}</label>
                        <IxInput
                          value={editingMaterial?.category ?? ''}
                          aria-label={t('classification.editMaterial.category')}
                          onValueChange={(event) => {
                            setEditingMaterial((current) =>
                              current
                                ? { ...current, category: event.detail }
                                : current,
                            );
                          }}
                        />
                      </div>

                      <div className={styles.formField}>
                        <label>{t('classification.editMaterial.type')}</label>
                        <IxInput
                          value={editingMaterial?.materialType ?? ''}
                          aria-label={t('classification.editMaterial.type')}
                          onValueChange={(event) => {
                            setEditingMaterial((current) =>
                              current
                                ? { ...current, materialType: event.detail }
                                : current,
                            );
                          }}
                        />
                      </div>

                      <div className={styles.formField}>
                        <label>{t('classification.editMaterial.description')}</label>
                        <IxTextarea
                          value={editingMaterial?.description ?? ''}
                          aria-label={t('classification.editMaterial.description')}
                          onValueChange={(event) => {
                            setEditingMaterial((current) =>
                              current
                                ? { ...current, description: event.detail }
                                : current,
                            );
                          }}
                        />
                      </div>

                      <div className={styles.editorActions}>
                        <IxButton
                          variant="secondary"
                          onClick={handleCancel}
                        >
                          {t('classification.editMaterial.cancel')}
                        </IxButton>

                        <IxButton onClick={handleSaveDraft}>
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
