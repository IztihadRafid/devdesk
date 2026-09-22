import {
  statusStyles,
  severityStyles,
  priorityStyles,
} from "@/lib/badge-styles";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[status] || ""}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${severityStyles[severity] || ""}`}
    >
      {severity}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${priorityStyles[priority] || ""}`}
    >
      {priority}
    </span>
  );
}
