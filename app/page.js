"use client"

import { useState, useEffect, useCallback } from "react"
import TaskPanel from "./components/TaskPanel"
import { Icons } from "./components/Icons"

function getWeekKey(date) {
  const d = new Date(date)
  const dayOfWeek = d.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  return monday.toISOString().split("T")[0]
}

function getWeekDates(weekOffset = 0) {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const monday = new Date(today)
  monday.setDate(today.getDate() + diff + weekOffset * 7)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const format = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return {
    key: monday.toISOString().split("T")[0],
    range: `${format(monday)} – ${format(sunday)}`,
    isCurrent: weekOffset === 0,
  }
}

const STORAGE_KEY = "weekly-planner-tasks-v2"

export default function Home() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [allTasks, setAllTasks] = useState({})
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const weekInfo = getWeekDates(weekOffset)
  const tasks = allTasks[weekInfo.key] || []

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setAllTasks(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Failed to load tasks:", e)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allTasks))
      } catch (e) {
        console.error("Failed to save tasks:", e)
      }
    }
  }, [allTasks, isLoaded])

  const changeWeek = (direction) => {
    setTransitioning(true)
    setTimeout(() => {
      setWeekOffset((prev) => prev + direction)
      setTransitioning(false)
    }, 150)
  }

  const handleAddTask = useCallback(() => {
    setEditingTask(null)
    setPanelOpen(true)
  }, [])

  const handleEditTask = useCallback((task) => {
    setEditingTask(task)
    setPanelOpen(true)
  }, [])

  const handleSaveTask = useCallback(
    (task) => {
      setAllTasks((prev) => {
        const weekTasks = prev[weekInfo.key] || []
        const existingIndex = weekTasks.findIndex((t) => t.id === task.id)

        let updatedWeekTasks
        if (existingIndex >= 0) {
          updatedWeekTasks = [...weekTasks]
          updatedWeekTasks[existingIndex] = task
        } else {
          updatedWeekTasks = [...weekTasks, task]
        }

        return { ...prev, [weekInfo.key]: updatedWeekTasks }
      })
    },
    [weekInfo.key],
  )

  const handleToggleComplete = useCallback(
    (taskId) => {
      setAllTasks((prev) => {
        const weekTasks = prev[weekInfo.key] || []
        return {
          ...prev,
          [weekInfo.key]: weekTasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t,
          ),
        }
      })
    },
    [weekInfo.key],
  )

  const handleToggleSubtask = useCallback(
    (taskId, subtaskId) => {
      setAllTasks((prev) => {
        const weekTasks = prev[weekInfo.key] || []
        return {
          ...prev,
          [weekInfo.key]: weekTasks.map((t) => {
            if (t.id !== taskId) return t
            return {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s,
              ),
            }
          }),
        }
      })
    },
    [weekInfo.key],
  )

  const handleRemoveSubtask = useCallback(
    (taskId, subtaskId) => {
      setAllTasks((prev) => {
        const weekTasks = prev[weekInfo.key] || []
        return {
          ...prev,
          [weekInfo.key]: weekTasks.map((t) => {
            if (t.id !== taskId) return t
            return {
              ...t,
              subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
            }
          }),
        }
      })
    },
    [weekInfo.key],
  )

  const handleDeleteTask = useCallback(
    (taskId) => {
      setAllTasks((prev) => {
        const weekTasks = prev[weekInfo.key] || []
        return {
          ...prev,
          [weekInfo.key]: weekTasks.filter((t) => t.id !== taskId),
        }
      })
    },
    [weekInfo.key],
  )

  const closePanel = useCallback(() => {
    setPanelOpen(false)
    setEditingTask(null)
  }, [])

  if (!isLoaded) {
    return (
      <div className="app-container">
        <div className="header">
          <h1>This Week</h1>
          <p className="week-info">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Weekly Tasks</h1>
        <div className="week-nav">
          <button
            className="week-nav-btn"
            onClick={() => changeWeek(-1)}
            title="Previous week"
          >
            <Icons.ChevronLeft />
          </button>
          <span className={`week-info ${weekInfo.isCurrent ? "current" : ""}`}>
            {weekInfo.isCurrent ? "This Week" : weekInfo.range}
          </span>
          <button
            className="week-nav-btn"
            onClick={() => changeWeek(1)}
            title="Next week"
          >
            <Icons.ChevronRight />
          </button>
        </div>
      </header>

      <div className={`tasks-list ${transitioning ? "transitioning" : ""}`}>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Icons.Clipboard />
            </div>
            <p className="empty-state-text">
              {weekInfo.isCurrent
                ? "No tasks for this week"
                : `No tasks for ${weekInfo.range}`}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={() => handleToggleComplete(task.id)}
              onToggleSubtask={(subtaskId) =>
                handleToggleSubtask(task.id, subtaskId)
              }
              onRemoveSubtask={(subtaskId) =>
                handleRemoveSubtask(task.id, subtaskId)
              }
              onEdit={() => handleEditTask(task)}
              onDelete={() => handleDeleteTask(task.id)}
            />
          ))
        )}
      </div>

      <button className="add-task-btn" onClick={handleAddTask}>
        <Icons.Plus /> Add Task
      </button>

      <TaskPanel
        isOpen={panelOpen}
        onClose={closePanel}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  )
}

function TaskCard({
  task,
  onToggleComplete,
  onToggleSubtask,
  onRemoveSubtask,
  onEdit,
  onDelete,
}) {
  return (
    <div className={`task-card ${task.completed ? "completed" : ""}`}>
      <div className="task-header">
        <div
          className={`task-checkbox ${task.completed ? "checked" : ""}`}
          onClick={onToggleComplete}
        >
          {task.completed && <Icons.Check />}
        </div>
        <div className="task-content">
          <div className="task-title">{task.title}</div>
          {task.details && (
            <div
              className="task-details"
              dangerouslySetInnerHTML={{
                __html: task.details
                  .replace(/<[^>]*>/g, " ")
                  .replace(/\s+/g, " ")
                  .trim(),
              }}
            />
          )}
        </div>
        <div className="task-actions">
          <button
            className="btn btn-ghost btn-icon"
            onClick={onEdit}
            title="Edit"
          >
            <Icons.Edit />
          </button>
          <button
            className="btn btn-danger btn-icon"
            onClick={onDelete}
            title="Delete"
          >
            <Icons.Trash />
          </button>
        </div>
      </div>

      {task.subtasks?.length > 0 && (
        <div className="subtasks-list">
          {task.subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={`subtask-item ${subtask.completed ? "completed" : ""}`}
            >
              <div
                className={`subtask-checkbox ${subtask.completed ? "checked" : ""}`}
                onClick={() => onToggleSubtask(subtask.id)}
              >
                {subtask.completed && <Icons.Check />}
              </div>
              <span className="subtask-text">{subtask.text}</span>
              <button
                className="btn btn-danger btn-icon subtask-remove"
                onClick={() => onRemoveSubtask(subtask.id)}
              >
                <Icons.X />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
