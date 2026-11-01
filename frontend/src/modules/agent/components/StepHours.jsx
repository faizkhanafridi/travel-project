import { useState } from 'react';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import HoursEditor from './HoursEditor';
import { hoursSchema } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';
import { useSaveHours } from '../hooks/useAgent';

function buildInitial(agentHours) {
  const map = new Map();
  (agentHours || []).forEach((h) => map.set(h.day_of_week, h));
  return Array.from({ length: 7 }, (_, i) => {
    const existing = map.get(i);
    return {
      day_of_week: i,
      is_closed: existing?.is_closed ?? (i === 0),
      open_time: existing?.open_time || '09:00',
      close_time: existing?.close_time || '18:00',
    };
  });
}

export default function StepHours({ agent, onSaved, readOnly }) {
  const [hours, setHours] = useState(() => buildInitial(agent?.business_hours?.data || agent?.business_hours));
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const save = useSaveHours();

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);

    const payload = {
      hours: hours.map((h) => ({
        day_of_week: h.day_of_week,
        is_closed: h.is_closed,
        open_time: h.is_closed ? null : h.open_time || null,
        close_time: h.is_closed ? null : h.close_time || null,
      })),
    };

    const parsed = hoursSchema.safeParse(payload);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) {
        const idx = issue.path[1];
        if (idx !== undefined) {
          fe[idx] = fe[idx] || {};
          fe[idx][issue.path[2] || '_'] = issue.message;
        }
      }
      setErrors(fe);
      return;
    }

    try {
      const result = await save.mutateAsync(parsed.data);
      onSaved?.(result);
    } catch (err) {
      const errs = extractErrors(err);
      setBanner(firstGeneral(errs));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {banner && <Alert variant="error">{banner}</Alert>}

      <p className="text-sm text-slate-500">
        Configure your agency's operating hours. Mark days as closed when applicable.
      </p>

      <HoursEditor hours={hours} onChange={setHours} errors={errors} disabled={readOnly} />

      {!readOnly && (
        <div className="flex justify-end">
          <Button type="submit" loading={save.isPending}>
            Save & continue
          </Button>
        </div>
      )}
    </form>
  );
}