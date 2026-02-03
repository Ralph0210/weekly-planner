"use client"

import { useState, useRef } from "react"
import { Icons } from "./Icons"

// --- Helper Components ---

const DragHandle = ({ ...props }) => (
  <span
    {...props}
    className="drag-handle"
    style={{
      cursor: "grab",
      color: "var(--text-tertiary)",
      display: "flex",
      alignItems: "center",
    }}
  >
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
    </svg>
  </span>
)

// --- Section Types ---

export function SimpleListSection({ items, onUpdate, onRemoveSection }) {
  const addItem = () => {
    const newItem = { id: crypto.randomUUID(), text: "", completed: false }
    onUpdate([...items, newItem])
  }

  const updateItem = (id, updates) => {
    onUpdate(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
  }

  const removeItem = (id) => {
    onUpdate(items.filter((item) => item.id !== id))
  }

  return (
    <div className="section-container simple-list">
      <div className="section-header">
        <span className="section-title">Subtasks</span>
        <button onClick={onRemoveSection} className="section-remove-btn">
          <Icons.Trash />
        </button>
      </div>
      <div className="section-content">
        {items.map((item) => (
          <div
            key={item.id}
            className={`simple-item ${item.completed ? "completed" : ""}`}
          >
            <div className="simple-item-row">
              <div
                className={`checkbox ${item.completed ? "checked" : ""}`}
                onClick={() =>
                  updateItem(item.id, { completed: !item.completed })
                }
              >
                {item.completed && <Icons.Check />}
              </div>
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItem(item.id, { text: e.target.value })}
                placeholder="Task..."
                className="simple-input"
              />
              <button
                onClick={() => removeItem(item.id)}
                className="item-remove-btn"
              >
                <Icons.X />
              </button>
            </div>
          </div>
        ))}
        <button className="add-item-btn" onClick={addItem}>
          <Icons.Plus /> Add Task
        </button>
      </div>
      <style jsx>{`
        .section-container {
          margin-bottom: 24px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .section-remove-btn {
          opacity: 0;
          transition: opacity 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-tertiary);
        }
        .section-container:hover .section-remove-btn {
          opacity: 1;
        }

        .simple-item {
          margin-bottom: 8px;
        }
        .simple-item-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .simple-item.completed .simple-input {
          text-decoration: line-through;
          color: var(--text-tertiary);
        }

        .checkbox {
          width: 18px;
          height: 18px;
          border: 1.5px solid var(--border-color);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .checkbox.checked {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }

        .simple-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
          padding: 4px 0;
        }
        .item-remove-btn {
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          opacity: 0;
          padding: 4px;
          display: flex;
        }
        .simple-item:hover .item-remove-btn {
          opacity: 1;
        }

        .add-item-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          font-size: 13px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 0;
          transition: color 0.2s;
        }
        .add-item-btn:hover {
          color: var(--accent-primary);
        }
      `}</style>
    </div>
  )
}

export function TimelineSection({ items, onUpdate, onRemoveSection }) {
  const [draggedItem, setDraggedItem] = useState(null)

  const addItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      text: "",
      completed: false,
      description: "Pending",
    }
    onUpdate([...items, newItem])
  }

  const updateItem = (id, updates) => {
    onUpdate(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
  }

  const removeItem = (id) => {
    onUpdate(items.filter((item) => item.id !== id))
  }

  // DnD Logic
  const handleDragStart = (e, index) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = "move"
    // e.dataTransfer.setData("text/plain", index) // Firefox requires this
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedItem === null || draggedItem === index) return

    // Simple reorder visual (swapping) logic could be refined
    const newItems = [...items]
    const item = newItems[draggedItem]
    newItems.splice(draggedItem, 1)
    newItems.splice(index, 0, item)

    onUpdate(newItems)
    setDraggedItem(index)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  return (
    <div className="section-container timeline-section">
      <div className="section-header">
        <span className="section-title">Timeline</span>
        <button onClick={onRemoveSection} className="section-remove-btn">
          <Icons.Trash />
        </button>
      </div>
      <div className="timeline-content">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`timeline-node ${item.completed ? "completed" : ""} ${draggedItem === index ? "dragging" : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="node-line"></div>
            <div
              className={`node-circle ${item.completed ? "checked" : ""}`}
              onClick={() =>
                updateItem(item.id, { completed: !item.completed })
              }
            >
              {item.completed ? <Icons.Check /> : index + 1}
            </div>

            <div className="node-content">
              <div className="node-header">
                <input
                  className="node-title"
                  value={item.text}
                  onChange={(e) =>
                    updateItem(item.id, { text: e.target.value })
                  }
                  placeholder="Step title..."
                />
                <DragHandle />
              </div>
              <input
                className="node-desc"
                value={item.description || ""}
                onChange={(e) =>
                  updateItem(item.id, { description: e.target.value })
                }
                placeholder="Details..."
              />
            </div>
            <button onClick={() => removeItem(item.id)} className="node-delete">
              <Icons.X />
            </button>
          </div>
        ))}
        <button className="add-item-btn" onClick={addItem}>
          <Icons.Plus /> Add Step
        </button>
      </div>
      <style jsx>{`
        .section-container {
          margin-bottom: 24px;
          position: relative;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .timeline-content {
          position: relative;
          padding-left: 10px;
        }

        .timeline-node {
          display: flex;
          gap: 12px;
          position: relative;
          margin-bottom: 16px;
          align-items: flex-start;
          opacity: 1;
          transition: opacity 0.2s;
        }
        .timeline-node.dragging {
          opacity: 0.5;
        }

        .node-line {
          position: absolute;
          left: 14px;
          top: 28px;
          bottom: -20px;
          width: 2px;
          background: var(--border-color);
          z-index: 0;
        }
        .timeline-node:last-of-type .node-line {
          display: none;
        }

        .node-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          z-index: 1;
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .node-circle.checked {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }
        .node-circle svg {
          width: 14px;
          height: 14px;
        }

        .node-content {
          flex: 1;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 12px;
          transition: border-color 0.2s;
        }
        .timeline-node:focus-within .node-content {
          border-color: var(--accent-primary);
        }
        .timeline-node.completed .node-content {
          opacity: 0.6;
        }

        .node-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .node-title {
          border: none;
          background: transparent;
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
          width: 100%;
          outline: none;
        }

        .node-desc {
          border: none;
          background: transparent;
          font-size: 13px;
          color: var(--text-secondary);
          width: 100%;
          outline: none;
        }

        .node-delete {
          opacity: 0;
          position: absolute;
          right: -28px;
          top: 10px;
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
        }
        .timeline-node:hover .node-delete {
          opacity: 1;
        }

        .add-item-btn {
          margin-left: 42px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          font-size: 13px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 0;
        }
        .add-item-btn:hover {
          color: var(--accent-primary);
        }
      `}</style>
    </div>
  )
}

export function ProcessDeckSection({ items, onUpdate, onRemoveSection }) {
  const [expandedId, setExpandedId] = useState(null)

  const addItem = () => {
    const newItem = { id: crypto.randomUUID(), text: "", description: "" } // Could add internal checklists later
    const newItems = [...items, newItem]
    onUpdate(newItems)
    setExpandedId(newItem.id)
  }

  const updateItem = (id, updates) => {
    onUpdate(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
  }

  const removeItem = (id) => {
    onUpdate(items.filter((item) => item.id !== id))
  }

  return (
    <div className="section-container process-deck">
      <div className="section-header">
        <span className="section-title">Process Deck</span>
        <button onClick={onRemoveSection} className="section-remove-btn">
          <Icons.Trash />
        </button>
      </div>
      <div className="deck-content">
        {items.map((item) => {
          const isExpanded = expandedId === item.id
          return (
            <div
              key={item.id}
              className={`deck-card ${isExpanded ? "expanded" : ""}`}
            >
              <div
                className="card-header"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <span className="card-title-prefix">
                  Step {items.indexOf(item) + 1}:
                </span>
                <input
                  className="card-title-input"
                  value={item.text}
                  onChange={(e) =>
                    updateItem(item.id, { text: e.target.value })
                  }
                  placeholder="Process step..."
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="card-caret">
                  {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                </div>
              </div>

              {isExpanded && (
                <div className="card-body">
                  <textarea
                    value={item.description || ""}
                    onChange={(e) => {
                      updateItem(item.id, { description: e.target.value })
                      e.target.style.height = "auto"
                      e.target.style.height = e.target.scrollHeight + "px"
                    }}
                    placeholder="Detailed description or checklist..."
                    className="card-textarea"
                  />
                  <div className="card-footer">
                    <button
                      className="card-delete-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      Delete Card
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        <button className="add-item-btn" onClick={addItem}>
          <Icons.Plus /> Add Card
        </button>
      </div>
      <style jsx>{`
        .section-container {
          margin-bottom: 24px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .deck-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          margin-bottom: 8px;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        .deck-card.expanded {
          background: rgba(255, 255, 255, 0.06);
          border-color: var(--accent-primary-dim);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          align-items: center;
          padding: 12px;
          cursor: pointer;
          user-select: none;
        }
        .card-title-prefix {
          font-size: 13px;
          color: var(--text-tertiary);
          margin-right: 8px;
          font-weight: 500;
        }
        .card-title-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-weight: 500;
          font-size: 14px;
          outline: none;
        }
        .card-caret {
          color: var(--text-tertiary);
        }

        .card-body {
          padding: 0 12px 12px 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .card-textarea {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
          outline: none;
          padding-top: 12px;
          min-height: 80px;
          resize: none;
          border-radius: 0;
        }

        .card-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
        }
        .card-delete-btn {
          font-size: 12px;
          color: #ef4444;
          background: none;
          border: none;
          cursor: pointer;
          opacity: 0.7;
        }
        .card-delete-btn:hover {
          opacity: 1;
        }

        .add-item-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          font-size: 13px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 0;
          margin-top: 4px;
        }
        .add-item-btn:hover {
          color: var(--accent-primary);
        }
      `}</style>
    </div>
  )
}

export function SectionSelector({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (type) => {
    onSelect(type)
    setIsOpen(false)
  }

  return (
    <div className="section-selector">
      {isOpen ? (
        <div className="selector-menu">
          <div className="selector-title">Add Section</div>
          <button
            onClick={() => handleSelect("simple-list")}
            className="selector-item"
          >
            <span className="icon">📝</span>
            <div className="info">
              <span className="name">Simple List</span>
              <span className="desc">Standard checkboxes</span>
            </div>
          </button>
          <button
            onClick={() => handleSelect("timeline")}
            className="selector-item"
          >
            <span className="icon">⚡️</span>
            <div className="info">
              <span className="name">Timeline</span>
              <span className="desc">Prioritized steps</span>
            </div>
          </button>
          <button
            onClick={() => handleSelect("process-deck")}
            className="selector-item"
          >
            <span className="icon">🗂</span>
            <div className="info">
              <span className="name">Process Deck</span>
              <span className="desc">Detailed cards</span>
            </div>
          </button>
          <button onClick={() => setIsOpen(false)} className="selector-cancel">
            Cancel
          </button>
        </div>
      ) : (
        <button className="add-section-btn" onClick={() => setIsOpen(true)}>
          <Icons.Plus /> Add Section
        </button>
      )}
      <style jsx>{`
        .section-selector {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px dashed var(--border-color);
        }
        .add-section-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: center;
          padding: 10px;
          border: 1px dashed var(--border-color);
          border-radius: 8px;
          color: var(--text-secondary);
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .add-section-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .selector-menu {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 8px;
          animation: fadeIn 0.15s ease;
        }
        .selector-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-tertiary);
          margin-bottom: 8px;
          padding-left: 8px;
          text-transform: uppercase;
        }

        .selector-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          text-align: left;
        }
        .selector-item:hover {
          background: var(--bg-hover);
        }
        .selector-item .icon {
          font-size: 18px;
        }
        .selector-item .name {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .selector-item .desc {
          display: block;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .selector-cancel {
          width: 100%;
          margin-top: 8px;
          padding: 6px;
          background: none;
          border: none;
          color: var(--text-tertiary);
          font-size: 12px;
          cursor: pointer;
        }
        .selector-cancel:hover {
          color: var(--text-secondary);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
