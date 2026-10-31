import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../../../../shared/components/Input';
import Button from '../../../../shared/components/Button';
import { agencySchema } from '../../schemas/agentSchemas';
import { useSaveAgency } from '../../hooks/useSaveAgency';

export default function AgencyStep({ initial, onSaved, disabled }) {
  const save = useSaveAgency();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      agency_name: initial?.agency_name || '',
      agency_owner_name: initial?.agency_owner_name || '',
      phone: initial?.phone || '',
      country: initial?.country || '',
      city: initial?.city || '',
      address: initial?.address || '',
    },
  });

  const onSubmit = async (values) => {
    const res = await save.mutateAsync(values).catch(() => null);
    if (res) onSaved?.(res.data);
  };

  const apiErr = save.error?.errors;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Agency name"
        required
        error={errors.agency_name?.message || apiErr?.agency_name?.[0]}
        {...register('agency_name')}
        disabled={disabled}
      />
      <Input
        label="Agency owner name"
        required
        error={errors.agency_owner_name?.message || apiErr?.agency_owner_name?.[0]}
        {...register('agency_owner_name')}
        disabled={disabled}
      />
      <Input
        label="Phone"
        error={errors.phone?.message || apiErr?.phone?.[0]}
        {...register('phone')}
        disabled={disabled}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Country"
          required
          error={errors.country?.message || apiErr?.country?.[0]}
          {...register('country')}
          disabled={disabled}
        />
        <Input
          label="City"
          required
          error={errors.city?.message || apiErr?.city?.[0]}
          {...register('city')}
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block mb-1.5 text-sm font-medium text-ink-800">
          Address <span className="text-danger">*</span>
        </label>
        <textarea
          rows={2}
          className={`w-full rounded-lg border bg-white p-3 text-sm focus-ring ${
            errors.address?.message ? 'border-danger' : 'border-ink-300'
          }`}
          disabled={disabled}
                    {...register('address')}
        />
        {errors.address?.message && (
          <p className="mt-1 text-xs text-danger">{errors.address.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={save.isPending} disabled={disabled}>
          Save & continue
        </Button>
      </div>
    </form>
  );
}