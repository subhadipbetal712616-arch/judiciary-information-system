/**
 * Input — labeled form input with optional error text.
 * Forwards props straight to <input>.
 */
export default function Input({ label, error, id, className = '', ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input id={id} className="input" {...rest} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
