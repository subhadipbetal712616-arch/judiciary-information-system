/**
 * Textarea — labeled textarea with optional error text.
 */
export default function Textarea({ label, error, id, className = '', ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <textarea id={id} className="input" rows={4} {...rest} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
