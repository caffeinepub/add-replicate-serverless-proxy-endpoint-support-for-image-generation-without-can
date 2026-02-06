import { useState, useEffect } from 'react';

export type AuthorizationHeaderMode = 'none' | 'bearer' | 'token';

interface CustomApiConfig {
  apiUrl: string;
  apiKey: string;
  authorizationHeaderMode: AuthorizationHeaderMode;
}

const STORAGE_KEY = 'customApiConfig';

export function useCustomApiConfig() {
  const [config, setConfig] = useState<CustomApiConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Backwards compatibility: default to 'bearer' if authorizationHeaderMode is missing
        return {
          apiUrl: parsed.apiUrl || '',
          apiKey: parsed.apiKey || '',
          authorizationHeaderMode: parsed.authorizationHeaderMode || 'bearer',
        };
      }
      return { apiUrl: '', apiKey: '', authorizationHeaderMode: 'bearer' };
    } catch {
      return { apiUrl: '', apiKey: '', authorizationHeaderMode: 'bearer' };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save custom API config:', error);
    }
  }, [config]);

  const updateConfig = (updates: Partial<CustomApiConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const validate = (): string | null => {
    if (!config.apiUrl.trim()) {
      return 'API URL is required';
    }

    try {
      new URL(config.apiUrl);
    } catch {
      return 'Please enter a valid URL';
    }

    if (!config.apiUrl.startsWith('https://') && !config.apiUrl.startsWith('http://')) {
      return 'URL must start with http:// or https://';
    }

    if (config.authorizationHeaderMode !== 'none' && !config.apiKey.trim()) {
      return 'API key/token is required when authorization mode is not "No auth"';
    }

    return null;
  };

  return {
    config,
    updateConfig,
    validate,
    validationError: validate(),
  };
}
