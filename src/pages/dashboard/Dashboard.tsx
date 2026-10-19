import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import {
  IxButton,
  IxCard,
  IxCardContent,
  IxCol,
  IxContentHeader,
  IxEventList,
  IxEventListItem,
  IxIcon,
  IxLayoutGrid,
  IxMessageBar,
  IxPill,
  IxRow,
  IxSpinner,
  IxTypography,
} from '@siemens/ix-react';
import {
  iconDocument,
  iconLayers,
  iconPen,
  iconProject,
  iconHistory,
} from '@siemens/ix-icons/icons';
import { useTranslation } from 'react-i18next';
import {
  getClassificationHistory,
  getMaterialDrafts,
  getMaterials,
  getProjects,
} from '../../services/mockApi';
import type {
  ClassificationHistoryEntry,
  ClassificationStatus,
  Material,
  Project,
} from '../../types/material';
import styles from './Dashboard.module.css';

type PillVariant = 'neutral' | 'warning' | 'info' | 'success';

const STATUS_ORDER: ClassificationStatus[] = [
  'confirmed',
  'draft',
  'unclassified',
];

const STATUS_PILL: Record<ClassificationStatus, PillVariant> = {
  confirmed: 'success',
  draft: 'warning',
  unclassified: 'neutral',
};

const ACTION_PILL: Record<ClassificationHistoryEntry['action'], PillVariant> = {
  created: 'info',
  updated: 'neutral',
  submitted: 'info',
  confirmed: 'success',
  discarded: 'warning',
};

const RECENT_ACTIVITY_LIMIT = 5;

const percent = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

function Panel({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <IxCard variant="outline" className={styles.card}>
      <IxCardContent>
        <div className={styles.panel}>
          <div className={styles.header}>
            <span className={styles.inline}>
              {icon && <IxIcon name={icon} size="24" />}
              <IxTypography format="h4" bold>
                {title}
              </IxTypography>
            </span>
            {action}
          </div>
          {children}
        </div>
      </IxCardContent>
    </IxCard>
  );
}

function Bar({ value, tone }: { value: number; tone: string }) {
  return (
    <div className={styles.track}>
      <span className={`${styles.fill} ${tone}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.language.startsWith('tr') ? 'tr-TR' : 'en-GB';

  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [drafts, setDrafts] = useState<Material[]>([]);
  const [history, setHistory] = useState<ClassificationHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getProjects(),
      getMaterials(),
      getMaterialDrafts(),
      getClassificationHistory(),
    ])
      .then(([p, m, d, h]) => {
        if (cancelled) return;
        setProjects(p);
        setMaterials(m);
        setDrafts(d);
        setHistory(h);
      })
      .catch(() => !cancelled && setHasError(true))
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const statusCounts = useMemo(() => {
    const counts: Record<ClassificationStatus, number> = {
      confirmed: 0,
      draft: 0,
      unclassified: 0,
    };

    const draftIds = new Set(drafts.map((draft) => draft.id));

    materials.forEach((material) => {
      const status = draftIds.has(material.id) ? 'draft' : material.status;
      counts[status] += 1;
    });

    drafts.forEach((draft) => {
      if (!materials.some((material) => material.id === draft.id)) {
        counts.draft += 1;
      }
    });

    return counts;
  }, [materials, drafts]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    materials.forEach((m) =>
      map.set(m.category, (map.get(m.category) ?? 0) + 1),
    );
    return Array.from(map.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [materials]);

  const projectProgress = useMemo(
    () =>
      projects.map((project) => {
        const own = materials.filter((m) => m.projectId === project.id);
        return {
          project,
          total: own.length,
          confirmed: own.filter((m) => m.status === 'confirmed').length,
        };
      }),
    [projects, materials],
  );

  const total = materials.length;
  const maxCategory = categories[0]?.[1] ?? 0;
  const activeProjects = projects.filter((p) => p.status === 'active').length;

  const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  const cardLink = (path: string) => ({
    role: 'link',
    tabIndex: 0,
    onClick: () => navigate(path),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate(path);
      }
    },
  });

  const kpis = [
    {
      key: 'projects',
      icon: iconProject,
      label: t('dashboard.totalProjects'),
      value: projects.length,
      hint: t('dashboard.kpiHints.activeProjects', { value: activeProjects }),
      path: '/projects',
    },
    {
      key: 'materials',
      icon: iconDocument,
      label: t('dashboard.materials'),
      value: total,
      hint: t('dashboard.kpiHints.unclassified', {
        value: statusCounts.unclassified,
      }),
      path: '/classification',
    },
    {
      key: 'drafts',
      icon: iconPen,
      label: t('dashboard.drafts'),
      value: drafts.length,
      hint: t('dashboard.kpiHints.awaitingConfirmation'),
      path: '/review',
    },
    {
      key: 'history',
      icon: iconHistory,
      label: t('dashboard.history'),
      value: history.length,
      hint: t('dashboard.kpiHints.totalLogs'),
      path: '/history',
    },
  ];

  const viewAll = (path: string) => (
    <IxButton variant="tertiary" onClick={() => navigate(path)}>
      {t('dashboard.viewAll')}
    </IxButton>
  );

  return (
    <main className={styles.dashboard}>
      <IxContentHeader headerTitle={t('dashboard.title')} />

      {hasError && (
        <IxMessageBar type="warning">{t('dashboard.loadError')}</IxMessageBar>
      )}

      {isLoading ? (
        <div className={styles.loading} role="status" aria-busy="true">
          <IxSpinner size="large" />
          <IxTypography textColor="soft">{t('dashboard.loading')}</IxTypography>
        </div>
      ) : (
        <IxLayoutGrid noMargin>
          <IxRow>
            {kpis.map((kpi) => (
              <IxCol
                key={kpi.key}
                size="12"
                sizeSm="6"
                sizeLg="3"
                className={styles.col}
              >
                <IxCard
                  variant="outline"
                  className={styles.card}
                  {...cardLink(kpi.path)}
                  aria-label={`${kpi.label}: ${kpi.value}`}
                >
                  <IxCardContent>
                    <div className={styles.panel}>
                      <span className={styles.inline}>
                        <IxIcon name={kpi.icon} size="24" />
                        <IxTypography format="h4" bold>
                          {kpi.label}
                        </IxTypography>
                      </span>
                      <IxTypography format="display-lg">
                        {kpi.value}
                      </IxTypography>
                      <IxTypography format="body-sm" textColor="soft">
                        {kpi.hint}
                      </IxTypography>
                    </div>
                  </IxCardContent>
                </IxCard>
              </IxCol>
            ))}
          </IxRow>

          <IxRow>
            <IxCol size="12" sizeLg="7" className={styles.col}>
              <Panel
                title={t('dashboard.statusDistribution.title')}
                icon={iconLayers}
              >
                {total === 0 ? (
                  <IxTypography textColor="soft">
                    {t('dashboard.statusDistribution.empty')}
                  </IxTypography>
                ) : (
                  <>
                    <div
                      className={styles.stackedBar}
                      role="img"
                      aria-label={STATUS_ORDER.map(
                        (s) =>
                          `${t(`projects.statusValues.${s}`)}: ${statusCounts[s]}`,
                      ).join(', ')}
                    >
                      {STATUS_ORDER.filter((s) => statusCounts[s] > 0).map(
                        (s) => (
                          <span
                            key={s}
                            className={`${styles.segment} ${styles[STATUS_PILL[s]]}`}
                            style={{ flexGrow: statusCounts[s] }}
                          />
                        ),
                      )}
                    </div>

                    <ul className={styles.legend}>
                      {STATUS_ORDER.map((s) => (
                        <li key={s} className={styles.row}>
                          <span className={styles.inline}>
                            <span
                              className={`${styles.dot} ${styles[STATUS_PILL[s]]}`}
                              aria-hidden="true"
                            />
                            <IxTypography format="body">
                              {t(`projects.statusValues.${s}`)}
                            </IxTypography>
                          </span>
                          <IxTypography format="body" bold>
                            {statusCounts[s]}{' '}
                            <IxTypography
                              format="body"
                              textColor="soft"
                              className={styles.inlineText}
                            >
                              ({percent(statusCounts[s], total)}%)
                            </IxTypography>
                          </IxTypography>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Panel>
            </IxCol>

            <IxCol size="12" sizeLg="5" className={styles.col}>
              <Panel title={t('dashboard.categories.title')}>
                {categories.length === 0 ? (
                  <IxTypography textColor="soft">
                    {t('dashboard.categories.empty')}
                  </IxTypography>
                ) : (
                  <ul className={styles.list}>
                    {categories.map(([name, count]) => (
                      <li key={name} className={styles.item}>
                        <div className={styles.row}>
                          <IxTypography format="body">
                            {t(`projects.categories.${name}`, {
                              defaultValue: name,
                            })}
                          </IxTypography>
                          <IxTypography format="body" bold>
                            {count}
                          </IxTypography>
                        </div>
                        <Bar
                          value={percent(count, maxCategory)}
                          tone={styles.primary}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </IxCol>
          </IxRow>

          <IxRow>
            <IxCol size="12" sizeLg="6" className={styles.col}>
              <Panel
                title={t('dashboard.projectProgress.title')}
                action={viewAll('/projects')}
              >
                {projectProgress.length === 0 ? (
                  <IxTypography textColor="soft">
                    {t('projects.empty')}
                  </IxTypography>
                ) : (
                  <ul className={styles.list}>
                    {projectProgress.map(({ project, total: pt, confirmed }) => (
                      <li key={project.id} className={styles.item}>
                        <div className={styles.row}>
                          <span className={styles.inline}>
                            <IxTypography format="body" bold>
                              {project.name}
                            </IxTypography>
                            <IxPill
                              variant={
                                project.status === 'active'
                                  ? 'success'
                                  : 'neutral'
                              }
                              outline
                            >
                              {t(`projects.statuses.${project.status}`)}
                            </IxPill>
                          </span>
                          <IxTypography format="body" textColor="soft">
                            {confirmed} / {pt}
                          </IxTypography>
                        </div>
                        <Bar
                          value={percent(confirmed, pt)}
                          tone={styles.success}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </IxCol>

            <IxCol size="12" sizeLg="6" className={styles.col}>
              <Panel
                title={t('dashboard.recentActivity.title')}
                action={viewAll('/history')}
              >
                {history.length === 0 ? (
                  <IxTypography textColor="soft">
                    {t('dashboard.recentActivity.empty')}
                  </IxTypography>
                ) : (
                  <IxEventList>
                    {history.slice(0, RECENT_ACTIVITY_LIMIT).map((entry) => (
                      <IxEventListItem
                        key={entry.id}
                        itemColor={`color-${ACTION_PILL[entry.action]}`}
                      >
                        <span className={styles.inline}>
                          <IxPill variant={ACTION_PILL[entry.action]} outline>
                            {t(`history.actions.${entry.action}`)}
                          </IxPill>
                          <IxTypography format="body" bold>
                            {entry.materialId}
                          </IxTypography>
                        </span>
                        <IxTypography format="body-sm" textColor="soft">
                          {'\u00A0· '}{formatDateTime(entry.timestamp)} · {entry.user}
                        </IxTypography>
                      </IxEventListItem>
                    ))}
                  </IxEventList>
                )}
              </Panel>
            </IxCol>
          </IxRow>
        </IxLayoutGrid>
      )}
    </main>
  );
}

export default Dashboard;