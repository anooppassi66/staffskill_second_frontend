import { useEffect, useState } from 'react';

type Status = 'loading' | 'loaded' | 'error';

/**
 * Custom hook to load an external script dynamically.
 * @param url The URL of the script to load.
 * @returns The loading status of the script.
 */
export const useScript = (url: string): Status => {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    // Check if the script already exists in the document
    let script = document.querySelector(`script[src="${url}"]`) as HTMLScriptElement;

    if (!script) {
      // Create and append the script element
      script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.setAttribute('data-status', 'loading');
      document.body.appendChild(script);

      // Set initial status
      const setStatusFromEvent = (event: Event) => {
        const newStatus = event.type === 'load' ? 'loaded' : 'error';
        script.setAttribute('data-status', newStatus);
        setStatus(newStatus);
      };

      script.addEventListener('load', setStatusFromEvent);
      script.addEventListener('error', setStatusFromEvent);
    } else {
      // If the script exists, read its current status
      const currentStatus = script.getAttribute('data-status') as Status;
      setStatus(currentStatus || 'loaded');
    }

    return () => {
      // Cleanup (optional: could remove the script, but for large APIs like YouTube,
      // it's often better to leave it for performance)
      // script.removeEventListener('load', ...);
      // script.removeEventListener('error', ...);
    };
  }, [url]);

  return status;
};