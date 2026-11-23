/**
 * Select — labeled form select with an options array.
 * `options`: string[] | {value, label}[]
 */
export default function Select({ label, error, id, options = [], className = '', ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <select id={id} className="input" {...rest}>
        <option value="">— Select —</option>
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
