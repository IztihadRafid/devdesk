export const statusStyles: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  in_progress: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  testing: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  resolved: "bg-green-500/15 text-green-400 border-green-500/30",
  closed: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  reopened: "bg-red-500/15 text-red-400 border-red-500/30",
};

export const severityStyles: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export const priorityStyles: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  low: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};