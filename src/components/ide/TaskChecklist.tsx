"use client";

import { AgentTask } from "@/lib/agent-planner";
import { TickCircle, CloseCircle, Timer1, ArrowRight2 } from "iconsax-react";

interface TaskChecklistProps {
  tasks: AgentTask[];
  onRetryTask?: (taskId: string) => void;
}

export function TaskChecklist({ tasks, onRetryTask }: TaskChecklistProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="bg-cream-100 rounded-lg border border-cream-300 overflow-hidden mb-4">
      <div className="px-4 py-2 bg-cream-200 border-b border-cream-300 text-xs font-bold text-dusk-700 uppercase tracking-wider flex justify-between items-center">
        <span>Implementation Plan ({tasks.filter(t => t.status === "done").length}/{tasks.length})</span>
      </div>
      <div className="divide-y divide-cream-300">
        {tasks.map((task) => (
          <div key={task.id} className="p-3 text-sm">
            <div className="flex items-start gap-3">
              {/* Status Icon */}
              <div className="mt-0.5 shrink-0">
                {task.status === "done" ? (
                  <TickCircle size={16} variant="Bold" className="text-green-500" />
                ) : task.status === "failed" ? (
                  <CloseCircle size={16} variant="Bold" className="text-red-500" />
                ) : task.status === "running" ? (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-coral-200 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-coral-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Timer1 size={16} variant="Outline" className="text-dusk-400" />
                )}
              </div>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-xs font-semibold text-dusk-900 truncate bg-cream-200 px-1.5 py-0.5 rounded">
                    {task.filename}
                  </span>
                  {task.status === "failed" && onRetryTask && (
                    <button 
                      onClick={() => onRetryTask(task.id)}
                      className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium hover:bg-red-200 transition-colors shrink-0"
                    >
                      Retry
                    </button>
                  )}
                </div>
                <p className="text-dusk-500 text-xs leading-relaxed">
                  {task.description}
                </p>
                
                {/* Error Message */}
                {task.status === "failed" && task.error && (
                  <div className="mt-2 text-[11px] font-mono text-red-500 bg-red-50 p-2 rounded border border-red-100">
                    {task.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
