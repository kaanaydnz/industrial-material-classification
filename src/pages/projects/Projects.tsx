
import { useEffect, useRef, useState } from 'react';
import {
  IxContentHeader,
  IxMessageBar,
  IxButton,
  IxInput,
  IxIcon,
} from '@siemens/ix-react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
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

type ProjectGridRow =
  | { kind: 'project'; project: Project }
  | {
    kind: 'detail';
    projectId: string;
    materials: Material[];
    loading: boolean;
    error: boolean;
  };

function MaterialsDetailRenderer(
  props: ICellRendererParams<ProjectGridRow>,
) {
  const { t } = useTranslation();
  const row = props.data;

  if (!row || row.kind !== 'detail') return null;

  if (row.loading) {
    return <div style={{ padding: '1rem' }}>{t('projects.loading')}</div>;
  }

  if (row.error) {
    return <div style={{ padding: '1rem' }}>{t('projects.error')}</div>;
  }

  if (row.materials.length === 0) {
    return (
      <div style={{ padding: '1rem' }}>
        {t('classification.projects.empty')}
      </div>
    );
  }

  return (
    <div className={styles.materialsDetails}>
      <div className={styles.materialsHeader}>
        <span>{t('classification.materials.number')}</span>
        <span>{t('classification.materials.name')}</span>
        <span>{t('classification.materials.description')}</span>
        <span>{t('classification.materials.category')}</span>
        <span>{t('classification.materials.status')}</span>
      </div>

      {row.materials.map((material) => (
        <div className={styles.materialRow} key={material.id}>
          <span>
            <strong className={styles.mobileLabel}>
              {t('classification.materials.number')}
            </strong>
            {material.materialNumber}
          </span>
          <span>
            <strong className={styles.mobileLabel}>
              {t('classification.materials.name')}
            </strong>
            {material.name}
          </span>
          <span>
            <strong className={styles.mobileLabel}>
              {t('classification.materials.description')}
            </strong>
            {material.description}
          </span>
          <span>
            <strong className={styles.mobileLabel}>
              {t('classification.materials.category')}
            </strong>
            {material.category}
          </span>
          <span>
            <strong className={styles.mobileLabel}>
              {t('classification.materials.status')}
            </strong>
            {material.status
              ? t(`projects.statusValues.${material.status}`)
              : ''}
          </span>
        </div>
      ))}
    </div>
  );

}

function Projects() {
  const { t, i18n } = useTranslation();
  const gridRef = useRef<AgGridReact<ProjectGridRow>>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [latestUpdatedAtByProject, setLatestUpdatedAtByProject] = useState<
    Record<string, string>
  >({});
  const [materialsByProject, setMaterialsByProject] = useState<
    Record<string, Material[]>
  >({});
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const [materialErrors, setMaterialErrors] = useState<Record<string, boolean>>({});

  const columnDefs: ColDef<ProjectGridRow>[] = [
    {
      headerName: '',
      width: 55,
      valueGetter: (params) =>
        params.data?.kind === 'project'
          ? expandedProjectId === params.data.project.id
            ? '▾'
            : '▸'
          : '',
    },
    {
      headerName: t('projects.columns.projectNumber'),
      flex: 1,
      valueGetter: (params) =>
        params.data?.kind === 'project'
          ? params.data.project.projectNumber
          : '',
    },
    {
      headerName: t('projects.columns.projectName'),
      flex: 1,
      valueGetter: (params) =>
        params.data?.kind === 'project' ? params.data.project.name : '',
    },
    {
      headerName: t('projects.columns.description'),
      flex: 2,
      minWidth: 300,
      valueGetter: (params) =>
        params.data?.kind === 'project'
          ? params.data.project.description
          : '',
    },
    {
      headerName: t('projects.columns.status'),
      flex: 1,
      valueGetter: (params) =>
        params.data?.kind === 'project'
          ? params.data.project.status
          : '',
      valueFormatter: (params) =>
        params.value
          ? t(`projects.statuses.${String(params.value).toLowerCase()}`)
          : '',
    },
    {
      headerName: t('projects.columns.lastUpdated'),
      flex: 1,
      valueGetter: (params) =>
        params.data?.kind === 'project'
          ? latestUpdatedAtByProject[params.data.project.id] ?? ''
          : '',
      valueFormatter: (params) => {
        if (!params.value) return '';

        const date = new Date(params.value);
        if (Number.isNaN(date.getTime())) return '';

        return new Intl.DateTimeFormat(
          i18n.language.startsWith('tr') ? 'tr-TR' : 'en-GB',
          { dateStyle: 'medium', timeStyle: 'short' },
        ).format(date);
      },
    },
  ];

  async function loadProjects() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getProjects();
      const materialDates = await Promise.all(
        result.map(async (project) => {
          try {
            const materials = await getMaterialsByProjectId(project.id);

            const latestDate = materials.reduce<string | null>(
              (latest, material) => {
                if (!material.updatedAt) return latest;

                if (!latest) return material.updatedAt;

                return new Date(material.updatedAt).getTime() >
                  new Date(latest).getTime()
                  ? material.updatedAt
                  : latest;
              },
              null,
            );

            return [project.id, latestDate ?? ''] as const;
          } catch {
            return [project.id, ''] as const;
          }
        }),
      );
      setLatestUpdatedAtByProject(Object.fromEntries(materialDates));

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

      if (
        expandedProjectId &&
        !filteredProjects.some((project) => project.id === expandedProjectId)
      ) {
        setExpandedProjectId(null);
      }
    } catch {
      setError(t('projects.error'));
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleProject(project: Project) {
    if (expandedProjectId === project.id) {
      setExpandedProjectId(null);
      return;
    }

    setExpandedProjectId(project.id);

    if (materialsByProject[project.id]) return;

    setLoadingProjectId(project.id);
    setMaterialErrors((current) => ({
      ...current,
      [project.id]: false,
    }));

    try {
      const materials = await getMaterialsByProjectId(project.id);

      setMaterialsByProject((current) => ({
        ...current,
        [project.id]: materials,
      }));
    } catch {
      setMaterialErrors((current) => ({
        ...current,
        [project.id]: true,
      }));
    } finally {
      setLoadingProjectId((current) =>
        current === project.id ? null : current,
      );
    }
  }

  useEffect(() => {
    void loadProjects();
  }, [search]);

  useEffect(() => {
    gridRef.current?.api.resetRowHeights();
  }, [
    materialsByProject,
    loadingProjectId,
    materialErrors,
    expandedProjectId,
  ]);

  useEffect(() => {
    const updateRowHeights = () => {
      gridRef.current?.api.resetRowHeights();
    };

    window.addEventListener('resize', updateRowHeights);

    return () => {
      window.removeEventListener('resize', updateRowHeights);
    };
  }, []);

  const rowData: ProjectGridRow[] = projects.flatMap((project) => {
    const rows: ProjectGridRow[] = [
      { kind: 'project', project },
    ];

    if (expandedProjectId === project.id) {
      rows.push({
        kind: 'detail',
        projectId: project.id,
        materials: materialsByProject[project.id] ?? [],
        loading: loadingProjectId === project.id,
        error: materialErrors[project.id] ?? false,
      });
    }

    return rows;
  });

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
                onClick={() => void loadProjects()}
              >
                {t('projects.retry')}
              </IxButton>
            </div>
          </IxMessageBar>
        ) : projects.length === 0 && !isLoading ? (
          <p>{t('projects.empty')}</p>
        ) : (
          <div className={styles.projectsGrid}>
            <AgGridReact<ProjectGridRow>
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              theme={ixTheme}
              getRowId={(params) =>
                params.data.kind === 'project'
                  ? `project-${params.data.project.id}`
                  : `detail-${params.data.projectId}`
              }
              isFullWidthRow={(params) =>
                params.rowNode.data?.kind === 'detail'
              }
              fullWidthCellRenderer={MaterialsDetailRenderer}

              getRowHeight={(params) => {
                if (params.data?.kind !== 'detail') return 48;

                if (params.data.loading || params.data.error) return 100;

                const isMobile = window.innerWidth <= 992;
                const materialCount = params.data.materials.length;

                return isMobile
                  ? Math.max(120, 100 + materialCount * 180)
                  : Math.max(100, 70 + materialCount * 48);
              }}

              onRowClicked={(event) => {
                const row = event.data;

                if (row?.kind === 'project') {
                  void toggleProject(row.project);
                }
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default Projects;
