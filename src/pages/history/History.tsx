
/*
 * Copyright (c) Siemens 2018 - 2026
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useMemo, useState } from 'react';
import {
  IxContentHeader,
  IxMessageBar,
  IxButton,
} from '@siemens/ix-react';
import { useTranslation } from 'react-i18next';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import * as agGrid from 'ag-grid-community';
import { getIxTheme } from '@siemens/ix-aggrid';
import type { ClassificationHistoryEntry } from '../../types/material';
import { getClassificationHistory } from '../../services/mockApi';
import styles from './History.module.css';

const ixTheme = getIxTheme(agGrid, {
  stripedRows: true,
});

function History() {
  const { t, i18n } = useTranslation();

  const [entries, setEntries] = useState<ClassificationHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  async function loadHistory() {
    setIsLoading(true);
    setError(false);

    try {
      setEntries(await getClassificationHistory());
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const columnDefs = useMemo<ColDef<ClassificationHistoryEntry>[]>(
    () => [
      {
        field: 'timestamp',
        headerName: t('history.timestamp'),
        flex: 1.4,
        minWidth: 180,
        valueFormatter: (params) => {
          if (!params.value) return '';

          return new Intl.DateTimeFormat(
            i18n.language.startsWith('tr') ? 'tr-TR' : 'en-GB',
            { dateStyle: 'medium', timeStyle: 'short' },
          ).format(new Date(params.value));
        },
        sort: 'desc',
      },
      {
        field: 'materialId',
        headerName: t('history.materialId'),
        flex: 1,
        minWidth: 130,
      },
      {
        field: 'action',
        headerName: t('history.action'),
        flex: 1,
        minWidth: 150,
        valueFormatter: (params) =>
          params.value
            ? t(`history.actions.${params.value}`)
            : '',
      },
      {
        field: 'user',
        headerName: t('history.user'),
        flex: 1,
        minWidth: 130,
      },
      {
        field: 'details',
        headerName: t('history.details'),
        flex: 1.5,
        minWidth: 180,
      },
      {
        headerName: t('history.changes'),
        flex: 2,
        minWidth: 260,
        valueFormatter: (params) => {
          const changes = params.data?.changes;

          if (!changes?.length) {
            return params.data?.details ?? '';
          }

          return changes
            .map(
              (change) =>
                `${t(`history.fields.${change.field}`)}: ${change.from || '—'
                } → ${change.to || '—'}`,
            )
            .join('\n');
        },
        wrapText: true,
        autoHeight: true,
        cellStyle: {
          whiteSpace: 'pre-line',
          lineHeight: '1.6',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '6px',
          paddingBottom: '6px',
        },
      },
    ],
    [t, i18n.language],
  );

  return (
    <div className={styles.historyPage}>
      <IxContentHeader headerTitle={t('history.title')} />

      <div className={styles.historyContent}>
        {error && (
          <IxMessageBar type="warning" persistent>
            {t('history.error')}
            <IxButton
              variant="secondary"
              onClick={loadHistory}
            >
              {t('classification.projects.retry')}
            </IxButton>
          </IxMessageBar>
        )}

        {isLoading ? (
          <p>{t('history.loading')}</p>
        ) : error ? null : entries.length === 0 ? (
          <p>{t('history.empty')}</p>
        ) : (
          <div className={styles.historyGrid}>
            <AgGridReact<ClassificationHistoryEntry>
              rowData={entries}
              columnDefs={columnDefs}
              theme={ixTheme}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
