import { useState } from 'react';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import RequirementBuilder from './RequirementBuilder';
import { requirementsSchema } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';
import { useSaveRequirements } from '../hooks/useService';

export default function StepRequirements({ service, onSaved }) {
  const [requirements, setRequirements] = useState(
    service?.requirements?.length
      ? service.requirements.map((r) => ({
          title: r.title,
          description: r.description || '',
          answer_type: r.answer_type,
        }))
      : [{ title: '', description: '', answer_type: 'text' }]
  );
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const save = useSaveRequirements(service.uuid);

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);

    const payload = {
      requirements: requirements.map((r) => ({
        title: r.title,
        description: r.description || null,
        answer_type: r.answer_type,
      })),
    };

    const parsed = requirementsSchema.safeParse(payload);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) {
        fe[issue.path[0]] = issue.message;
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
        Define what the customer must provide after checkout. These become the
        customer's requirements form for the booking.
      </p>

      <RequirementBuilder
        value={requirements}
        onChange={setRequirements}
        error={errors.requirements}
      />

      <div className="flex justify-end">
        <Button type="submit" loading={save.isPending}>
          Save & continue
        </Button>
      </div>
    </form>
  );
}