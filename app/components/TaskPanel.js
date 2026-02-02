"use client"

import { useState, useEffect, useRef } from "react"
import { Icons } from "./Icons"

export default function TaskPanel({ isOpen, onClose, onSave, task }) {
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [subtasks, setSubtasks] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const titleRef = useRef(null)

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
  }, [task, isOpen])

  useEffect(() => {
    if (isOpen && titleRef.current) {
      titleRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = () => {
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
    setSubtasks([
      ...subtasks,
      { id: crypto.randomUUID(), text: "", completed: false },
    ])
  }

  const updateSubtask = (id, text) => {
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, text } : s)))
  }

  const toggleSubtask = (id) => {
    setSubtasks(
      subtasks.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s,
      ),
    )
  }

  const removeSubtask = (id) => {
    setSubtasks(subtasks.filter((s) => s.id !== id))
  }

  const handleSubtaskKeyDown = (e, id) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSubtask()
    } else if (e.key === "Backspace" && e.target.value === "") {
      e.preventDefault()
      removeSubtask(id)
    }
  }

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className={`panel ${isExpanded ? "panel-expanded" : ""}`}>
        <div className="panel-header">
          <div className="panel-header-actions">
            <button
              className="panel-action-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Icons.Minimize /> : <Icons.Expand />}
            </button>
            <button
              className="panel-action-btn"
              onClick={onClose}
              title="Close"
            >
              <Icons.X />
            </button>
          </div>
        </div>

        <div className="panel-content">
          <div className="panel-document">
            <input
              ref={titleRef}
              type="text"
              className="panel-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name"
            />

            <textarea
              className="panel-description"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add notes..."
              rows={3}
            />

            <div className="panel-section">
              <div className="panel-section-header">
                <span className="panel-section-title">Subtasks</span>
              </div>

              <div className="panel-subtasks">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className={`panel-subtask ${subtask.completed ? "completed" : ""}`}
                  >
                    <div
                      className={`panel-subtask-checkbox ${subtask.completed ? "checked" : ""}`}
                      onClick={() => toggleSubtask(subtask.id)}
                    >
                      {subtask.completed && <Icons.Check />}
                    </div>
                    <input
                      type="text"
                      className="panel-subtask-input"
                      value={subtask.text}
                      onChange={(e) =>
                        updateSubtask(subtask.id, e.target.value)
                      }
                      onKeyDown={(e) => handleSubtaskKeyDown(e, subtask.id)}
                      placeholder="Subtask..."
                    />
                    <button
                      className="panel-subtask-remove"
                      onClick={() => removeSubtask(subtask.id)}
                    >
                      <Icons.X />
                    </button>
                  </div>
                ))}

                <button className="panel-add-subtask" onClick={addSubtask}>
                  <Icons.Plus />
                  <span>Add subtask</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="panel-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            {task ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </>
  )
}
