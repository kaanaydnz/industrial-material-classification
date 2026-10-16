/*
 * Copyright (c) Siemens 2018 - 2026
 * SPDX-License-Identifier: MIT
 */

import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  IxApplication,
  IxApplicationHeader,
  IxMenu,
  IxMenuItem,
  IxContent,
} from '@siemens/ix-react';

import Dashboard from './pages/dashboard/Dashboard';
import Projects from './pages/projects/Projects';
import Classification from './pages/classification/Classification';
import History from './pages/history/History';
import { useEffect } from 'react';
import './App.css';
import { iconDashboard, iconProject, iconLayers, iconHistory, iconGlobe } from '@siemens/ix-icons/icons';
import { useTranslation } from 'react-i18next';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string): boolean => location.pathname === path;
  const { t, i18n } = useTranslation();

  // Save theme
  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light' || savedTheme === 'dark') {
      root.setAttribute('data-ix-color-schema', savedTheme);
    }

    const observer = new MutationObserver(() => {
      const theme = root.getAttribute('data-ix-color-schema');

      if (theme === 'light' || theme === 'dark') {
        localStorage.setItem('theme', theme);
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-ix-color-schema'],
    });

    return () => observer.disconnect();
  }, []);
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <IxApplication>
        <IxApplicationHeader
          name={t('app.name')} >
        </IxApplicationHeader>

        <IxMenu enableToggleTheme aria-label="Main navigation">
          <IxMenuItem
            icon={iconDashboard}
            active={isActive('/')}
            onClick={e => {
              e.preventDefault();
              navigate('/');
            }}
          >
            {t('navigation.dashboard')}
          </IxMenuItem>
          <IxMenuItem
            icon={iconProject}
            active={isActive('/projects')}
            onClick={e => {
              e.preventDefault();
              navigate('/projects');
            }}
          >
            {t('navigation.projects')}
          </IxMenuItem>
          <IxMenuItem
            icon={iconLayers}
            active={isActive('/classification')}
            onClick={e => {
              e.preventDefault();
              navigate('/classification');
            }}
          >
            {t('navigation.classification')}
          </IxMenuItem>
          <IxMenuItem
            icon={iconHistory}
            active={isActive('/history')}
            onClick={e => {
              e.preventDefault();
              navigate('/history');
            }}
          >
            {t('navigation.history')}
          </IxMenuItem>
          <IxMenuItem
            slot="bottom"
            icon={iconGlobe}
            onClick={() => {
              const language = i18n.language === 'en' ? 'tr' : 'en';
              i18n.changeLanguage(language);
              localStorage.setItem('language', language);
            }}
          >
            {i18n.language === 'en' ? 'Türkçe' : 'English'}
          </IxMenuItem>
        </IxMenu>

        <IxContent id="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/classification" element={<Classification />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </IxContent>
      </IxApplication>
    </>
  );
}

export default App;
