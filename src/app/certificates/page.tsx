// components/CertificatesTable.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { Eye, Download } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import EmptyState from '../components/ui/EmptyState';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ENDPOINTS, MEDIA } from '@/Api';
import MainLoader from '@/app/components/MainLoader';
import ReactSelect from '../components/ui/ReactSelect';
import PageHeader from "../components/PageHeader";
import PaginationComp from '../components/ui/Pagination';


type CertItem = { id?: string; name?: string; date?: string; marks?: number; outOf?: number; file?: string };
type PendingItem = { courseId: string; courseTitle: string };



const CertificatesTable: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [items, setItems] = useState<CertItem[]>([]);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const qs = new URLSearchParams();
        qs.set('skip', String(skip));
        qs.set('limit', String(limit));
        const [resCerts, resDash] = await Promise.all([
          fetch(ENDPOINTS.CERTIFICATES.LIST + `?${qs.toString()}` , { headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) } }),
          fetch(ENDPOINTS.EMPLOYEE.DASHBOARD, { headers: { ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}) } }),
        ]);
        if (!resCerts.ok || !resDash.ok) {
          const codes = [resCerts.status, resDash.status];
          if (codes.includes(404) || codes.includes(501) || codes.includes(503)) {
            setInProgress(true);
          }
          const err1 = await resCerts.json().catch(() => ({}));
          const err2 = await resDash.json().catch(() => ({}));
          const msg = err1.message || err2.message || 'Failed to load certificates';
          throw new Error(msg);
        }
        const dataCerts = await resCerts.json().catch(() => ({}));
        const list = dataCerts.certificates || dataCerts.items || [];
        setItems(Array.isArray(list) ? list : []);
        const meta = dataCerts.meta || {};
        setTotal(meta.total || Array.isArray(list) ? list.length : 0);

        const dataDash = await resDash.json().catch(() => ({}));
        const dashboard = Array.isArray(dataDash.dashboard) ? dataDash.dashboard : [];
        const pendingList: PendingItem[] = dashboard
          .filter((en: any) => !!en.isCompleted && !en.certificate)
          .map((en: any) => ({ courseId: en.course?.id || en.course, courseTitle: en.course?.title || 'Course' }));
        setPending(pendingList);
      } catch (err: any) {
        setError(err.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, limit]);

  const handleAttempt = async (courseId: string) => {
    try {
      const qs = new URLSearchParams();
      qs.set('limit', '1');
      qs.set('course', courseId);
      const resQuiz = await fetch(ENDPOINTS.QUIZ.CREATE_QUIZ + `?${qs.toString()}`, {
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      });
      const data = await resQuiz.json().catch(() => ({}));
      const list = Array.isArray(data.quizzes) ? data.quizzes : Array.isArray(data.items) ? data.items : [];
      const target = list[0];
      const quizId = target?._id || target?.id;
      window.location.href = quizId ? `/quiz/${quizId}` : `/quiz?course=${courseId}`;
    } catch {
      window.location.href = `/quiz?course=${courseId}`;
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Certificates" subtitle="Your earned certificates" />
      {inProgress && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body">
            <div className="fw-semibold">Currently in progress</div>
            <div className="text-muted small">This module API is not available yet.</div>
          </div>
        </div>
      )}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="fw-medium mb-2">Pending Quizzes</div>
          {loading && <MainLoader />}
          {!loading && pending.length === 0 && (
            <div className="text-muted small">No pending quizzes</div>
          )}
          {!loading && pending.length > 0 && (
            <div className="table-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th className="text-start">Course</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((p, idx) => (
                    <tr key={`${p.courseId || p.courseTitle}-${idx}`}>
                      <td className="fw-medium">{p.courseTitle}</td>
                      <td className="text-end">
                        <button className="custom-btn" onClick={() => handleAttempt(p.courseId)}>Attempt Quiz</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Table Container (matches the look of the card in the image) */}
    <div className="table-wrapper">
                  <table className="user-table">
          {/* Table Header */}
          <thead>
            <tr>
              <th scope="col" className="text-start">Course Name</th>
              <th scope="col" className="text-start">Certificate Name</th>
              <th scope="col" className="text-start">Date</th>
              <th scope="col" className="text-center">Marks</th>
              <th scope="col" className="text-center">Out of</th>
              {/* Empty header for the action icons column */}
              <th scope="col"></th> 
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody>
            {error && (
              <tr>
                <td colSpan={6} className="text-danger">{error}</td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={6}><MainLoader /></td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No certificates" subtitle="Certificates you earn will appear here" />
                </td>
              </tr>
            )}
             {items.map((cert: any, idx) => (
              <tr key={`${cert.id || cert.file || 'cert'}-${idx}`}>
                <td className="fw-normal" data-label="Category">
                  {cert?.course?.category?.name || cert?.course?.category?.title || cert?.course?.category?.category_name || (typeof cert?.course?.category === 'string' ? cert?.course?.category : '-')}
                </td>
                <td data-label="Certificate Name">
                  <span className="fw-medium">{cert.name || cert?.course?.title || 'Certificate'}</span>
                </td>
                <td data-label="Date">{cert.date || cert.awardedAt || ''}</td>
                <td className="text-center fw-normal" data-label="Marks">{cert.marks ?? ''}</td>
                <td className="text-center" data-label="Out of">{cert.outOf ?? ''}</td>
                <td data-label="Actions">
                  <div className="action-icons justify-content-end">
                    <a href={MEDIA.url(cert.file || cert.filePath || '') || '#'} target="_blank" rel="noreferrer"><Eye size={18} /></a>
                    <a href={MEDIA.url(cert.file || cert.filePath || '') || '#'} target="_blank" rel="noreferrer" download><Download size={18} /></a>
                  </div>
                </td>
              </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center">
        <small className="text-muted">Showing {Math.min(limit, Math.max(0, total - skip))} of {total}</small>
        <div className="d-flex gap-3 align-items-center">
          {(() => {
            const current = Math.floor(skip / limit) + 1
            const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 10)))
            return (
              <PaginationComp
                page={current}
                totalPages={totalPages}
                onChange={(p) => setSkip((p - 1) * limit)}
              />
            )
          })()}
          <ReactSelect
            className="w-auto"
            value={String(limit)}
            options={[
              { value: '10', label: '10' },
              { value: '20', label: '20' },
              { value: '50', label: '50' },
            ]}
            onChange={(v) => { setSkip(0); setLimit(parseInt(v || '10')); }}
            placeholder="Items per page"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CertificatesTable;
