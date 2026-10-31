import { useEffect, useMemo, useState } from 'react';
import Button from '../../../../shared/components/Button';
import BusinessHoursEditor, { normalizeHours } from '../BusinessHoursEditor';
import { useSaveBusinessHours } from '../../hooks/useSaveBusinessHours';
// "HH:MM:SS", "HH:MM:SS.000", "HH:MM AM" → "HH:MM"
function trimToHm(value) {
  if (!value || typeof value !== 'string') return null;
  const m = value.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : null;
}
export default function BusinessHoursStep({ initial, onSaved, disabled }) {
  const save = useSaveBusinessHours();
  const [hours, setHours] = useState(() => normalizeHours(initial));

  useEffect(() => {
    setHours(normalizeHours(initial));
  }, [JSON.stringify(initial)]);

 const error = useMemo(() => {
  for (const h of hours) {
    if (h.is_closed) continue;
    const open = trimToHm(h.open_time);
    const close = trimToHm(h.close_time);
    if (!open || !close) return 'Set open and close times.';
    if (open >= close) return 'Close must be after open.';
  }
  return null;
}, [hours]);
 const onSubmit = async () => {
  if (error) return;

  // Ensure strict H:i before sending — backend requires date_format:H:i.
  const payload = hours.map((h) => ({
    day_of_week: h.day_of_week,
    is_closed: !!h.is_closed,
    open_time: h.is_closed ? null : trimToHm(h.open_time),
    close_time: h.is_closed ? null : trimToHm(h.close_time),
  }));

  const res = await save.mutateAsync(payload).catch(() => null);
  if (res) onSaved?.(res.data);
};
  return (
    <div className="space-y-4">
      <BusinessHoursEditor
        value={hours}
        onChange={setHours}
        disabled={disabled}
      />

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button
          type="button"
          loading={save.isPending}
          onClick={onSubmit}
          disabled={disabled || !!error}
        >
          Save & continue
        </Button>
      </div>
    </div>
  );
}