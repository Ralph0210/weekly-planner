"use client"

import { useState, useEffect } from "react"
import { Icons } from "./Icons"

export default function TaskModal({ isOpen, onClose, onSave, task }) {
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [subtasks, setSubtasks] = useState([])
  const [newSubtask, setNewSubtask] = useState("")

  useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDetails(task.details || "")
      setSubtasks(task.subtasks || [])
    } else {
      setTitle("")
      setDetails("")
      setSubtasks([])
    }
    setNewSubtask("")
  }, [task, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      id: task?.id || crypto.randomUUID(),
      title: title.trim(),
      details: details.trim(),
      subtasks,
      completed: task?.completed || false,
    })
    onClose()
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    setSubtasks([
      ...subtasks,
      { id: crypto.randomUUID(), text: newSubtask.trim(), completed: false },
    ])
    setNewSubtask("")
  }

  const updateSubtask = (id, text) => {
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, text } : s)))
  }

  const removeSubtask = (id) => {
    setSubtasks(subtasks.filter((s) => s.id !== id))
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSubtask()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{task ? "Edit Task" : "New Task"}</h2>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Task</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you want to accomplish?"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add any details..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subtasks</label>
              {subtasks.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="subtask-item"
                      style={{
                        padding: "0.5rem",
                        background: "var(--bg-muted)",
                        borderRadius: "6px",
                      }}
                    >
                      <input
                        type="text"
                        className="inline-edit"
                        value={subtask.text}
                        onChange={(e) =>
                          updateSubtask(subtask.id, e.target.value)
                        }
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-icon"
                        onClick={() => removeSubtask(subtask.id)}
                      >
                        <Icons.X />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="subtask-input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a subtask..."
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addSubtask}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim()}
            >
              {task ? "Save" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
