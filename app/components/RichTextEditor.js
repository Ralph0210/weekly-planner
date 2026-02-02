"use client"

import { useState, useRef, useEffect, useCallback } from "react"

const COLORS = [
  { name: "Default", value: "inherit" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
]

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Add notes...",
  className = "",
  comments = [],
  onCommentsChange,
  showCommentsSidebar = false,
  onToggleSidebar,
}) {
  const editorRef = useRef(null)
  const toolbarRef = useRef(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [savedSelection, setSavedSelection] = useState(null)
  const [hoveredComment, setHoveredComment] = useState(null)
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 })
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState("")
  const [commentPositions, setCommentPositions] = useState({})

  // Initialize content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleSelectionChange = useCallback(() => {
    if (showCommentInput) return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !editorRef.current) {
      setShowToolbar(false)
      setShowColorPicker(false)
      return
    }

    if (!editorRef.current.contains(selection.anchorNode)) {
      setShowToolbar(false)
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const editorRect = editorRef.current.getBoundingClientRect()

    setToolbarPosition({
      top: rect.top - editorRect.top - 44,
      left: Math.max(0, rect.left - editorRect.left + rect.width / 2 - 100),
    })
    setShowToolbar(true)
  }, [showCommentInput])

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange)
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
    }
  }, [handleSelectionChange])

  // Handle comment hover
  useEffect(() => {
    if (!editorRef.current || showCommentsSidebar) return

    const handleMouseOver = (e) => {
      const commentEl = e.target.closest(".rich-text-comment")
      if (commentEl) {
        const commentId = commentEl.getAttribute("data-comment-id")
        const comment = comments.find((c) => c.id === commentId)
        if (comment) {
          const rect = commentEl.getBoundingClientRect()
          const editorRect = editorRef.current.getBoundingClientRect()
          setHoverPosition({
            top: rect.bottom - editorRect.top + 4,
            left: rect.left - editorRect.left,
          })
          setHoveredComment(comment)
        }
      }
    }

    const handleMouseOut = (e) => {
      const relatedTarget = e.relatedTarget
      // Don't hide if moving to tooltip or another comment element
      if (relatedTarget?.closest?.(".comment-hover-tooltip")) return
      if (relatedTarget?.closest?.(".rich-text-comment")) return
      setHoveredComment(null)
    }

    const handleClick = (e) => {
      const commentEl = e.target.closest(".rich-text-comment")
      if (commentEl) {
        onToggleSidebar?.(true)
      }
    }

    const editor = editorRef.current
    editor.addEventListener("mouseover", handleMouseOver)
    editor.addEventListener("mouseout", handleMouseOut)
    editor.addEventListener("click", handleClick)

    return () => {
      editor.removeEventListener("mouseover", handleMouseOver)
      editor.removeEventListener("mouseout", handleMouseOut)
      editor.removeEventListener("click", handleClick)
    }
  }, [comments, showCommentsSidebar, onToggleSidebar])

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const handleBold = () => execCommand("bold")
  const handleItalic = () => execCommand("italic")
  const handleUnderline = () => execCommand("underline")
  const handleStrikethrough = () => execCommand("strikeThrough")

  const handleColor = (color) => {
    execCommand("foreColor", color)
    setShowColorPicker(false)
  }

  const handleHighlight = (color) => {
    execCommand("hiliteColor", color === "inherit" ? "transparent" : color)
    setShowColorPicker(false)
  }

  const handleShowCommentInput = () => {
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0)
      setSavedSelection(range.cloneRange())

      // Position toolbar input below the selection
      const rect = range.getBoundingClientRect()
      const editorRect = editorRef.current.getBoundingClientRect()

      setToolbarPosition({
        top: rect.bottom - editorRect.top + 10,
        left: Math.max(0, rect.left - editorRect.left), // Align left with selection or adjustment
      })
    }
    setShowCommentInput(true)
  }

  const handleAddComment = () => {
    if (!commentText.trim()) {
      setShowCommentInput(false)
      setSavedSelection(null)
      return
    }

    if (savedSelection) {
      const commentId = crypto.randomUUID()
      const selectedText = savedSelection.toString()

      const wrapper = document.createElement("span")
      wrapper.className = "rich-text-comment"
      wrapper.setAttribute("data-comment-id", commentId)

      try {
        // Use extractContents to handle rich text/nested tags correctly
        const fragment = savedSelection.extractContents()
        wrapper.appendChild(fragment)
        savedSelection.insertNode(wrapper)

        // Insert spacer to prevent typing inside comment
        const spacer = document.createTextNode("\u200B")
        wrapper.after(spacer)

        // Move caret after the comment/spacer
        const selection = window.getSelection()
        const newRange = document.createRange()
        newRange.setStartAfter(spacer)
        newRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(newRange)

        handleInput()

        // Add to comments list
        const newComment = {
          id: commentId,
          text: commentText,
          selectedText,
          createdAt: new Date().toISOString(),
        }
        onCommentsChange?.([...comments, newComment])
      } catch (e) {
        console.warn("Cannot add comment:", e)
      }
    }

    setCommentText("")
    setShowCommentInput(false)
    setSavedSelection(null)
    setShowToolbar(false)
  }

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id)
    setEditingCommentText(comment.text)
  }

  const handleSaveEditComment = () => {
    if (!editingCommentText.trim()) return

    const updatedComments = comments.map((c) =>
      c.id === editingCommentId ? { ...c, text: editingCommentText } : c,
    )
    onCommentsChange?.(updatedComments)
    setEditingCommentId(null)
    setEditingCommentText("")
  }

  const handleDeleteComment = (commentId) => {
    // Remove highlight from the text
    if (editorRef.current) {
      const commentEl = editorRef.current.querySelector(
        `[data-comment-id="${commentId}"]`,
      )
      if (commentEl) {
        const parent = commentEl.parentNode
        while (commentEl.firstChild) {
          parent.insertBefore(commentEl.firstChild, commentEl)
        }
        parent.removeChild(commentEl)
        handleInput()
      }
    }

    // Remove from comments list
    onCommentsChange?.(comments.filter((c) => c.id !== commentId))
  }

  const handleKeyDown = (e) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case "b":
          e.preventDefault()
          handleBold()
          break
        case "i":
          e.preventDefault()
          handleItalic()
          break
        case "u":
          e.preventDefault()
          handleUnderline()
          break
      }
    }
  }

  // Compute comment positions for sidebar alignment
  useEffect(() => {
    if (!showCommentsSidebar || !editorRef.current || comments.length === 0)
      return

    const positions = {}
    comments.forEach((comment) => {
      const commentEl = editorRef.current.querySelector(
        `[data-comment-id="${comment.id}"]`,
      )
      if (commentEl) {
        const editorRect = editorRef.current.getBoundingClientRect()
        const commentRect = commentEl.getBoundingClientRect()
        positions[comment.id] = commentRect.top - editorRect.top
      }
    })
    setCommentPositions(positions)
  }, [showCommentsSidebar, comments])

  return (
    <div className={`rich-text-editor-container ${className}`}>
      <div className="rich-text-editor">
        <div
          ref={editorRef}
          className="rich-text-content"
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />

        {showToolbar && (
          <div
            ref={toolbarRef}
            className="rich-text-toolbar"
            style={{
              top: toolbarPosition.top,
              left: toolbarPosition.left,
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {showCommentInput ? (
              <div className="toolbar-comment-input">
                <div className="comment-input-wrapper">
                  <textarea
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value)
                      e.target.style.height = "auto"
                      e.target.style.height = e.target.scrollHeight + "px"
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleAddComment()
                      }
                      if (e.key === "Escape") setShowCommentInput(false)
                    }}
                    placeholder="Add comment..."
                    autoFocus
                    rows={1}
                  />
                </div>
                <div className="comment-input-actions">
                  <button
                    className="action-btn cancel-btn"
                    onClick={() => setShowCommentInput(false)}
                    title="Cancel"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                  <button
                    className="action-btn save-btn"
                    onClick={handleAddComment}
                    title="Save"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  className="toolbar-btn"
                  onClick={handleBold}
                  title="Bold (⌘B)"
                >
                  <strong>B</strong>
                </button>
                <button
                  className="toolbar-btn"
                  onClick={handleItalic}
                  title="Italic (⌘I)"
                >
                  <em>I</em>
                </button>
                <button
                  className="toolbar-btn"
                  onClick={handleUnderline}
                  title="Underline (⌘U)"
                >
                  <span style={{ textDecoration: "underline" }}>U</span>
                </button>
                <button
                  className="toolbar-btn"
                  onClick={handleStrikethrough}
                  title="Strikethrough"
                >
                  <span style={{ textDecoration: "line-through" }}>S</span>
                </button>

                <div className="toolbar-divider" />

                <button
                  className="toolbar-btn toolbar-color-btn"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  title="Text color"
                >
                  <span className="color-icon">A</span>
                </button>

                <div className="toolbar-divider" />

                <button
                  className="toolbar-btn"
                  onClick={handleShowCommentInput}
                  title="Add comment"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </button>

                {showColorPicker && (
                  <div className="color-picker">
                    <div className="color-section">
                      <span className="color-label">Text</span>
                      <div className="color-options">
                        {COLORS.map((color) => (
                          <button
                            key={`text-${color.value}`}
                            className="color-option"
                            style={{
                              backgroundColor:
                                color.value === "inherit"
                                  ? "#1a1a1a"
                                  : color.value,
                            }}
                            onClick={() => handleColor(color.value)}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="color-section">
                      <span className="color-label">Highlight</span>
                      <div className="color-options">
                        {COLORS.map((color) => (
                          <button
                            key={`bg-${color.value}`}
                            className="color-option highlight-option"
                            style={{
                              backgroundColor:
                                color.value === "inherit"
                                  ? "transparent"
                                  : `${color.value}40`,
                              border:
                                color.value === "inherit"
                                  ? "1px dashed #ccc"
                                  : "none",
                            }}
                            onClick={() => handleHighlight(color.value)}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Hover tooltip for comments */}
        {hoveredComment && !showCommentsSidebar && (
          <div
            className="comment-hover-tooltip"
            style={{ top: hoverPosition.top, left: hoverPosition.left }}
          >
            <p>{hoveredComment.text}</p>
          </div>
        )}
      </div>

      {/* Comments Sidebar */}
      {showCommentsSidebar && comments.length > 0 && (
        <div className="comments-sidebar">
          <div className="comments-sidebar-header">
            <span>Comments</span>
            <span className="comment-count">{comments.length}</span>
          </div>
          <div className="comments-list">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="comment-item"
                style={{
                  marginTop:
                    commentPositions[comment.id] > 0
                      ? Math.max(0, commentPositions[comment.id] - 60)
                      : 0,
                }}
              >
                {editingCommentId === comment.id ? (
                  <div className="comment-edit-form">
                    <textarea
                      value={editingCommentText}
                      onChange={(e) => {
                        setEditingCommentText(e.target.value)
                        e.target.style.height = "auto"
                        e.target.style.height = e.target.scrollHeight + "px"
                      }}
                      autoFocus
                      rows={1}
                    />
                    <div className="comment-edit-actions">
                      <button onClick={handleSaveEditComment}>Save</button>
                      <button onClick={() => setEditingCommentId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="comment-header">
                      <div className="comment-quoted-text">
                        &ldquo;{comment.selectedText}&rdquo;
                      </div>
                      <div className="comment-actions">
                        <button
                          onClick={() => handleEditComment(comment)}
                          title="Edit"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Delete"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="comment-text">{comment.text}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .rich-text-editor-container {
          display: flex;
          gap: 16px;
        }

        .rich-text-editor {
          position: relative;
          flex: 1;
        }

        .rich-text-content {
          width: 100%;
          min-height: 60px;
          font-size: var(--font-size-md);
          color: var(--text-primary);
          line-height: 1.6;
          outline: none;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .rich-text-content:empty:before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          pointer-events: none;
        }

        .rich-text-toolbar {
          position: absolute;
          display: flex;
          align-items: flex-start;
          gap: 2px;
          padding: 6px 8px;
          background: #1a1a1a;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
          z-index: 1000;
          max-width: 100%; /* Ensure toolbar doesn't overflow */
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: #e5e5e5;
          font-size: 14px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .toolbar-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .toolbar-btn svg {
          width: 16px;
          height: 16px;
        }

        .toolbar-divider {
          width: 1px;
          height: 20px;
          background: rgba(255, 255, 255, 0.15);
          margin: 0 4px;
        }

        .color-icon {
          font-weight: 600;
          border-bottom: 3px solid #3b82f6;
          line-height: 1;
        }

        .color-picker {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
          padding: 12px;
          background: #1a1a1a;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          min-width: 180px;
        }

        .color-section {
          margin-bottom: 10px;
        }

        .color-section:last-child {
          margin-bottom: 0;
        }

        .color-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .color-options {
          display: flex;
          gap: 6px;
        }

        .color-option {
          width: 20px;
          height: 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.15s;
        }

        .color-option:hover {
          transform: scale(1.15);
        }

        .toolbar-comment-input {
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }

        .comment-input-wrapper {
          position: relative;
        }

        .toolbar-comment-input textarea {
          width: 240px;
          min-width: 200px;
          max-width: 400px;
          padding: 8px 10px;
          font-size: 13px;
          border: none;
          border-radius: 6px;
          background: #1a1a1a;
          color: #e5e5e5;
          outline: none;
          resize: none;
          font-family: inherit;
          line-height: 1.4;
          min-height: 38px;
          overflow-y: hidden;
        }

        .toolbar-comment-input textarea::placeholder {
          color: #666;
        }

        .comment-input-actions {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #e5e5e5;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .save-btn {
          background: #3b82f6;
          color: white;
        }

        .save-btn:hover {
          background: #2563eb;
        }

        .action-btn svg {
          width: 14px;
          height: 14px;
        }

        /* Comment hover tooltip */
        .comment-hover-tooltip {
          position: absolute;
          padding: 8px 12px;
          background: #1a1a1a;
          color: #e5e5e5;
          font-size: 13px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          max-width: 250px;
          z-index: 1000;
        }

        .comment-hover-tooltip p {
          margin: 0;
          line-height: 1.4;
        }

        /* Comments Sidebar */
        .comments-sidebar {
          width: 260px;
          background: var(--bg-muted);
          border-left: 1px solid var(--border-color);
          padding: 16px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto;
        }

        .comments-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
        }

        .comment-count {
          background: rgba(0, 0, 0, 0.05);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          color: var(--text-secondary);
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comment-item {
          background: white;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }

        .comment-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
        }

        .comment-quoted-text {
          font-size: 11px;
          color: var(--text-tertiary);
          font-style: italic;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 160px;
          padding-right: 8px;
        }

        .comment-text {
          font-size: 13px;
          color: var(--text-primary);
          line-height: 1.5;
          word-break: break-word; /* Ensure long words break */
        }

        .comment-actions {
          display: flex;
          gap: 4px;
          opacity: 0.6;
          transition: opacity 0.15s;
        }

        .comment-item:hover .comment-actions {
          opacity: 1;
        }

        .comment-actions button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .comment-actions button:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--text-primary);
        }

        .comment-actions button svg {
          width: 12px;
          height: 12px;
        }

        .comment-edit-form textarea {
          width: 100%;
          min-height: 60px;
          padding: 0;
          font-size: 13px;
          color: var(--text-primary);
          background: transparent;
          border: none;

          resize: none;
          outline: none;
          font-family: inherit;
          line-height: 1.4;
        }

        .comment-edit-form textarea:focus {
          border: none;
          background: transparent;
          box-shadow: none;
        }

        .comment-edit-actions {
          display: flex;
          gap: 6px;
          margin-top: 8px;
          justify-content: flex-end;
        }

        .comment-edit-actions button {
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .comment-edit-actions button:first-child {
          background: #3b82f6;
          color: white;
        }

        .comment-edit-actions button:last-child {
          background: transparent;
          color: var(--text-secondary);
        }

        .comment-edit-actions button:last-child:hover {
          background: rgba(0, 0, 0, 0.05);
        }
      `}</style>

      <style jsx global>{`
        .rich-text-comment {
          background: #fde047; /* Yellow highlight */
          text-decoration: underline;
          text-decoration-color: #f97316; /* Orange underline */
          text-decoration-thickness: 2px;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
