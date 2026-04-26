"use client";

import { IJob } from "@/types";
import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function timeUntil(dateStr: string): { label: string; urgent: boolean } {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return { label: "Expired", urgent: true };
  const days = Math.floor(diff / 86400000);
  if (days === 0) return { label: "Ends today", urgent: true };
  if (days <= 3) return { label: `${days}d left`, urgent: true };
  if (days <= 7) return { label: `${days}d left`, urgent: false };
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return { label: `${weeks}w left`, urgent: false };
  return { label: `${Math.floor(days / 30)}mo left`, urgent: false };
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="job-card skeleton-card">
      <div
        className="skeleton-line"
        style={{ width: "60%", height: "22px", marginBottom: "12px" }}
      />
      <div
        className="skeleton-line"
        style={{ width: "35%", height: "14px", marginBottom: "20px" }}
      />
      <div
        className="skeleton-line"
        style={{ width: "80%", height: "14px", marginBottom: "8px" }}
      />
      <div
        className="skeleton-line"
        style={{ width: "70%", height: "14px", marginBottom: "8px" }}
      />
      <div className="skeleton-line" style={{ width: "50%", height: "14px" }} />
    </div>
  );
}

// ─── Job Card ──────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: IJob }) {
  const [expanded, setExpanded] = useState(false);
  const a = job.attributes;

  const company = a.companyProfile?.data?.attributes;
  const currency = a.salaryCurrency?.data?.attributes?.name;
  const timeUnit = a.salaryTimeUnit?.data?.attributes?.name;
  const regions =
    a.onlineAdProducts?.data?.map((p) => p.attributes?.name).filter(Boolean) ??
    [];
  const deadline = a.endsAt ? timeUntil(a.endsAt) : null;
  const posted = a.releasedAt ? timeAgo(a.releasedAt) : null;

  const companyName = company?.name || "Unknown Company";
  const location = company
    ? [company.addressCity, company.addressZip].filter(Boolean).join(" ") ||
      company.addressStreet
    : null;

  return (
    <article className={`job-card ${expanded ? "expanded" : ""}`}>
      {/* Header row */}
      <div className="card-header">
        <div className="company-avatar">
          {company?.logo?.data ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo.data?.attributes?.url} alt={companyName} />
          ) : (
            <span>{initials(companyName)}</span>
          )}
        </div>

        <div className="card-meta">
          <div className="meta-top">
            <span className="company-name">{companyName}</span>
            {posted && <span className="posted-time">{posted}</span>}
          </div>
          <h2 className="job-title">{a.title}</h2>
        </div>

        {deadline && (
          <div className={`deadline-badge ${deadline.urgent ? "urgent" : ""}`}>
            {deadline.label}
          </div>
        )}
      </div>

      {/* Chips row */}
      <div className="chips-row">
        {a.salaryAmount > 0 && currency && (
          <span className="chip chip-salary">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15" />
            </svg>
            {a.salaryAmount.toLocaleString()} {currency}
            {timeUnit && ` / ${timeUnit}`}
          </span>
        )}
        {a.remoteRate > 0 && (
          <span className="chip chip-remote">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            {a.remoteRate}% remote
          </span>
        )}
        {location && (
          <span className="chip chip-location">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {location}
          </span>
        )}
        {regions.slice(0, 2).map((r, i) => (
          <span key={i} className="chip chip-region">
            {r}
          </span>
        ))}
        {regions.length > 2 && (
          <span className="chip chip-more">+{regions.length - 2}</span>
        )}
      </div>

      {/* Contact row */}
      <div className="contact-row">
        {a.contactEmail && (
          <a href={`mailto:${a.contactEmail}`} className="contact-link">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            {a.contactEmail}
          </a>
        )}
        {a.contactPhone && (
          <a href={`tel:${a.contactPhone}`} className="contact-link">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
            </svg>
            {a.contactPhone}
          </a>
        )}
        {a.applicationMethod === "forward" ? (
          <>
            <a
              href={a.applicationTarget}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link apply-link"
            >
              Apply →
            </a>
            <a
              href={a.applicationTarget}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Website
            </a>
          </>
        ) : (
          <a
            href={`mailto:${a.contactEmail}?subject=${encodeURIComponent(`Application for: ${a.title}`)}`}
            className="contact-link apply-link"
          >
            Apply →
          </a>
        )}
      </div>

      {/* Description toggle */}
      {a.description && (
        <>
          <div className={`description-body ${expanded ? "open" : ""}`}>
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: a.description }}
            />
            {a.qualification && (
              <div className="qualification-block">
                <h4 className="section-label">Qualifications</h4>
                <div
                  className="prose-content"
                  dangerouslySetInnerHTML={{ __html: a.qualification }}
                />
              </div>
            )}
          </div>
          <button className="toggle-btn" onClick={() => setExpanded((v) => !v)}>
            {expanded ? (
              <>
                Show less{" "}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </>
            ) : (
              <>
                Read more{" "}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </>
            )}
          </button>
        </>
      )}

      {/* Footer */}
      <div className="card-footer">
        <span className="footer-date">
          Posted{" "}
          {a.releasedAt
            ? new Date(a.releasedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
        {a.endsAt && (
          <span className="footer-date">
            Deadline{" "}
            {new Date(a.endsAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>
    </article>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const router = useRouter();
  const params = use(searchParams);

  const LIMIT = 12;
  const pageParam = params.page;
  const initialPage = pageParam ? parseInt(pageParam) : 1;

  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState<number | null>(null);

  const getApiUrl = (p: number) =>
    `https://api.stellenwerk.production.uhhmg.cloud/api/v1/jobs?populate%5B0%5D=companyProfile.logo&sort[0]=releasedAt:desc&pagination[limit]=${LIMIT}&pagination[start]=${(p - 1) * LIMIT}`;

  useEffect(() => {
    router.push(`?page=${page}`, { scroll: false });
  }, [page, router]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const res = await fetch(getApiUrl(page));
      const data = await res.json();
      setJobs(data.data || []);
      setTotal(data.meta?.pagination?.total ?? null);
      setLoading(false);
    };
    fetchJobs();
  }, [page]);

  const totalPages = total !== null ? Math.ceil(total / LIMIT) : null;

  return (
    <Suspense fallback={<div className="jobs-page">Loading...</div>}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0d0f12;
          --surface: #13161b;
          --surface2: #1a1e25;
          --border: rgba(255,255,255,0.06);
          --border-hover: rgba(255,255,255,0.13);
          --text: #e8eaed;
          --text-2: #8b9099;
          --text-3: #555b65;
          --accent: #6ee7b7;
          --accent-dim: rgba(110,231,183,0.12);
          --accent-salary: #fbbf24;
          --accent-salary-dim: rgba(251,191,36,0.1);
          --accent-remote: #60a5fa;
          --accent-remote-dim: rgba(96,165,250,0.1);
          --accent-location: #f472b6;
          --accent-location-dim: rgba(244,114,182,0.1);
          --urgent: #f87171;
          --urgent-dim: rgba(248,113,113,0.12);
          --radius: 14px;
          --transition: 0.2s ease;
        }

        body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

        .jobs-page {
          min-height: 100vh;
          background: var(--bg);
          padding: 0 0 80px;
        }

        /* ── Hero header ── */
        .page-hero {
          padding: 56px 24px 40px;
          max-width: 880px;
          margin: 0 auto;
        }
        .page-eyebrow {
          font-family: 'ClashDisplay-Variable', 'Clash Display', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 12px;
        }
        .page-title {
          font-family: 'ClashDisplay-Variable', 'Clash Display', sans-serif;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 800;
          color: var(--text);
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .page-subtitle {
          color: var(--text-2);
          font-size: 15px;
          font-weight: 300;
        }
        .page-subtitle strong { color: var(--text); font-weight: 500; }

        /* ── Card list ── */
        .jobs-list {
          max-width: 880px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ── Job card ── */
        .job-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          transition: border-color var(--transition), transform var(--transition), box-shadow var(--transition);
          animation: fadeUp 0.35s ease both;
        }
        .job-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.35);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* stagger */
        .job-card:nth-child(1)  { animation-delay: 0.04s }
        .job-card:nth-child(2)  { animation-delay: 0.07s }
        .job-card:nth-child(3)  { animation-delay: 0.10s }
        .job-card:nth-child(4)  { animation-delay: 0.13s }
        .job-card:nth-child(5)  { animation-delay: 0.16s }
        .job-card:nth-child(6)  { animation-delay: 0.19s }
        .job-card:nth-child(7)  { animation-delay: 0.22s }
        .job-card:nth-child(8)  { animation-delay: 0.25s }
        .job-card:nth-child(9)  { animation-delay: 0.28s }
        .job-card:nth-child(10) { animation-delay: 0.31s }
        .job-card:nth-child(11) { animation-delay: 0.34s }
        .job-card:nth-child(12) { animation-delay: 0.37s }

        /* ── Card header ── */
        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 16px;
        }
        .company-avatar {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--surface2);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'ClashDisplay-Variable', 'Clash Display', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: var(--text-2);
          overflow: hidden;
        }
        .company-avatar img { width: 100%; height: 100%; object-fit: contain; }
        .card-meta { flex: 1; min-width: 0; }
        .meta-top {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .company-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-2);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .posted-time {
          font-size: 11px;
          color: var(--text-3);
        }
        .job-title {
          font-family: 'ClashDisplay-Variable', 'Clash Display', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.02em;
          line-height: 1.3;
        }
        .deadline-badge {
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 9px;
          border-radius: 20px;
          background: var(--accent-dim);
          color: var(--accent);
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
        .deadline-badge.urgent {
          background: var(--urgent-dim);
          color: var(--urgent);
        }

        /* ── Chips ── */
        .chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 14px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .chip-salary   { background: var(--accent-salary-dim);  color: var(--accent-salary); }
        .chip-remote   { background: var(--accent-remote-dim);   color: var(--accent-remote); }
        .chip-location { background: var(--accent-location-dim); color: var(--accent-location); }
        .chip-region   { background: var(--surface2); color: var(--text-2); border: 1px solid var(--border); }
        .chip-more     { background: var(--surface2); color: var(--text-3); border: 1px solid var(--border); font-size: 11px; }

        /* ── Contact row ── */
        .contact-row {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 14px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border);
        }
        .contact-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--text-2);
          text-decoration: none;
          transition: color var(--transition);
        }
        .contact-link:hover { color: var(--accent); }
        .apply-link {
          color: var(--accent) !important;
          font-weight: 600;
          margin-left: auto;
        }

        /* ── Description ── */
        .description-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
        }
        .description-body.open {
          max-height: 2000px;
        }

        .prose-content {
          font-size: 13.5px;
          line-height: 1.7;
          color: var(--text-2);
          padding: 12px 0 4px;
        }
        .prose-content p  { margin-bottom: 8px; }
        .prose-content ul, .prose-content ol { padding-left: 20px; margin-bottom: 8px; }
        .prose-content li { margin-bottom: 4px; }
        .prose-content strong, .prose-content b { color: var(--text); font-weight: 500; }
        .prose-content h1, .prose-content h2, .prose-content h3 {
          font-family: 'ClashDisplay-Variable', 'Clash Display', sans-serif;
          color: var(--text);
          font-size: 14px;
          font-weight: 700;
          margin: 16px 0 6px;
        }
        .qualification-block { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
        .section-label {
          font-family: 'ClashDisplay-Variable', 'Clash Display', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 6px;
        }

        /* ── Toggle button ── */
        .toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 10px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface2);
          color: var(--text-2);
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color var(--transition), color var(--transition);
        }
        .toggle-btn:hover { border-color: var(--border-hover); color: var(--text); }

        /* ── Card footer ── */
        .card-footer {
          display: flex;
          gap: 16px;
          margin-top: 14px;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }
        .footer-date {
          font-size: 11px;
          color: var(--text-3);
        }

        /* ── Skeleton ── */
        .skeleton-card { pointer-events: none; }
        .skeleton-line {
          border-radius: 6px;
          background: linear-gradient(90deg, var(--surface2) 25%, var(--surface) 50%, var(--surface2) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Pagination ── */
        .pagination {
          max-width: 880px;
          margin: 40px auto 0;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .page-btn {
          height: 38px;
          min-width: 38px;
          padding: 0 14px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-2);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .page-btn:hover:not(:disabled) {
          border-color: var(--border-hover);
          color: var(--text);
          background: var(--surface2);
        }
        .page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .page-btn.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #0d0f12;
          font-weight: 700;
        }
        .page-info {
          font-size: 12px;
          color: var(--text-3);
          padding: 0 4px;
        }

        /* ── Empty state ── */
        .empty-state {
          text-align: center;
          padding: 80px 24px;
          color: var(--text-3);
          font-size: 15px;
        }
        .empty-state svg { opacity: 0.2; margin-bottom: 16px; }

        @media (max-width: 600px) {
          .page-hero { padding: 36px 16px 28px; }
          .jobs-list  { padding: 0 16px; }
          .pagination { padding: 0 16px; }
          .job-title  { font-size: 15px; }
          .card-header { gap: 10px; }
        }
      `}</style>

      <main className="jobs-page">
        <header className="page-hero">
          <p className="page-eyebrow">Stellenwerk</p>
          <h1 className="page-title">Job Listings</h1>
          <p className="page-subtitle">
            {total !== null ? (
              <>
                <strong>{total.toLocaleString()}</strong> open positions · Page{" "}
                {page}
                {totalPages ? ` of ${totalPages}` : ""}
              </>
            ) : (
              "Browse open positions"
            )}
          </p>
        </header>

        <div className="jobs-list">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              <p>No jobs found on this page.</p>
            </div>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>

        {!loading && (
          <nav className="pagination">
            <button
              className="page-btn"
              onClick={() => setPage(1)}
              disabled={page === 1}
              title="First page"
            >
              «
            </button>
            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Prev
            </button>

            <span className="page-info">
              Page {page}
              {totalPages ? ` / ${totalPages}` : ""}
            </span>

            <button
              className="page-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={totalPages !== null && page >= totalPages}
            >
              Next
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

            {totalPages && (
              <button
                className="page-btn"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                title="Last page"
              >
                »
              </button>
            )}
          </nav>
        )}
      </main>
    </Suspense>
  );
}
