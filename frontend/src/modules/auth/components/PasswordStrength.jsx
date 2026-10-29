export default function PasswordStrength({ password = '' }) {
  const score = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const labels = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'];
  const colors = ['bg-danger', 'bg-danger', 'bg-yellow-500', 'bg-primary', 'bg-success'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded ${
              i < score ? colors[score - 1] : 'bg-ink-200'
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-ink-500">{labels[score]}</p>
    </div>
  );
}