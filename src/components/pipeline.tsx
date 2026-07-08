// The Workflow Graph — Brancr's signature visual motif. Its product IS
// systems thinking, so this diagram (not a stock illustration) recurs across
// the site. Two forms:
//   <Pipeline>     vertical, staged panel used as the hero centerpiece; pass
//                  `live` for the sequential illuminate animation.
//   <FlowStrip>    a compact horizontal chain for method / flywheel sections.

type Node = { label: string; meta?: string };

export function Pipeline({
  title,
  badge,
  nodes,
  live = false,
}: {
  title?: string;
  badge?: string;
  nodes: Node[];
  live?: boolean;
}) {
  return (
    <div className="pipeline-panel">
      {(title || badge) && (
        <div className="pipeline-panel-head">
          {title && <span className="pipeline-panel-title">{title}</span>}
          {badge && (
            <span className="pipeline-badge">
              <span className="pulse" />
              {badge}
            </span>
          )}
        </div>
      )}
      <div className={`pipeline${live ? " is-live" : ""}`}>
        {nodes.map((n, i) => {
          const isFinal = i === nodes.length - 1;
          return (
            <span key={n.label} className="flow-node-wrap">
              <div
                className={`pnode${isFinal ? " is-final" : ""}${!live && isFinal ? " is-active" : ""}`}
                style={live ? { animationDelay: `${i * 0.55}s` } : undefined}
              >
                <span className="pnode-dot" style={live ? { animationDelay: `${i * 0.55}s` } : undefined} />
                {n.label}
                {n.meta && <span className="pnode-meta">{n.meta}</span>}
              </div>
              {!isFinal && (
                <span className="pconnector" aria-hidden>
                  <svg viewBox="0 0 12 20" fill="none">
                    <path d="M6 0v14M2 11l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function FlowStrip({ steps }: { steps: string[] }) {
  return (
    <div className="flow-strip">
      {steps.map((step, i) => {
        const isFinal = i === steps.length - 1;
        return (
          <span key={step} className="flow-node-wrap">
            <span className={`flow-node${isFinal ? " emphasis" : ""}`}>
              <span className="fn-dot" />
              {step}
            </span>
            {!isFinal && (
              <span className="flow-link" aria-hidden>
                <svg viewBox="0 0 22 9" fill="none">
                  <path d="M0 4.5h17M13 1l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
