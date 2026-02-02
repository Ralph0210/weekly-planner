"use client"

import { useState, useEffect, useRef } from "react"
import { Icons } from "./Icons"
import RichTextEditor from "./RichTextEditor"

export default function TaskPanel({ isOpen, onClose, onSave, task }) {
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [subtasks, setSubtasks] = useState([])
  const [comments, setComments] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false)
  const titleRef = useRef(null)

  useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDetails(task.details || "")
      setSubtasks(task.subtasks || [])
      setComments(task.comments || [])
    } else {
      setTitle("")
      setDetails("")
      setSubtasks([])
      setComments([])
    }
  }, [task, isOpen])

  useEffect(() => {
    if (isOpen && titleRef.current) {
      // Only focus if we're opening a new/empty task, or just always on open?
      // User complaint was about focus being stolen WHILE typing subtask.
      // So ensuring this only runs on mount/open is key.
      titleRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    // Auto-resize all subtask description textareas when subtasks change
    if (isOpen) {
      setTimeout(() => {
        const textareas = document.querySelectorAll(
          ".panel-subtask-description",
        )
        textareas.forEach((textarea) => {
          textarea.style.height = "auto"
          textarea.style.height = textarea.scrollHeight + "px"
        })
      }, 0)
    }
  }, [isOpen, subtasks])

  if (!isOpen) return null

  const handleSave = () => {
    if (!title.trim()) return
    // Filter out empty subtasks (no text)
    const validSubtasks = subtasks.filter((s) => s.text.trim())
    onSave({
      id: task?.id || crypto.randomUUID(),
      title: title.trim(),
      details: details.trim(),
      subtasks: validSubtasks,
      comments,
      completed: task?.completed || false,
    })
    onClose()
  }

  const addSubtask = () => {
    setSubtasks([
      ...subtasks,
      { id: crypto.randomUUID(), text: "", description: "", completed: false },
    ])
  }

  const updateSubtask = (id, text) => {
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, text } : s)))
  }

  const updateSubtaskDescription = (id, description) => {
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, description } : s)))
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

  const autoResize = (e) => {
    e.target.style.height = "auto"
    e.target.style.height = e.target.scrollHeight + "px"
  }

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className={`panel ${isExpanded ? "panel-expanded" : ""}`}>
        <div className="panel-header">
          <div className="panel-header-actions">
            {comments.length > 0 && (
              <button
                className={`panel-action-btn ${showCommentsSidebar ? "active" : ""}`}
                onClick={() => setShowCommentsSidebar(!showCommentsSidebar)}
                title="Toggle comments"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="comment-badge">{comments.length}</span>
              </button>
            )}
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
          <div
            className={`panel-document ${showCommentsSidebar ? "with-sidebar" : ""}`}
          >
            <input
              ref={titleRef}
              type="text"
              className="panel-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name"
            />

            <RichTextEditor
              value={details}
              onChange={setDetails}
              placeholder="Add notes..."
              comments={comments}
              onCommentsChange={setComments}
              showCommentsSidebar={showCommentsSidebar}
              onToggleSidebar={setShowCommentsSidebar}
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
                    <div className="panel-subtask-header">
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
                    <textarea
                      className="panel-subtask-description"
                      value={subtask.description || ""}
                      onChange={(e) => {
                        updateSubtaskDescription(subtask.id, e.target.value)
                        autoResize(e)
                      }}
                      onInput={autoResize}
                      placeholder="Add description..."
                      rows={1}
                    />
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
