"use client"

import { useState, useRef, useEffect } from "react"
import { Icons } from "./Icons"

// --- Block Type Menu (reusable) ---
function BlockTypeMenu({ onSelect, onClose, position = "below" }) {
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  return (
    <div className={`block-type-menu ${position}`} ref={menuRef}>
      <div className="menu-title">Select block type</div>
      <button onClick={() => onSelect("subtask")} className="menu-item">
        <span className="menu-icon">
          <Icons.Check />
        </span>
        <div className="menu-info">
          <span className="menu-name">Subtask</span>
          <span className="menu-desc">Checkbox item</span>
        </div>
      </button>
      <button onClick={() => onSelect("text")} className="menu-item">
        <span className="menu-icon">
          <Icons.Edit />
        </span>
        <div className="menu-info">
          <span className="menu-name">Text</span>
          <span className="menu-desc">Plain text</span>
        </div>
      </button>
      <button onClick={() => onSelect("timeline")} className="menu-item">
        <span className="menu-icon">
          <Icons.ChevronRight />
        </span>
        <div className="menu-info">
          <span className="menu-name">Timeline</span>
          <span className="menu-desc">Connected steps</span>
        </div>
      </button>
      <button onClick={() => onSelect("process-deck")} className="menu-item">
        <span className="menu-icon">
          <Icons.Clipboard />
        </span>
        <div className="menu-info">
          <span className="menu-name">Process Deck</span>
          <span className="menu-desc">Expandable cards</span>
        </div>
      </button>

      <style jsx>{`
        .block-type-menu {
          position: absolute;
          z-index: 1000;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--space-xs);
          min-width: 180px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          animation: menuIn 0.15s ease;
        }
        .block-type-menu.below {
          left: 0;
          top: 100%;
          margin-top: 4px;
        }
        .block-type-menu.above {
          left: 0;
          bottom: 100%;
          margin-bottom: 4px;
        }
        .menu-title {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          padding: 6px 8px 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 6px 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: var(--radius-sm);
          text-align: left;
          transition: background 0.1s;
        }
        .menu-item:hover {
          background: var(--bg-hover);
        }
        .menu-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-muted);
          border-radius: 4px;
          color: var(--text-secondary);
        }
        .menu-icon :global(svg) {
          width: 12px;
          height: 12px;
        }
        .menu-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .menu-desc {
          font-size: 11px;
          color: var(--text-muted);
        }
        @keyframes menuIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
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

// --- Nested Subtask List (for Timeline steps and Process cards) ---
function NestedSubtaskList({ items, onUpdate }) {
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
    <div className="nested-subtasks">
      {items.map((item) => (
        <div key={item.id} className="nested-item">
          <div
            className={`nested-checkbox ${item.completed ? "checked" : ""}`}
            onClick={() => updateItem(item.id, { completed: !item.completed })}
          >
            {item.completed && <Icons.Check />}
          </div>
          <input
            type="text"
            value={item.text}
            onChange={(e) => updateItem(item.id, { text: e.target.value })}
            placeholder="Subtask..."
            className={`nested-input ${item.completed ? "completed" : ""}`}
          />
          <button className="nested-delete" onClick={() => removeItem(item.id)}>
            <Icons.X />
          </button>
        </div>
      ))}
      <button className="add-nested-btn" onClick={addItem}>
        <Icons.Plus /> Add subtask
      </button>

      <style jsx>{`
        .nested-subtasks {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed var(--border-light);
        }
        .nested-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 3px 0;
        }
        .nested-item:hover .nested-delete {
          opacity: 1;
        }
        .nested-checkbox {
          width: 14px;
          height: 14px;
          border: 1.5px solid var(--border-color);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .nested-checkbox:hover {
          border-color: var(--accent-primary);
        }
        .nested-checkbox.checked {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }
        .nested-checkbox :global(svg) {
          width: 8px;
          height: 8px;
        }
        .nested-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 13px;
          color: var(--text-primary);
          outline: none;
          font-family: inherit;
        }
        .nested-input.completed {
          text-decoration: line-through;
          color: var(--text-muted);
        }
        .nested-delete {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.1s;
        }
        .nested-delete:hover {
          color: var(--danger);
        }
        .nested-delete :global(svg) {
          width: 10px;
          height: 10px;
        }
        .add-nested-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
          font-size: 12px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 0;
          margin-top: 4px;
        }
        .add-nested-btn:hover {
          color: var(--accent-primary);
        }
        .add-nested-btn :global(svg) {
          width: 10px;
          height: 10px;
        }
      `}</style>
    </div>
  )
}

// --- Timeline Block ---
function TimelineBlock({ data, onUpdate, onRemove }) {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const steps = data.steps || []

  const addStep = () => {
    const newStep = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      completed: false,
      subtasks: [],
    }
    onUpdate({ ...data, steps: [...steps, newStep] })
  }

  const updateStep = (id, updates) => {
    onUpdate({
      ...data,
      steps: steps.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })
  }

  const removeStep = (id) => {
    onUpdate({ ...data, steps: steps.filter((s) => s.id !== id) })
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    const newSteps = [...steps]
    const item = newSteps[draggedIndex]
    newSteps.splice(draggedIndex, 1)
    newSteps.splice(index, 0, item)
    onUpdate({ ...data, steps: newSteps })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => setDraggedIndex(null)

  return (
    <div className="timeline-block">
      <div className="timeline-header">
        <span className="timeline-label">Timeline</span>
        <button className="timeline-delete" onClick={onRemove}>
          <Icons.Trash />
        </button>
      </div>
      <div className="timeline-steps">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`timeline-step ${step.completed ? "completed" : ""} ${draggedIndex === index ? "dragging" : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="step-line" />
            <div
              className={`step-circle ${step.completed ? "checked" : ""}`}
              onClick={() =>
                updateStep(step.id, { completed: !step.completed })
              }
            >
              {step.completed ? <Icons.Check /> : null}
            </div>
            <div className="step-content">
              <div className="step-header">
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) =>
                    updateStep(step.id, { title: e.target.value })
                  }
                  placeholder="Step title..."
                  className="step-title"
                />
                <button
                  className="step-delete"
                  onClick={() => removeStep(step.id)}
                >
                  <Icons.X />
                </button>
              </div>
              <input
                type="text"
                value={step.description}
                onChange={(e) =>
                  updateStep(step.id, { description: e.target.value })
                }
                placeholder="Details..."
                className="step-desc"
              />
              <NestedSubtaskList
                items={step.subtasks || []}
                onUpdate={(subtasks) => updateStep(step.id, { subtasks })}
              />
            </div>
          </div>
        ))}
      </div>
      <button className="add-step-btn" onClick={addStep}>
        <Icons.Plus /> Add step
      </button>

      <style jsx>{`
        .timeline-block {
          padding-left: 4px;
        }
        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .timeline-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .timeline-delete {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
        }
        .timeline-delete:hover {
          color: var(--danger);
        }
        .timeline-delete :global(svg) {
          width: 14px;
          height: 14px;
        }
        .timeline-steps {
          position: relative;
        }
        .timeline-step {
          display: flex;
          gap: 12px;
          position: relative;
          margin-bottom: 12px;
          cursor: grab;
        }
        .timeline-step.dragging {
          opacity: 0.4;
        }
        .timeline-step.completed .step-content {
          opacity: 0.6;
        }
        .step-line {
          position: absolute;
          left: 13px;
          top: 28px;
          bottom: -12px;
          width: 2px;
          background: var(--border-color);
        }
        .timeline-step:last-child .step-line {
          display: none;
        }
        .step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          z-index: 1;
        }
        .step-circle:hover {
          border-color: var(--success);
          background: var(--success-light);
        }
        .step-circle.checked {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }
        .step-circle :global(svg) {
          width: 12px;
          height: 12px;
        }
        .step-content {
          flex: 1;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 8px 12px;
        }
        .step-content:hover {
          border-color: var(--border-color);
        }
        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .step-title {
          flex: 1;
          border: none;
          background: transparent;
          font-weight: 500;
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
          font-family: inherit;
        }
        .step-title::placeholder {
          color: var(--text-muted);
        }
        .step-delete {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          opacity: 0;
        }
        .step-content:hover .step-delete {
          opacity: 1;
        }
        .step-delete:hover {
          color: var(--danger);
        }
        .step-delete :global(svg) {
          width: 12px;
          height: 12px;
        }
        .step-desc {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 13px;
          color: var(--text-secondary);
          outline: none;
          font-family: inherit;
          margin-top: 4px;
        }
        .step-desc::placeholder {
          color: var(--text-muted);
        }
        .add-step-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 13px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 0;
          margin-left: 40px;
        }
        .add-step-btn:hover {
          color: var(--accent-primary);
        }
        .add-step-btn :global(svg) {
          width: 12px;
          height: 12px;
        }
      `}</style>
    </div>
  )
}

// --- Process Deck Block ---
function ProcessDeckBlock({ data, onUpdate, onRemove }) {
  const [expandedId, setExpandedId] = useState(null)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const cards = data.cards || []

  const addCard = () => {
    const newCard = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      subtasks: [],
    }
    onUpdate({ ...data, cards: [...cards, newCard] })
    setExpandedId(newCard.id)
  }

  const updateCard = (id, updates) => {
    onUpdate({
      ...data,
      cards: cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })
  }

  const removeCard = (id) => {
    onUpdate({ ...data, cards: cards.filter((c) => c.id !== id) })
    if (expandedId === id) setExpandedId(null)
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    const newCards = [...cards]
    const item = newCards[draggedIndex]
    newCards.splice(draggedIndex, 1)
    newCards.splice(index, 0, item)
    onUpdate({ ...data, cards: newCards })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => setDraggedIndex(null)

  return (
    <div className="process-deck-block">
      <div className="deck-header">
        <span className="deck-label">Process Deck</span>
        <button className="deck-delete" onClick={onRemove}>
          <Icons.Trash />
        </button>
      </div>
      {cards.map((card, index) => {
        const isExpanded = expandedId === card.id
        return (
          <div
            key={card.id}
            className={`deck-card ${isExpanded ? "expanded" : ""} ${draggedIndex === index ? "dragging" : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div
              className="card-header"
              onClick={() => setExpandedId(isExpanded ? null : card.id)}
            >
              <input
                type="text"
                value={card.title}
                onChange={(e) => updateCard(card.id, { title: e.target.value })}
                placeholder="Card title..."
                className="card-title"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="card-caret">
                {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
              </span>
            </div>
            {isExpanded && (
              <div className="card-body">
                <textarea
                  value={card.description}
                  onChange={(e) =>
                    updateCard(card.id, { description: e.target.value })
                  }
                  placeholder="Description..."
                  className="card-textarea"
                />
                <NestedSubtaskList
                  items={card.subtasks || []}
                  onUpdate={(subtasks) => updateCard(card.id, { subtasks })}
                />
                <button
                  className="card-delete"
                  onClick={() => removeCard(card.id)}
                >
                  Delete card
                </button>
              </div>
            )}
          </div>
        )
      })}
      <button className="add-card-btn" onClick={addCard}>
        <Icons.Plus /> Add card
      </button>

      <style jsx>{`
        .process-deck-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .deck-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .deck-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .deck-delete {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
        }
        .deck-delete:hover {
          color: var(--danger);
        }
        .deck-delete :global(svg) {
          width: 14px;
          height: 14px;
        }
        .deck-card {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: grab;
        }
        .deck-card.dragging {
          opacity: 0.4;
        }
        .deck-card:hover {
          border-color: var(--border-color);
        }
        .deck-card.expanded {
          border-color: var(--accent-primary-dim);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        .card-header {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          cursor: pointer;
        }
        .card-title {
          flex: 1;
          border: none;
          background: transparent;
          font-weight: 500;
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
          font-family: inherit;
        }
        .card-title::placeholder {
          color: var(--text-muted);
        }
        .card-caret {
          color: var(--text-muted);
        }
        .card-caret :global(svg) {
          width: 16px;
          height: 16px;
        }
        .card-body {
          padding: 0 12px 12px;
          border-top: 1px solid var(--border-light);
        }
        .card-textarea {
          width: 100%;
          border: none;
          background: var(--bg-muted);
          border-radius: var(--radius-sm);
          padding: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          outline: none;
          font-family: inherit;
          resize: none;
          min-height: 60px;
          margin-top: 8px;
        }
        .card-delete {
          margin-top: 12px;
          background: none;
          border: none;
          color: var(--danger);
          font-size: 12px;
          cursor: pointer;
        }
        .card-delete:hover {
          text-decoration: underline;
        }
        .add-card-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 13px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 0;
          width: fit-content;
        }
        .add-card-btn:hover {
          color: var(--accent-primary);
        }
        .add-card-btn :global(svg) {
          width: 12px;
          height: 12px;
        }
      `}</style>
    </div>
  )
}

// --- Single Block ---
function Block({
  block,
  index,
  onUpdate,
  onRemove,
  onInsertAfter,
  onConvert,
  dragHandlers,
  isNew,
  onNewBlockType,
  inputRef,
}) {
  const [showInsertMenu, setShowInsertMenu] = useState(false)
  const [showConvertMenu, setShowConvertMenu] = useState(false)
  const localInputRef = useRef(null)
  const effectiveRef = inputRef || localInputRef

  const handleInsert = (type) => {
    onInsertAfter(index, type)
    setShowInsertMenu(false)
  }

  const handleConvert = (type) => {
    onConvert(block.id, type)
    setShowConvertMenu(false)
  }

  const updateBlock = (updates) => {
    onUpdate(block.id, updates)
  }

  // Handle typing on new block - dismiss menu and assume text
  const handleKeyDown = (e) => {
    if (isNew && onNewBlockType) {
      onNewBlockType(block.id)
    }
  }

  const renderContent = () => {
    switch (block.type) {
      case "subtask":
        return (
          <div className="subtask-row">
            <div
              className={`checkbox ${block.completed ? "checked" : ""}`}
              onClick={() => updateBlock({ completed: !block.completed })}
            >
              {block.completed && <Icons.Check />}
            </div>
            <input
              ref={effectiveRef}
              type="text"
              value={block.content || ""}
              onChange={(e) => updateBlock({ content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Subtask..."
              className={`subtask-input ${block.completed ? "completed" : ""}`}
            />
          </div>
        )

      case "text":
        return (
          <input
            ref={effectiveRef}
            type="text"
            value={block.content || ""}
            onChange={(e) => updateBlock({ content: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Type something..."
            className="text-input"
          />
        )

      case "timeline":
        return (
          <TimelineBlock
            data={block.data || { steps: [] }}
            onUpdate={(data) => updateBlock({ data })}
            onRemove={() => onRemove(block.id)}
          />
        )

      case "process-deck":
        return (
          <ProcessDeckBlock
            data={block.data || { cards: [] }}
            onUpdate={(data) => updateBlock({ data })}
            onRemove={() => onRemove(block.id)}
          />
        )

      default:
        return null
    }
  }

  const isSection = block.type === "timeline" || block.type === "process-deck"

  return (
    <div
      className={`block ${block.type} ${isSection ? "section-block" : ""} ${dragHandlers?.dragging ? "dragging" : ""} ${isNew ? "new-block" : ""}`}
      draggable={!isSection}
      onDragStart={dragHandlers?.onDragStart}
      onDragOver={dragHandlers?.onDragOver}
      onDragEnd={dragHandlers?.onDragEnd}
    >
      {!isSection && (
        <div className="block-controls">
          <button
            className="ctrl-btn"
            onClick={() => setShowInsertMenu(!showInsertMenu)}
            title="Add block below"
          >
            <Icons.Plus />
          </button>
          {showInsertMenu && (
            <BlockTypeMenu
              onSelect={handleInsert}
              onClose={() => setShowInsertMenu(false)}
            />
          )}
          <button
            className="ctrl-btn drag-handle"
            onClick={() => setShowConvertMenu(!showConvertMenu)}
            title="Change type"
          >
            <svg width="10" height="12" viewBox="0 0 10 14" fill="currentColor">
              <circle cx="2" cy="2" r="1.5" />
              <circle cx="8" cy="2" r="1.5" />
              <circle cx="2" cy="7" r="1.5" />
              <circle cx="8" cy="7" r="1.5" />
              <circle cx="2" cy="12" r="1.5" />
              <circle cx="8" cy="12" r="1.5" />
            </svg>
          </button>
          {showConvertMenu && (
            <BlockTypeMenu
              onSelect={handleConvert}
              onClose={() => setShowConvertMenu(false)}
            />
          )}
        </div>
      )}

      <div className="block-main">{renderContent()}</div>

      {!isSection && (
        <button
          className="delete-btn"
          onClick={() => onRemove(block.id)}
          title="Delete"
        >
          <Icons.X />
        </button>
      )}

      <style jsx>{`
        .block {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 0;
          position: relative;
          min-height: 28px;
        }
        .block:not(.section-block):hover {
          background: var(--bg-hover);
          margin: 0 -8px;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }
        .block.dragging {
          opacity: 0.4;
        }
        .block.section-block {
          display: block;
          margin: 12px 0;
          padding: 12px;
          background: var(--bg-muted);
          border-radius: var(--radius-md);
        }
        .block.new-block .text-input,
        .block.new-block .subtask-input {
          animation: blink-caret 1s step-end infinite;
        }
        @keyframes blink-caret {
          50% {
            border-color: transparent;
          }
        }

        .block-controls {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
          position: relative;
          opacity: 0;
          transition: opacity 0.1s;
        }
        .block:hover .block-controls {
          opacity: 1;
        }
        .ctrl-btn {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 4px;
        }
        .ctrl-btn:hover {
          color: var(--text-primary);
          background: var(--bg-muted);
        }
        .ctrl-btn :global(svg) {
          width: 12px;
          height: 12px;
        }
        .drag-handle {
          cursor: grab;
        }

        .block-main {
          flex: 1;
          min-width: 0;
        }

        .delete-btn {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.1s;
        }
        .block:hover .delete-btn {
          opacity: 1;
        }
        .delete-btn:hover {
          color: var(--danger);
          background: var(--danger-light);
        }
        .delete-btn :global(svg) {
          width: 12px;
          height: 12px;
        }

        .subtask-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .checkbox {
          width: 16px;
          height: 16px;
          border: 1.5px solid var(--border-color);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .checkbox:hover {
          border-color: var(--accent-primary);
        }
        .checkbox.checked {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }
        .checkbox :global(svg) {
          width: 10px;
          height: 10px;
        }
        .subtask-input,
        .text-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
          font-family: inherit;
        }
        .subtask-input::placeholder,
        .text-input::placeholder {
          color: var(--text-muted);
        }
        .subtask-input.completed {
          text-decoration: line-through;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  )
}

// --- Block List ---
function BlockList({
  blocks,
  onUpdate,
  onRemove,
  onInsertAfter,
  onConvert,
  newBlockId,
  onNewBlockType,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const newBlockRef = useRef(null)

  useEffect(() => {
    if (newBlockId && newBlockRef.current) {
      newBlockRef.current.focus()
    }
  }, [newBlockId])

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    setDraggedIndex(index)
  }

  const handleDragEnd = () => setDraggedIndex(null)

  return (
    <div className="block-list">
      {blocks.map((block, index) => (
        <Block
          key={block.id}
          block={block}
          index={index}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onInsertAfter={onInsertAfter}
          onConvert={onConvert}
          isNew={block.id === newBlockId}
          onNewBlockType={onNewBlockType}
          inputRef={block.id === newBlockId ? newBlockRef : null}
          dragHandlers={{
            dragging: draggedIndex === index,
            onDragStart: (e) => handleDragStart(e, index),
            onDragOver: (e) => handleDragOver(e, index),
            onDragEnd: handleDragEnd,
          }}
        />
      ))}
    </div>
  )
}

// --- Block Editor (main export) ---
export function BlockEditor({ blocks, onChange }) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [newBlockId, setNewBlockId] = useState(null)

  const addBlock = (type) => {
    let newBlock = {
      id: crypto.randomUUID(),
      type: type || "text",
      content: "",
      completed: false,
    }
    if (type === "timeline") {
      newBlock.data = { steps: [] }
    } else if (type === "process-deck") {
      newBlock.data = { cards: [] }
    }
    onChange([...blocks, newBlock])
    setShowAddMenu(false)
    if (type === "text" || type === "subtask" || !type) {
      setNewBlockId(newBlock.id)
    }
  }

  const handleAddBlockClick = () => {
    // Create text block immediately, show menu for type selection
    const newBlock = {
      id: crypto.randomUUID(),
      type: "text",
      content: "",
      completed: false,
    }
    onChange([...blocks, newBlock])
    setNewBlockId(newBlock.id)
    setShowAddMenu(true)
  }

  const handleNewBlockType = (blockId) => {
    // User started typing - dismiss menu, keep as text
    setShowAddMenu(false)
    setNewBlockId(null)
  }

  const handleTypeSelection = (type) => {
    if (newBlockId) {
      // Convert the new block to selected type
      convertBlock(newBlockId, type)
    } else {
      addBlock(type)
    }
    setShowAddMenu(false)
    setNewBlockId(null)
  }

  const updateBlock = (id, updates) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }

  const removeBlock = (id) => {
    onChange(blocks.filter((b) => b.id !== id))
  }

  const insertAfter = (index, type) => {
    let newBlock = {
      id: crypto.randomUUID(),
      type: type || "text",
      content: "",
      completed: false,
    }
    if (type === "timeline") {
      newBlock.data = { steps: [] }
    } else if (type === "process-deck") {
      newBlock.data = { cards: [] }
    }
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    onChange(newBlocks)
    if (type === "text" || type === "subtask") {
      setNewBlockId(newBlock.id)
    }
  }

  const convertBlock = (id, newType) => {
    onChange(
      blocks.map((b) => {
        if (b.id !== id) return b
        let updated = { ...b, type: newType }
        if (newType === "timeline" && !b.data?.steps) {
          updated.data = { steps: [] }
        } else if (newType === "process-deck" && !b.data?.cards) {
          updated.data = { cards: [] }
        }
        return updated
      }),
    )
    setNewBlockId(null)
  }

  return (
    <div className="block-editor">
      <BlockList
        blocks={blocks}
        onUpdate={updateBlock}
        onRemove={removeBlock}
        onInsertAfter={insertAfter}
        onConvert={convertBlock}
        newBlockId={newBlockId}
        onNewBlockType={handleNewBlockType}
      />
      <div className="add-block-wrapper">
        <button className="add-block-btn" onClick={handleAddBlockClick}>
          <Icons.Plus /> Add block
        </button>
        {showAddMenu && (
          <BlockTypeMenu
            onSelect={handleTypeSelection}
            onClose={() => {
              setShowAddMenu(false)
              setNewBlockId(null)
            }}
            position="above"
          />
        )}
      </div>

      <style jsx>{`
        .block-editor {
          margin-top: 16px;
        }
        .add-block-wrapper {
          position: relative;
          margin-top: 8px;
        }
        .add-block-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 13px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 4px;
          border-radius: var(--radius-sm);
        }
        .add-block-btn:hover {
          color: var(--accent-primary);
          background: var(--accent-light);
        }
        .add-block-btn :global(svg) {
          width: 12px;
          height: 12px;
        }
      `}</style>
    </div>
  )
}
