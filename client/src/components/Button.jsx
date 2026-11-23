/**
 * Button — small wrapper around <button> with consistent Tailwind styles.
 * `variant`: 'primary' | 'secondary' | 'danger'
 */
export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  };
  return (
    <button className={`${variants[variant] || variants.primary} ${className}`} {...rest}>
      {children}
    </button>
  );
}
