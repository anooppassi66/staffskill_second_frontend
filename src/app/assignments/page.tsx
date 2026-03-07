"use client";
import React, { useState } from "react";
import "../styles/assignments.css";
import DashboardLayout from "../components/DashboardLayout";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import ReactSelect from "../components/ui/ReactSelect";
import PageHeader from "../components/PageHeader";

const AssignmentsPage = () => {
  const assignments = [
    {
      title: "Building Your First Landing Page",
      course: "Sketch from A to Z (2024): Become an app designer",
      marks: 80,
      submits: 2,
      status: "Published",
    },
    {
      title: "Building a Basic Angular Application",
      course: "Learn Angular Fundamentals Beginners Guide",
      marks: 60,
      submits: 4,
      status: "Draft",
    },
  ];

  const [newCourse, setNewCourse] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

  };

  return (
    <DashboardLayout>
      <div className="container mt-5 assignments-container">
        <PageHeader
          title="Assignments"
          subtitle="Manage assignments"
          rightContent={
            <button
              className="custom-btn px-4 d-flex align-items-center gap-2 shadow-sm"
              data-bs-toggle="modal"
              data-bs-target="#assesmentModal"
            >
              <PlusCircle size={18} /> Add Assignment
            </button>
          }
        />

        {/* Table */}
        <div className="certificate-table-container">
          <table className="table certificate-table">
            <thead>
              <tr>
                <th className="text-start">Assignment Name</th>
                <th className="text-start">Total Marks</th>
                <th className="text-start">Total Submit</th>
                <th className="text-center">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, i) => (
                <tr key={i} className="assignment-row">
                  <td>
                    <div className="fw-semibold text-dark">{a.title}</div>
                    <div className="text-muted small">Course: {a.course}</div>
                  </td>
                  <td>{a.marks}</td>
                  <td>{a.submits}</td>
                  <td className="text-center">
                    {a.status === "Published" ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle">
                        ● Published
                      </span>
                    ) : (
                      <span className="badge bg-info-subtle text-info border border-info-subtle">
                        ● Draft
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-icons justify-content-end">
                      <button className="custom-btn p-0 me-3"><Pencil size={18} className="text-muted" /></button>
                      <button className="custom-btn p-0"><Trash2 size={18} className="text-muted" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <div
        className="modal fade"
        id="assesmentModal"
        tabIndex={-1}
        aria-labelledby="assesmentModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-sm rounded-4">
            <div className="modal-header border-0 pb-0">
              <h5 className="fw-normal">Add New Assignment</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Course <span className="text-danger">*</span>
                  </label>
                  <ReactSelect
                    value={newCourse}
                    options={[
                      { value: '', label: 'Select' },
                      { value: 'Learn React Fundamentals', label: 'Learn React Fundamentals' },
                      { value: 'Mastering Angular', label: 'Mastering Angular' },
                      { value: 'Python & Java Basics', label: 'Python & Java Basics' },
                    ]}
                    onChange={(v) => setNewCourse(v)}
                    placeholder="Select course"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Assignment Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Assignment Title"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    placeholder="Enter Description"
                    rows={2}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Instructions <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    placeholder="Enter Instructions"
                    rows={2}
                    required
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Last Date <span className="text-danger">*</span>
                    </label>
                    <input type="date" className="form-control" required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Status <span className="text-danger">*</span>
                    </label>
                    <ReactSelect
                      value={newStatus}
                      options={[
                        { value: '', label: 'Select' },
                        { value: 'Published', label: 'Published' },
                        { value: 'Draft', label: 'Draft' },
                      ]}
                      onChange={(v) => setNewStatus(v)}
                      placeholder="Select status"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="custom-btn px-4"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="custom-btn px-4">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentsPage;
