"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

// Lock Icon component matching app style
const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "48px", height: "48px" }}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        router.push("/")
        router.refresh()
      } else {
        setError("Incorrect password")
        setPassword("")
      }
    } catch (err) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <LockIcon />
        </div>
        <h1 className="login-title">Weekly Planner</h1>
        <p className="login-subtitle">Enter password to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="login-input"
            autoFocus
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          padding: var(--space-lg);
        }

        .login-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--space-2xl);
          text-align: center;
          max-width: 360px;
          width: 100%;
          box-shadow: var(--shadow-md);
        }

        .login-icon {
          color: var(--text-muted);
          margin-bottom: var(--space-lg);
          display: flex;
          justify-content: center;
        }

        .login-title {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-xs) 0;
        }

        .login-subtitle {
          font-size: var(--font-size-sm);
          color: var(--text-muted);
          margin: 0 0 var(--space-xl) 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .login-input {
          padding: var(--space-md);
          font-size: var(--font-size-md);
          font-family: var(--font-sans);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
          text-align: center;
          letter-spacing: 4px;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .login-input:focus {
          border-color: var(--accent-primary);
        }

        .login-input::placeholder {
          color: var(--text-muted);
          letter-spacing: normal;
        }

        .login-error {
          color: var(--danger);
          font-size: var(--font-size-sm);
          margin: 0;
        }

        .login-button {
          padding: var(--space-md);
          font-size: var(--font-size-md);
          font-weight: 500;
          font-family: var(--font-sans);
          color: white;
          background: var(--accent-primary);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .login-button:hover {
          background: #1d4ed8;
        }

        .login-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
