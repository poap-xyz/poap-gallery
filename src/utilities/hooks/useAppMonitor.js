import { useEffect } from 'react';
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: process.env.REACT_APP_DATADOG_APPLICATION_ID || '',
  clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN || '',
  site: 'datadoghq.com',
  service: process.env.REACT_APP_DATADOG_SERVICE || '',
  //TODO: Investigate how to dynamically get the tag version from the latest deploy.
  // We left the default value for now to check if Netlify takes automatically values from the .env files.
  version: '0.11.0',
  sampleRate: 10,
  replaySampleRate: 0,
  trackInteractions: false,
});

export const useAppMonitor = () => {
  useEffect(() => {
    if (process.env.REACT_APP_DATADOG_APPLICATION_ID) {
      datadogRum.startSessionReplayRecording();
    }
  }, []);
};
