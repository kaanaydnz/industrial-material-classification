/*
 * Copyright (c) Siemens 2018 - 2026
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';
import {
    IxButton,
    IxContentHeader,
    IxMessageBar,
    showToast,
    IxLayoutGrid,
    IxRow,
    IxCol,
    IxCard,
} from '@siemens/ix-react';
import { useTranslation } from 'react-i18next';
import type { Material } from '../../types/material';
import {
    getMaterialDrafts,
    deleteMaterialDraft,
    updateMaterial,
} from '../../services/mockApi';
import styles from './Review.module.css';

function Review() {
    const { t, i18n } = useTranslation();
    const [drafts, setDrafts] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    async function loadDrafts() {
        setIsLoading(true);
        setError(false);

        try {
            setDrafts(await getMaterialDrafts());
        } catch {
            setError(true);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadDrafts();
    }, []);

    async function handleConfirm(material: Material) {
        try {
            await updateMaterial(material.id, {
                name: material.name,
                description: material.description,
                category: material.category,
                materialType: material.materialType,
                status: 'confirmed',
            });

            await deleteMaterialDraft(material.id, false);

            showToast({
                message: t('review.confirmSuccess'),
                type: 'success',
            });

            await loadDrafts();
        } catch {
            setError(true);

            showToast({
                message: t('review.error'),
                type: 'error',
            });
        }
    }

    async function handleDiscard(material: Material) {
        try {
            await deleteMaterialDraft(material.id);

            showToast({
                message: t('review.discardSuccess'),
                type: 'success',
            });

            await loadDrafts();
        } catch {
            setError(true);

            showToast({
                message: t('review.error'),
                type: 'error',
            });
        }
    }

    return (
        <div className={styles.reviewPage}>
            <IxContentHeader headerTitle={t('review.title')} />

            {
                error && (
                    <IxMessageBar
                        className={styles.reviewMessage}
                        type="warning"
                        persistent>
                        {t('review.error')}
                    </IxMessageBar>
                )
            }

            <div className={styles.reviewContent}>
                {isLoading ? (
                    <p>{t('review.loading')}</p>
                ) : error ? null : drafts.length === 0 ? (
                    <p>{t('review.empty')}</p>
                ) : (
                    <div className={styles.draftsList}>
                        <IxLayoutGrid noMargin>
                            <IxRow>
                                {drafts.map((material) => (
                                    <IxCol key={material.id}
                                        size="12" sizeLg="6">
                                        <IxCard
                                            variant="outline"
                                            className={styles.draftCard}
                                        >
                                            <div className={styles.draftCardContent}>
                                                <div className={styles.draftHeader}>
                                                    <h3>{material.name}</h3>
                                                    <span className={styles.materialNumber}>
                                                        {material.materialNumber}
                                                    </span>
                                                </div>

                                                <div className={styles.draftDetails}>
                                                    <div className={styles.detailField}>
                                                        <span className={styles.detailLabel}>
                                                            {t('review.lastUpdated')}
                                                        </span>
                                                        <p className={styles.detailValue}>
                                                            {new Date(material.updatedAt).toLocaleString(
                                                                i18n.language === 'tr' ? 'tr-TR' : 'en-GB',
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className={styles.detailField}>
                                                        <span className={styles.detailLabel}>
                                                            {t('review.category')}
                                                        </span>
                                                        <p className={styles.detailValue}>
                                                            {material.category}
                                                        </p>
                                                    </div>

                                                    <div className={styles.detailField}>
                                                        <span className={styles.detailLabel}>
                                                            {t('review.type')}
                                                        </span>
                                                        <p className={styles.detailValue}>
                                                            {material.materialType}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className={styles.draftDescription}>
                                                    <p className={styles.detailValue}>
                                                        {material.description}
                                                    </p>
                                                </div>

                                                <div className={styles.draftActions}>
                                                    <IxButton onClick={() => handleConfirm(material)}>
                                                        {t('review.confirm')}
                                                    </IxButton>

                                                    <IxButton
                                                        variant="secondary"
                                                        onClick={() => handleDiscard(material)}
                                                    >
                                                        {t('review.discard')}
                                                    </IxButton>
                                                </div>
                                            </div>
                                        </IxCard>
                                    </IxCol>
                                ))}
                            </IxRow>
                        </IxLayoutGrid>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Review;