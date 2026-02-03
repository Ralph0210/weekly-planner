"use client"

import { useState, useEffect, useRef } from "react"
import { Icons } from "./Icons"
import RichTextEditor from "./RichTextEditor"
import {
  SimpleListSection,
  TimelineSection,
  ProcessDeckSection,
  SectionSelector,
} from "./TaskSections"

export default function TaskPanel({ isOpen, onClose, onSave, task }) {
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [sections, setSections] = useState([])
  const [comments, setComments] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false)
  const titleRef = useRef(null)

  useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDetails(task.details || "")
      setComments(task.comments || [])

      // Initialize Sections
      if (task.sections && task.sections.length > 0) {
        setSections(task.sections)
      } else if (task.subtasks && task.subtasks.length > 0) {
        // Migration: Wrap existing subtasks in a Default Section
        setSections([
          {
            id: crypto.randomUUID(),
            type: "simple-list",
            title: "Subtasks",
            items: task.subtasks,
          },
        ])
      } else {
        setSections([])
      }
    } else {
      setTitle("")
      setDetails("")
      setSections([])
      setComments([])
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

    // Backward Compatibility: Flatten all section items into `subtasks`
    // This ensures progress bars on cards still work without refactoring the whole app.
    const allSubtasks = sections.flatMap((section) => section.items)

    onSave({
      id: task?.id || crypto.randomUUID(),
      title: title.trim(),
      details: details.trim(),
      sections, // Save the structural data
      subtasks: allSubtasks, // Save flattened list for legacy compatibility
      comments,
      completed: task?.completed || false,
    })
    onClose()
  }

  // --- Section Management ---

  const addSection = (type) => {
    const newSection = {
      id: crypto.randomUUID(),
      type,
      title:
        type === "timeline"
          ? "Timeline"
          : type === "process-deck"
            ? "Process Deck"
            : "Subtasks",
      items: [],
    }
    setSections([...sections, newSection])
  }

  const removeSection = (id) => {
    setSections(sections.filter((s) => s.id !== id))
  }

  const updateSectionItems = (id, newItems) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, items: newItems } : s)),
    )
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
            style={{ paddingBottom: "100px" }}
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

            <div className="sections-container">
              {sections.map((section) => {
                if (section.type === "simple-list") {
                  return (
                    <SimpleListSection
                      key={section.id}
                      items={section.items}
                      onUpdate={(items) =>
                        updateSectionItems(section.id, items)
                      }
                      onRemoveSection={() => removeSection(section.id)}
                    />
                  )
                }
                if (section.type === "timeline") {
                  return (
                    <TimelineSection
                      key={section.id}
                      items={section.items}
                      onUpdate={(items) =>
                        updateSectionItems(section.id, items)
                      }
                      onRemoveSection={() => removeSection(section.id)}
                    />
                  )
                }
                if (section.type === "process-deck") {
                  return (
                    <ProcessDeckSection
                      key={section.id}
                      items={section.items}
                      onUpdate={(items) =>
                        updateSectionItems(section.id, items)
                      }
                      onRemoveSection={() => removeSection(section.id)}
                    />
                  )
                }
                return null
              })}

              <SectionSelector onSelect={addSection} />
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
