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
  IxButton
} from '@siemens/ix-react';
import type { Material } from '../../types/material';
import { useTranslation } from 'react-i18next';
import { getMaterials } from '../../services/mockApi';
import styles from './Classification.module.css';




function Classification() {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const selectedMaterial = materials.find(
    (material) => material.id === selectedId
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMaterials() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getMaterials();
      setMaterials(result);
      setSelectedId(result[0]?.id ?? '');
    } catch {
      setError(t('classification.error'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  return (
    <div className={styles.classificationPage}>
      <div className={styles.pageHeader}>
        <IxContentHeader headerTitle={t('classification.title')} />
      </div>

      <div className={styles.classificationContent}>

        {isLoading ? (
          <p>{t('classification.loading')}</p>
        ) : error ? (
          <IxMessageBar persistent type="warning">
            <div className="message-bar-warning">
              {error}
              <IxButton
                className={styles.retryButton}
                onClick={() => loadMaterials()}
              >{t('classification.retry')}</IxButton>
            </div>
          </IxMessageBar>
        ) : materials.length === 0 ? (
          <p>{t('classification.empty')}</p>
        ) : (
          <div className={styles.selectorField}>
            <label htmlFor="material-select">
              {t('classification.selectMaterial')}
            </label>

            <IxSelect
              id="material-select"
              value={selectedId}
              onValueChange={(event) => {
                const value = event.detail;
                setSelectedId(Array.isArray(value) ? value[0] ?? '' : value);
              }}          >
              {materials.map((material) => (
                <IxSelectItem
                  key={material.id}
                  value={material.id}
                  label={`${material.materialNumber} — ${material.name}`}
                />
              ))}
            </IxSelect>
          </div>

        )}
      </div>

    </div>
  );
}

export default Classification;
