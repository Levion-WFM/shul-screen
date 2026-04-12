"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  countdown: number;
}

/**
 * ErrorBoundary — catches React render crashes
 * Shows a gold-themed error message and auto-reloads after 15 seconds
 */
export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, countdown: 15 };
  }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true, countdown: 15 };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ShulScreen] Render crash:", error, info.componentStack);
  }

  componentDidUpdate(_: unknown, prevState: ErrorBoundaryState) {
    if (this.state.hasError && !prevState.hasError) {
      this.timer = setInterval(() => {
        this.setState((s) => {
          if (s.countdown <= 1) {
            window.location.reload();
            return s;
          }
          return { ...s, countdown: s.countdown - 1 };
        });
      }, 1000);
    }
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="w-screen h-screen flex flex-col items-center justify-center"
          style={{ background: "#0a0a1a" }}
        >
          <div
            className="text-center p-8 rounded-lg"
            style={{
              border: "2px solid #d4af37",
              background: "#111128",
              maxWidth: 500,
            }}
          >
            <div className="text-2xl font-bold mb-4" style={{ color: "#f5e6a3" }}>
              מתאושש...
            </div>
            <div className="text-sm mb-4" style={{ color: "#c9a84c" }}>
              המסך יתרענן אוטומטית בעוד {this.state.countdown} שניות
            </div>
            <div
              className="w-full h-1 rounded-full overflow-hidden"
              style={{ background: "#1a1a3a" }}
            >
              <div
                className="h-full transition-all duration-1000"
                style={{
                  width: `${((15 - this.state.countdown) / 15) * 100}%`,
                  background: "linear-gradient(90deg, #8b7225, #f5e6a3)",
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
