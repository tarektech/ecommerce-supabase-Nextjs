'use client';

import { useEffect, useState } from 'react';
import { createElement } from 'react';

const StagewiseToolbar = () => {
  const [toolbarModule, setToolbarModule] = useState<{
    StagewiseToolbar: unknown;
  } | null>(null);

  useEffect(() => {
    // Only initialize in development mode
    if (process.env.NODE_ENV === 'development') {
      const loadToolbar = async () => {
        try {
          const moduleImport = await import('@stagewise/toolbar-next');
          setToolbarModule(moduleImport);
        } catch (error) {
          console.warn('Failed to load Stagewise toolbar:', error);
        }
      };

      loadToolbar();
    }
  }, []);

  if (process.env.NODE_ENV !== 'development' || !toolbarModule) {
    return null;
  }

  const stagewiseConfig = {
    plugins: [],
  };

  return createElement(
    toolbarModule.StagewiseToolbar as React.ComponentType<{
      config: { plugins: unknown[] };
    }>,
    {
      config: stagewiseConfig,
    }
  );
};

export default StagewiseToolbar;
