import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { profileSchema } from "../schemas/profileSchemas";
import LanguagePicker from "./LanguagePicker";
import ProfilePhotoUploader from "./ProfilePhotoUploader";
import { useLanguages } from "../hooks/useLanguages";

export default function ProfileForm({
  defaultValues,
  onSubmit,
  submitting,
  submitLabel = "Save profile",
  onCancel,
  onSkip,
  apiError,
  disabledUsername = false,
    onRemovePhoto,  
}) {
  const languagesQuery = useLanguages();

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      display_name: "",
      bio: "",
      phone: "",
      date_of_birth: "",
      address: "",
      language_ids: [],
      photoFile: null,
      ...defaultValues,
    },
  });

useEffect(() => {
    if (defaultValues) {
      reset({ photoFile: null, ...defaultValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(defaultValues)]);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const photoFile = getValues("photoFile");
        const { photoFile: _ignored, ...rest } = values;
        onSubmit(rest, photoFile || null);
      })}
      className="space-y-5"
      noValidate
    >
      <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
          <div className="flex justify-center sm:justify-start">
          <Controller
            control={control}
            name="photoFile"
            render={({ field }) => (
              <ProfilePhotoUploader
                currentUrl={defaultValues?.profile_photo_url}
                onSelect={(file) => field.onChange(file)}
                onRemove={onRemovePhoto}     
              />
            )}
          />
        </div>

        <div className="space-y-4">
          <Input
            label="Username"
            placeholder="your_username"
            disabled={disabledUsername}
            error={errors.username?.message || apiError?.username?.[0]}
            hint={
              disabledUsername
                ? "Username cannot be changed here."
                : "Lowercase letters, numbers, and underscores only."
            }
            required
            {...register("username")}
          />
          <Input
            label="Display name"
            placeholder="How your name appears publicly"
            error={errors.display_name?.message || apiError?.display_name?.[0]}
            required
            {...register("display_name")}
          />
        </div>
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-ink-800">
          Bio <span className="text-danger">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="Tell others a bit about yourself…"
          className={`w-full rounded-lg border bg-white p-3 text-sm focus-ring ${
            errors.bio?.message ? "border-danger" : "border-ink-300"
          }`}
          {...register("bio")}
        />
        {errors.bio?.message && (
          <p className="mt-1 text-xs text-danger">{errors.bio.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Phone"
          placeholder="+1 555 555 5555"
          error={errors.phone?.message || apiError?.phone?.[0]}
          {...register("phone")}
        />
        <Input
          label="Date of birth"
          type="date"
          error={errors.date_of_birth?.message || apiError?.date_of_birth?.[0]}
          {...register("date_of_birth")}
        />
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-ink-800">
          Address
        </label>
        <textarea
          rows={2}
          placeholder="Street, city, country"
          className={`w-full rounded-lg border bg-white p-3 text-sm focus-ring ${
            errors.address?.message ? "border-danger" : "border-ink-300"
          }`}
          {...register("address")}
        />
        {errors.address?.message && (
          <p className="mt-1 text-xs text-danger">{errors.address.message}</p>
        )}
      </div>

      <Controller
        control={control}
        name="language_ids"
        render={({ field }) => (
          <LanguagePicker
            languages={languagesQuery.data?.data || []}
            value={field.value || []}
            onChange={field.onChange}
            loading={languagesQuery.isLoading}
          />
        )}
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        {onSkip && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
        )}
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
