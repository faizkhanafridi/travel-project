import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useState } from 'react';
import Input from '../../../../shared/components/Input';
import Button from '../../../../shared/components/Button';
import { businessSchema } from '../../schemas/agentSchemas';
import { useSaveBusiness } from '../../hooks/useSaveBusiness';
import { cn } from '../../../../shared/lib/utils';

function TagInput({ label, value = [], onChange, placeholder, disabled }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (value.includes(v)) {
      setInput('');
      return;
    }
    onChange([...value, v]);
    setInput('');
  };
  const remove = (v) => onChange(value.filter((x) => x !== v));

  return (
    <div>
      <label className="block mb-1.5 text-sm font-medium text-ink-800">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 h-10 rounded-lg border border-ink-300 bg-white px-3 text-sm focus-ring"
        />
        <Button type="button" variant="outline" onClick={add} disabled={disabled}>
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-1 text-xs text-primary font-medium"
            >
              {v}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(v)}
                  className="hover:text-danger"
                  aria-label={`Remove ${v}`}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BusinessStep({ initial, onSaved, disabled }) {
  const save = useSaveBusiness();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      business_description: initial?.business_description || '',
      years_in_business: initial?.years_in_business ?? '',
      business_type: initial?.business_type || '',
      registration_information: initial?.registration_information || '',
      website: initial?.website || '',
      social_media: initial?.social_media || [],
      languages: initial?.languages || [],
      specializations: initial?.specializations || [],
    },
  });

  const onSubmit = async (values) => {
    const res = await save.mutateAsync(values).catch(() => null);
    if (res) onSaved?.(res.data);
  };

  const apiErr = save.error?.errors;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="block mb-1.5 text-sm font-medium text-ink-800">
          Business description <span className="text-danger">*</span>
        </label>
        <textarea
          rows={5}
          placeholder="Describe your agency — services, focus, experience…"
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border bg-white p-3 text-sm focus-ring',
            errors.business_description?.message
              ? 'border-danger'
              : 'border-ink-300'
          )}
          {...register('business_description')}
        />
        {errors.business_description?.message && (
          <p className="mt-1 text-xs text-danger">
            {errors.business_description.message}
          </p>
        )}
        <p className="mt-1 text-[11px] text-ink-500">
          50–2,000 characters
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Years in business"
          type="number"
          min={0}
          max={100}
          required
          disabled={disabled}
          error={
            errors.years_in_business?.message || apiErr?.years_in_business?.[0]
          }
          {...register('years_in_business')}
        />
        <Input
          label="Business type"
          required
          disabled={disabled}
          placeholder="e.g., Tour operator, Travel agency"
          error={errors.business_type?.message || apiErr?.business_type?.[0]}
          {...register('business_type')}
        />
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-ink-800">
          Registration information
        </label>
        <textarea
          rows={2}
          placeholder="Any registration numbers, licenses, etc."
          disabled={disabled}
          className="w-full rounded-lg border border-ink-300 bg-white p-3 text-sm focus-ring"
          {...register('registration_information')}
        />
      </div>

      <Input
        label="Website"
        type="url"
        placeholder="https://youragency.com"
        disabled={disabled}
        error={errors.website?.message || apiErr?.website?.[0]}
        {...register('website')}
      />

      <Controller
        control={control}
        name="social_media"
        render={({ field }) => (
          <TagInput
            label="Social media"
            value={field.value}
            onChange={field.onChange}
            placeholder="https://instagram.com/youragency"
            disabled={disabled}
          />
        )}
      />

      <Controller
        control={control}
        name="languages"
        render={({ field }) => (
          <TagInput
            label="Languages"
            value={field.value}
            onChange={field.onChange}
            placeholder="English, Urdu, Arabic…"
            disabled={disabled}
          />
        )}
      />

      <Controller
        control={control}
        name="specializations"
        render={({ field }) => (
          <TagInput
            label="Specializations"
            value={field.value}
            onChange={field.onChange}
            placeholder="Umrah, Family tours, Adventure…"
            disabled={disabled}
          />
        )}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={save.isPending} disabled={disabled}>
          Save & continue
        </Button>
      </div>
    </form>
  );
}