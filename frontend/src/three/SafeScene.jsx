import { Component } from 'react';
import { Suspense } from 'react';

/**
 * SafeScene — keeps a 3D failure from ever blanking the page.
 * Catches WebGL / R3F runtime errors and renders a brand-tuned
 * CSS aura fallback instead. Also suspends async children.
 */
class Boundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    /* swallow — fallback handles UX */
  }
  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export default function SafeScene({ children, fallback = null, className = '' }) {
  return (
    <Boundary
      fallback={
        fallback ?? (
          <div className={`aura-bg ${className}`} aria-hidden="true" />
        )
      }
    >
      <Suspense fallback={fallback ?? <div className={`aura-bg ${className}`} aria-hidden="true" />}>
        {children}
      </Suspense>
    </Boundary>
  );
}
