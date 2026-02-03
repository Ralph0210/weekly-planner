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
          margin-bottom: var(--space-lg);
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-sm);
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          transition: background var(--transition-fast);
        }
        .section-header:hover {
          background: var(--bg-hover);
        }
        .section-title {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .section-remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-tertiary);
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: all var(--transition-fast);
        }
        .section-remove-btn:hover {
          color: var(--danger);
          background: var(--danger-light);
        }
        .section-remove-btn svg {
          width: 14px;
          height: 14px;
        }

        .simple-item {
          margin-bottom: var(--space-xs);
        }
        .simple-item-row {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          transition: background var(--transition-fast);
        }
        .simple-item-row:hover {
          background: var(--bg-hover);
        }
        .simple-item.completed .simple-input {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid var(--border-color);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }
        .checkbox:hover {
          border-color: var(--success);
          background: var(--success-light);
        }
        .checkbox.checked {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }
        .checkbox svg {
          width: 12px;
          height: 12px;
        }

        .simple-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: var(--font-size-md);
          color: var(--text-primary);
          outline: none;
          padding: var(--space-xs) 0;
          font-family: inherit;
        }
        .simple-input:focus {
          outline: none;
        }
        .simple-input::placeholder {
          color: var(--text-muted);
        }

        .item-remove-btn {
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: var(--space-xs);
          display: flex;
          align-items: center;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .item-remove-btn:hover {
          color: var(--danger);
          background: var(--danger-light);
        }
        .item-remove-btn svg {
          width: 14px;
          height: 14px;
        }

        .add-item-btn {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-sm) var(--space-xs);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .add-item-btn:hover {
          color: var(--accent-primary);
          background: var(--accent-light);
        }
        .add-item-btn svg {
          width: 14px;
          height: 14px;
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
          margin-bottom: var(--space-lg);
          position: relative;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-md);
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          transition: background var(--transition-fast);
        }
        .section-header:hover {
          background: var(--bg-hover);
        }
        .section-title {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .section-remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-tertiary);
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: all var(--transition-fast);
        }
        .section-remove-btn:hover {
          color: var(--danger);
          background: var(--danger-light);
        }
        .section-remove-btn svg {
          width: 14px;
          height: 14px;
        }

        .timeline-content {
          position: relative;
          padding-left: var(--space-sm);
        }

        .timeline-node {
          display: flex;
          gap: var(--space-md);
          position: relative;
          margin-bottom: var(--space-md);
          align-items: flex-start;
          transition: opacity var(--transition-fast);
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
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-xs);
          font-weight: 600;
          color: var(--text-secondary);
          z-index: 1;
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
          margin-top: 2px;
          transition: all var(--transition-fast);
        }
        .node-circle:hover {
          border-color: var(--success);
          background: var(--success-light);
        }
        .node-circle.checked {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }
        .node-circle svg {
          width: 12px;
          height: 12px;
        }

        .node-content {
          flex: 1;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: var(--space-sm) var(--space-md);
          transition: all var(--transition-fast);
        }
        .node-content:hover {
          background: var(--bg-muted);
        }
        .timeline-node:focus-within .node-content {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px var(--accent-primary-dim);
        }
        .timeline-node.completed .node-content {
          opacity: 0.6;
        }

        .node-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xs);
        }
        .node-title {
          border: none;
          background: transparent;
          font-weight: 500;
          font-size: var(--font-size-md);
          color: var(--text-primary);
          width: 100%;
          outline: none;
          font-family: inherit;
        }
        .node-title::placeholder {
          color: var(--text-muted);
        }

        .node-desc {
          border: none;
          background: transparent;
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          width: 100%;
          outline: none;
          font-family: inherit;
        }
        .node-desc::placeholder {
          color: var(--text-muted);
        }

        .node-delete {
          position: relative;
          margin-left: var(--space-xs);
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: all var(--transition-fast);
        }
        .node-delete:hover {
          color: var(--danger);
          background: var(--danger-light);
        }
        .node-delete svg {
          width: 14px;
          height: 14px;
        }

        .add-item-btn {
          margin-left: calc(28px + var(--space-md));
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-sm) var(--space-xs);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .add-item-btn:hover {
          color: var(--accent-primary);
          background: var(--accent-light);
        }
        .add-item-btn svg {
          width: 14px;
          height: 14px;
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
          margin-bottom: var(--space-lg);
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-sm);
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          transition: background var(--transition-fast);
        }
        .section-header:hover {
          background: var(--bg-hover);
        }
        .section-title {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .section-remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-tertiary);
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: all var(--transition-fast);
        }
        .section-remove-btn:hover {
          color: var(--danger);
          background: var(--danger-light);
        }
        .section-remove-btn svg {
          width: 14px;
          height: 14px;
        }

        .deck-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          margin-bottom: var(--space-sm);
          overflow: hidden;
          transition: all var(--transition-fast);
        }
        .deck-card:hover {
          background: var(--bg-muted);
        }
        .deck-card.expanded {
          background: var(--bg-card);
          border-color: var(--accent-primary-dim);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .card-header {
          display: flex;
          align-items: center;
          padding: var(--space-sm) var(--space-md);
          cursor: pointer;
          user-select: none;
          transition: background var(--transition-fast);
        }
        .card-header:hover {
          background: var(--bg-hover);
        }
        .card-title-prefix {
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
          margin-right: var(--space-sm);
          font-weight: 500;
        }
        .card-title-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-weight: 500;
          font-size: var(--font-size-md);
          outline: none;
          font-family: inherit;
        }
        .card-title-input::placeholder {
          color: var(--text-muted);
        }
        .card-caret {
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          transition: color var(--transition-fast);
        }
        .card-caret svg {
          width: 16px;
          height: 16px;
        }
        .deck-card:hover .card-caret {
          color: var(--text-secondary);
        }

        .card-body {
          padding: 0 var(--space-md) var(--space-md) var(--space-md);
          border-top: 1px solid var(--border-light);
        }
        .card-textarea {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: var(--font-size-md);
          line-height: 1.6;
          outline: none;
          padding-top: var(--space-md);
          min-height: 80px;
          resize: none;
          font-family: inherit;
        }
        .card-textarea::placeholder {
          color: var(--text-muted);
        }

        .card-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: var(--space-sm);
        }
        .card-delete-btn {
          font-size: var(--font-size-xs);
          color: var(--danger);
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .card-delete-btn:hover {
          background: var(--danger-light);
        }

        .add-item-btn {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-sm) var(--space-xs);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .add-item-btn:hover {
          color: var(--accent-primary);
          background: var(--accent-light);
        }
        .add-item-btn svg {
          width: 14px;
          height: 14px;
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
          margin-top: var(--space-lg);
          padding-top: var(--space-md);
          border-top: 1px dashed var(--border-color);
        }
        .add-section-btn {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          width: 100%;
          justify-content: center;
          padding: var(--space-sm) var(--space-md);
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          background: transparent;
          cursor: pointer;
          font-size: var(--font-size-sm);
          transition: all var(--transition-fast);
        }
        .add-section-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: var(--accent-light);
        }
        .add-section-btn svg {
          width: 14px;
          height: 14px;
        }

        .selector-menu {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: var(--space-sm);
          animation: fadeIn var(--transition-fast);
        }
        .selector-title {
          font-size: var(--font-size-xs);
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: var(--space-sm);
          padding-left: var(--space-sm);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .selector-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          width: 100%;
          padding: var(--space-sm);
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: var(--radius-sm);
          text-align: left;
          transition: background var(--transition-fast);
        }
        .selector-item:hover {
          background: var(--bg-hover);
        }
        .selector-item .icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }
        .selector-item .name {
          display: block;
          font-size: var(--font-size-md);
          font-weight: 500;
          color: var(--text-primary);
        }
        .selector-item .desc {
          display: block;
          font-size: var(--font-size-xs);
          color: var(--text-muted);
          margin-top: 2px;
        }

        .selector-cancel {
          width: 100%;
          margin-top: var(--space-sm);
          padding: var(--space-xs);
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: var(--font-size-xs);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .selector-cancel:hover {
          color: var(--text-secondary);
          background: var(--bg-hover);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
