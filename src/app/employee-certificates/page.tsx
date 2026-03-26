// components/CertificatesTable.tsx
"use client"
import React, { useEffect, useState } from 'react';
import { Eye, Download } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';;
import PageHeader from "../components/PageHeader";
import { ENDPOINTS, MEDIA } from '@/Api';


type CertItem = { _id?: string; name?: string; date?: string; marks?: number; outOf?: number; file?: string; filePath: string; user?: any };



const CertificatesTable: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [items, setItems] = useState<CertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [inProgress, setInProgress] = useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(ENDPOINTS.CERTIFICATES.LIST, {
          headers: {
            ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        });
        if (!res.ok) {
          if (res.status === 404 || res.status === 501 || res.status === 503) {
            setInProgress(true);
          }
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to load certificates');
        }
        const data = await res.json().catch(() => ({}));
        const list = data.certificates || data.items || [];
        setItems(Array.isArray(list) ? list : []);
      } catch (err: any) {
        setError(err.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <PageHeader title="Employee Certificates" subtitle="Certificates by employees" />
      {inProgress && (
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body">
            <div className="fw-semibold">Currently in progress</div>
            <div className="text-muted small">This module API is not available yet.</div>
          </div>
        </div>
      )}
      {/* Table Container (matches the look of the card in the image) */}
      <div className="table-wrapper">
        <table className="user-table">

          {/* Table Header */}
          <thead>
            <tr>
              <th scope="col" className="text-start">Category</th>
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
                <td colSpan={6}>Loading...</td>
              </tr>
            )}
            {items.map((cert: CertItem, idx) => (
              <tr key={cert._id}>
                <td className="fw-normal" data-label="Category">
                  {(cert as any)?.course?.category?.name || (cert as any)?.course?.category?.title || (cert as any)?.course?.category?.category_name || (typeof (cert as any)?.course?.category === 'string' ? (cert as any)?.course?.category : '-')}
                </td>
                <td data-label="Certificate Name">
                  <span className="fw-medium">{cert.name || 'Certificate'}</span>
                </td>
                <td data-label="Date">{cert.date || ''}</td>
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
    </DashboardLayout>
  );
};

export default CertificatesTable;
