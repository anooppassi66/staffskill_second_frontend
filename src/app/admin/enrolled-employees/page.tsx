"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ENDPOINTS } from "@/Api";
import MainLoader from '@/app/components/MainLoader';
import PageHeader from "../../components/PageHeader";

const EnrolledEmployeesPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const loadEnrolledEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(ENDPOINTS.ADMIN.ENROLLED_EMPLOYEES, {
        headers: {
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load enrolled employees");
      }
      const data = await res.json().catch(() => ({}));
      setEmployees(data.enrolledEmployees || []);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrolledEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <div className="container-fluid py-4">
        <PageHeader
          title="Enrolled Employees"
          subtitle="View employees and their enrolled courses"
        />

        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th className="text-start" style={{ width: '10%' }}>Sno</th>
                <th className="text-start" style={{ width: '30%' }}>Employee Name</th>
                <th className="text-start" style={{ width: '60%' }}>Courses Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {error && (
                <tr>
                  <td colSpan={3} className="text-danger text-center">{error}</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={3}><MainLoader /></td>
                </tr>
              )}
              {!loading && employees.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center">No enrolled employees found</td>
                </tr>
              )}
              {employees.map((emp, idx) => (
                <tr key={emp._id || idx}>
                  <td className="fw-normal" data-label="Sno">{String(idx + 1).padStart(2, '0')}</td>
                  <td data-label="Employee Name">
                    <span className="fw-medium">
                      {`${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email}
                    </span>
                  </td>
                  <td data-label="Courses Enrolled">
                    {emp.courses?.length > 0 ? emp.courses.join(", ") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EnrolledEmployeesPage;
