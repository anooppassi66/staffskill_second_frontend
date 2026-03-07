"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { useParams, useRouter } from "next/navigation";
import { ENDPOINTS, MEDIA } from "@/Api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import MainLoader from "@/app/components/MainLoader";
import { toast } from "react-toastify";
import PageHeader from "@/app/components/PageHeader";
import { Eye, Download } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface Result {
  score?: number;
  total?: number;
  passed?: boolean;
}

export default function AttemptQuizPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useSelector((s: RootState) => s.user);

  const id = params?.id ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [checkingResult, setCheckingResult] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const loadQuiz = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(ENDPOINTS.QUIZ.GET(id), {
          headers: {
            ...(user.token && {
              Authorization: `Bearer ${user.token}`,
            }),
          },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to load quiz");
        }

        const data = await res.json();

        const normalized: Question[] = (data?.questions || []).map((q: any) => ({
          id: q?._id ?? "",
          text: q?.text || q?.question || "",
          options: (q?.options || q?.choices || [])
            .map((o: any) => (typeof o === "string" ? o : o?.text))
            .filter(Boolean),
        }));

        setQuiz(data.quiz ?? data);
        setQuestions(normalized);
        setAnswers(new Array(normalized.length).fill(-1));
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [id, user.token]);

  const setAnswer = (qIdx: number, optIdx: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  };

  const submitAttempt = async () => {
    if (!id) return;

    let toastId: any;
    setSubmitting(true);
    setCheckingResult(true);

    try {
      toastId = toast.loading("Submitting attempt...");

      const payload = {
        answers: questions.map((q, idx) => ({
          questionId: q.id,
          answerIndex: answers[idx],
        })),
      };

      const res = await fetch(ENDPOINTS.QUIZ.ATTEMPT(id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user.token && {
            Authorization: `Bearer ${user.token}`,
          }),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to submit attempt");
      }

      const data = await res.json();
      setCheckingResult(false);

      const summary: Result = {
        score: data.score,
        total: data.total ?? data.totalMarks,
        passed: Boolean(data.passed),
      };

      setResult(summary);
      setCertificate(data.certificate || data.cert || null);

      toast.update(toastId, {
        render: data.message || (summary.passed ? "Passed - Generating certificate..." : "Submitted"),
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });

    } catch (err: any) {
      setCheckingResult(false);
      if (toastId) {
        toast.update(toastId, {
          render: err.message || "Submission failed",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-4">
        <PageHeader
          title={quiz?.title || "Quiz"}
          subtitle={`${questions.length} Questions`}
          rightContent={
            <div className="d-flex align-items-center gap-2">
              <button
                className="custom-btn"
                onClick={() => router.push("/quiz")}
              >
                Back
              </button>
            </div>
          }
        />

        {loading && <MainLoader />}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {!loading && !error && questions.length > 0 && (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {questions.map((q, qIdx) => (
                <div key={q.id || qIdx} className="mb-3">
                  <div className="fw-medium mb-2">
                    Q{qIdx + 1}. {q.text}
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {q.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className="d-flex align-items-center gap-2"
                      >
                        <input
                          type="radio"
                          name={`q-${qIdx}`}
                          checked={answers[qIdx] === oIdx}
                          onChange={() => setAnswer(qIdx, oIdx)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="d-flex justify-content-end mt-3">
                <button
                  className="custom-btn"
                  disabled={submitting}
                  onClick={submitAttempt}
                >
                  {submitting ? "Submitting..." : "Submit Answers"}
                </button>
              </div>
            </div>
          </div>
        )}

        {checkingResult && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
            <div className="text-white text-center">
              <div className="spinner-border text-light mb-2" role="status">
                <span className="visually-hidden">Checking result...</span>
              </div>
              <p className="mb-0">Checking your quiz result...</p>
            </div>
          </div>
        )}

        {result && (
          <div className="alert alert-info mt-3">
            <div>
              Score: {result.score ?? "-"} / {result.total ?? "-"}
            </div>
            <div>
              Status: {result.passed ? "Passed" : "Submitted"}
            </div>
          </div>
        )}

        {result && certificate && result.passed && (
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <div className="fw-medium">Certificate generated</div>
                <div className="text-muted small">You can view or download your certificate</div>
              </div>
              <div className="action-icons d-flex gap-2">
                <a
                  href={MEDIA.url((certificate && (certificate.file || certificate.url || certificate.path)) || "") || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-link p-0"
                >
                  <Eye size={18} />
                </a>
                <a
                  href={MEDIA.url((certificate && (certificate.file || certificate.url || certificate.path)) || "") || "#"}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="btn btn-link p-0"
                >
                  <Download size={18} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
