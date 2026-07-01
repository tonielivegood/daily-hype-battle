import { useState, useEffect, useCallback } from 'react';
import type {
  LaunchpadSubmission,
  GetLaunchpadResponse,
  SubmitLaunchpadRequest,
  HypeErrorResponse,
  CuratedLaunchpadPreview,
  CurateLaunchpadResponse,
  UploadMemeImageResponse,
} from '../../shared/types';

export const useLaunchpad = () => {
  const [submissions, setSubmissions] = useState<LaunchpadSubmission[]>([]);
  const [userSubmissionId, setUserSubmissionId] = useState<string | null>(null);
  const [supportedIds, setSupportedIds] = useState<string[]>([]);
  const [curatedPreview, setCuratedPreview] = useState<CuratedLaunchpadPreview | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [curating, setCurating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [curateError, setCurateError] = useState<string | null>(null);

  const fetchLaunchpad = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/launchpad');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: GetLaunchpadResponse = await res.json();
      setSubmissions(data.submissions);
      setUserSubmissionId(data.userSubmissionId);
      setSupportedIds(data.supportedSubmissionIds);
      setCuratedPreview(data.curatedPreview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Launchpad');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const doFetch = async () => {
      try {
        const res = await fetch('/api/launchpad');
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data: GetLaunchpadResponse = await res.json();
        if (cancelled) return;
        setSubmissions(data.submissions);
        setUserSubmissionId(data.userSubmissionId);
        setSupportedIds(data.supportedSubmissionIds);
        setCuratedPreview(data.curatedPreview);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load Launchpad');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void doFetch();

    return () => {
      cancelled = true;
    };
  }, []);

  const submitIdea = useCallback(async (idea: SubmitLaunchpadRequest) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/launchpad/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(idea),
      });
      if (!res.ok) {
        const errData: HypeErrorResponse = await res.json();
        throw new Error(errData.message || `HTTP ${res.status}`);
      }
      const newSub: LaunchpadSubmission = await res.json();
      setUserSubmissionId(newSub.id);
      await fetchLaunchpad();
      return { success: true, message: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit idea';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setSubmitting(false);
    }
  }, [fetchLaunchpad]);

  const supportIdea = useCallback(async (submissionId: string) => {
    setError(null);
    try {
      const res = await fetch('/api/launchpad/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });
      if (!res.ok) {
        const errData: HypeErrorResponse = await res.json();
        throw new Error(errData.message || `HTTP ${res.status}`);
      }
      await fetchLaunchpad();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update support');
    }
  }, [fetchLaunchpad]);

  const curateLaunchpad = useCallback(async () => {
    setCurating(true);
    setCurateError(null);
    try {
      const res = await fetch('/api/launchpad/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const errData: HypeErrorResponse = await res.json();
        throw new Error(errData.message || `HTTP ${res.status}`);
      }
      const data: CurateLaunchpadResponse = await res.json();
      setCuratedPreview(data.curatedPreview);
      return { success: true, message: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to curate Launchpad';
      setCurateError(msg);
      return { success: false, message: msg };
    } finally {
      setCurating(false);
    }
  }, []);

  const uploadMemeImage = useCallback(async (url: string, type: 'image' | 'gif') => {
    try {
      const res = await fetch('/api/upload-meme-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type }),
      });
      if (!res.ok) {
        const errData: HypeErrorResponse = await res.json();
        throw new Error(errData.message || `Upload failed (HTTP ${res.status})`);
      }
      const data: UploadMemeImageResponse = await res.json();
      return { success: true as const, data };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image upload failed';
      return { success: false as const, message: msg };
    }
  }, []);

  return {
    submissions,
    userSubmissionId,
    supportedIds,
    curatedPreview,
    loading,
    submitting,
    curating,
    error,
    curateError,
    submitIdea,
    supportIdea,
    curateLaunchpad,
    uploadMemeImage,
    refresh: fetchLaunchpad,
  };
};
