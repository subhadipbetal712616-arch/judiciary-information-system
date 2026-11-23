/**
 * Card — a plain container with white background and a subtle border.
 */
export default function Card({ children, className = '', title, action }) {
  return (
    <div className={`card p-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
