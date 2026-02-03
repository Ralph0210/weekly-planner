"use client"

import { useState, useEffect, useRef } from "react"
import { Icons } from "./Icons"
import RichTextEditor from "./RichTextEditor"
import { BlockEditor } from "./BlockEditor"

export default function TaskPanel({ isOpen, onClose, onSave, task }) {
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [blocks, setBlocks] = useState([])
  const [comments, setComments] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false)
  const titleRef = useRef(null)

  useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDetails(task.details || "")
      setComments(task.comments || [])

      // Initialize Blocks from existing data
      if (task.blocks && task.blocks.length > 0) {
        // New format: use blocks directly
        setBlocks(task.blocks)
      } else if (task.sections && task.sections.length > 0) {
        // Migration from sections: convert section items to blocks
        const migratedBlocks = task.sections.flatMap((section) => {
          if (section.type === "simple-list") {
            return section.items.map((item) => ({
              id: item.id || crypto.randomUUID(),
              type: "subtask",
              content: item.text || "",
              completed: item.completed || false,
              children: [],
            }))
          }
          if (section.type === "timeline") {
            return section.items.map((item) => ({
              id: item.id || crypto.randomUUID(),
              type: "timeline",
              content: item.text || "",
              description: item.description || "",
              completed: item.completed || false,
              children: [],
            }))
          }
          if (section.type === "process-deck") {
            return section.items.map((item) => ({
              id: item.id || crypto.randomUUID(),
              type: "process-deck",
              content: item.text || "",
              description: item.description || "",
              completed: false,
              children: [],
            }))
          }
          return []
        })
        setBlocks(migratedBlocks)
      } else if (task.subtasks && task.subtasks.length > 0) {
        // Migration from legacy subtasks
        const migratedBlocks = task.subtasks.map((item) => ({
          id: item.id || crypto.randomUUID(),
          type: "subtask",
          content: item.text || "",
          completed: item.completed || false,
          children: [],
        }))
        setBlocks(migratedBlocks)
      } else {
        setBlocks([])
      }
    } else {
      setTitle("")
      setDetails("")
      setBlocks([])
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

    // Flatten blocks to subtasks for backward compatibility (progress bars on cards)
    const flattenBlocks = (blockList) => {
      return blockList.flatMap((block) => {
        // Subtask or text block
        if (block.type === "subtask" || block.type === "text") {
          return [
            {
              id: block.id,
              text: block.content,
              completed: block.completed || false,
            },
          ]
        }

        // Timeline block: each step becomes a subtask, plus their nested subtasks
        if (block.type === "timeline" && block.data?.steps) {
          return block.data.steps.flatMap((step) => {
            const stepItem = {
              id: step.id,
              text: step.title,
              completed: step.completed || false,
            }
            const nestedItems = (step.subtasks || []).map((sub) => ({
              id: sub.id,
              text: sub.text,
              completed: sub.completed || false,
            }))
            return [stepItem, ...nestedItems]
          })
        }

        // Process deck block: each card becomes a subtask, plus their nested subtasks
        if (block.type === "process-deck" && block.data?.cards) {
          return block.data.cards.flatMap((card) => {
            const cardItem = {
              id: card.id,
              text: card.title,
              completed: false,
            }
            const nestedItems = (card.subtasks || []).map((sub) => ({
              id: sub.id,
              text: sub.text,
              completed: sub.completed || false,
            }))
            return [cardItem, ...nestedItems]
          })
        }

        return []
      })
    }

    const allSubtasks = flattenBlocks(blocks)

    onSave({
      id: task?.id || crypto.randomUUID(),
      title: title.trim(),
      details: details.trim(),
      blocks, // Save the new block structure
      subtasks: allSubtasks, // Flattened for legacy compatibility
      comments,
      completed: task?.completed || false,
    })
    onClose()
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

            <div className="blocks-container">
              <BlockEditor blocks={blocks} onChange={setBlocks} />
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

      <style jsx>{`
        .blocks-container {
          margin-top: var(--space-md);
        }
      `}</style>
    </>
  )
}
