import { useState } from 'react'
import type { Task } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'

interface TaskSelectorProps {
  tasks: Task[] | undefined
  activeTaskId: string | null
  setActiveTask: (taskId: string | null) => void
}

export function TaskSelector({ tasks, activeTaskId, setActiveTask }: TaskSelectorProps) {
  const [isSelectTaskOpen, setIsSelectTaskOpen] = useState(false)

  const activeTask = tasks?.find(t => t.id === activeTaskId)
  const pendingTasks = tasks?.filter(t => t.status === 'pending' && t.id !== activeTaskId) || []

  return (
    <>
      <div className="w-full max-w-md bg-surface_container border border-outline/10 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <span className="font-label text-xs text-on_surface_variant uppercase tracking-wider">Active Task</span>
          <button
            onClick={() => { setIsSelectTaskOpen(true); }}
            className="text-xs text-secondary font-bold hover:glow-secondary transition-all"
          >
            Change Task
          </button>
        </div>

        {activeTask ? (
          <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_10px_rgba(255,45,120,0.1)]">
              <span className="text-xl">🍅</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-on_surface font-headline truncate">{activeTask.name}</span>
              <span className="text-xs text-primary font-bold uppercase tracking-widest">
                {activeTask.realPomodoros} / {activeTask.estimatedPomodoros} Pomodoros
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-on_surface_variant/40 italic">
            <div className="w-12 h-12 rounded-xl bg-surface_variant border border-outline/5 flex items-center justify-center grayscale">
              <span className="text-xl">🍅</span>
            </div>
            <span>Select a task to stay focused...</span>
          </div>
        )}
      </div>

      <Dialog open={isSelectTaskOpen} onOpenChange={setIsSelectTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Focus Task</DialogTitle>
            <DialogDescription>Which task are you working on right now?</DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto space-y-2 py-4 px-1">
            {pendingTasks.length > 0 ? (
              pendingTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => {
                    setActiveTask(task.id)
                    setIsSelectTaskOpen(false)
                  }}
                  className="w-full text-left bg-surface_variant hover:bg-surface_container_high p-4 rounded-xl border border-outline/5 transition-colors group"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-headline font-bold text-on_surface group-hover:text-primary transition-colors">{task.name}</span>
                    <span className="text-xs font-label text-on_surface_variant">{task.estimatedPomodoros} 🍅</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-10 text-on_surface_variant italic">No pending tasks found.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
