import { useEffect, useState } from 'react';
import { Pencil, X, Check } from 'lucide-react';
import ProfileField, { inputClass } from './ProfileField';
import PhotoUploader from './PhotoUploader';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import { profileSchema } from '../schemas';
import { extractErrors, firstGeneral } from '../../../lib/errors';

const emptyForm = {
  name: '',
  username: '',
  display_name: '',
  bio: '',
  phone: '',
  date_of_birth: '',
  address_line: '',
  city: '',
  country: '',
  languages: [],
};

function toForm(profile) {
  if (!profile) return emptyForm;
  return {
    name: profile.name || '',
    username: profile.username || '',
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    phone: profile.phone || '',
    date_of_birth: profile.date_of_birth ? profile.date_of_birth.slice(0, 10) : '',
    address_line: profile.address_line || '',
    city: profile.city || '',
    country: profile.country || '',
    languages: profile.languages || [],
  };
}

export default function ProfileForm({ initialProfile, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => toForm(initialProfile));
  const [photo, setPhoto] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [langInput, setLangInput] = useState('');

  useEffect(() => {
    setForm(toForm(initialProfile));
  }, [initialProfile]);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const addLanguage = () => {
    if (!editing) return;
    const v = langInput.trim();
    if (!v || form.languages.includes(v)) return;
    setForm((f) => ({ ...f, languages: [...f.languages, v] }));
    setLangInput('');
  };

  const removeLanguage = (lang) => {
    if (!editing) return;
    setForm((f) => ({ ...f, languages: f.languages.filter((l) => l !== lang) }));
  };

  const startEdit = () => {
    setEditing(true);
    setSavedAt(null);
    setBanner(null);
    setErrors({});
  };

  const cancelEdit = () => {
    setEditing(false);
    setPhoto(null);
    setRemovePhoto(false);
    setErrors({});
    setBanner(null);
    setForm(toForm(initialProfile));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setErrors({});
    setBanner(null);

    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const fe = {};
      for (const issue of parsed.error.issues) fe[issue.path[0]] = issue.message;
      setErrors(fe);
      return;
    }

    const fd = new FormData();
    Object.entries(parsed.data).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (k === 'languages') {
        v.forEach((lang, i) => fd.append(`languages[${i}]`, lang));
      } else {
        fd.append(k, v);
      }
    });
   if (photo) fd.append('photo', photo);
if (removePhoto && !photo) fd.append('remove_photo', '1');

    try {
      await onSave(fd);
      setSavedAt(new Date());
      setEditing(false);
      setPhoto(null);
      setRemovePhoto(false);
    } catch (err) {
      const errs = extractErrors(err);
      setErrors(errs);
      setBanner(firstGeneral(errs));
    }
  };

  const disabled = !editing;

  return (
    <form onSubmit={submit} className="space-y-6">
      {banner && <Alert variant="error">{banner}</Alert>}
      {savedAt && !editing && (
        <Alert variant="success">
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Profile saved successfully.
          </span>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {editing ? 'Update your details and click Save.' : 'Click Edit to make changes.'}
        </p>
        {!editing ? (
          <Button type="button" variant="secondary" onClick={startEdit}>
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={cancelEdit}>
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Check className="w-4 h-4" />
              Save changes
            </Button>
          </div>
        )}
      </div>

      <PhotoUploader
        currentUrl={removePhoto ? null : initialProfile?.photo_url}
        onFileSelected={(f) => {
          if (!editing) return;
          setRemovePhoto(false);
          setPhoto(f);
        }}
        onRemove={() => {
          setPhoto(null);
          setRemovePhoto(true);
        }}
        uploading={saving}
        disabled={disabled}
      />
     <div className="grid sm:grid-cols-2 gap-4">
        <ProfileField label="Display name" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            disabled={disabled}
            className={inputClass(errors.name, disabled)}
            placeholder="Jane Doe"
          />
        </ProfileField>

        <ProfileField label="Username" error={errors.username}>
          <input
            type="text"
            value={form.username}
            onChange={set('username')}
            disabled={disabled}
            className={inputClass(errors.username, disabled)}
            placeholder="your_username"
          />
        </ProfileField>


        <ProfileField label="Phone" error={errors.phone}>
          <input
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            disabled={disabled}
            className={inputClass(errors.phone, disabled)}
            placeholder="+92 300 1234567"
          />
        </ProfileField>

        <ProfileField label="Date of birth" error={errors.date_of_birth}>
          <input
            type="date"
            value={form.date_of_birth}
            onChange={set('date_of_birth')}
            disabled={disabled}
            className={inputClass(errors.date_of_birth, disabled)}
          />
        </ProfileField>

        <ProfileField label="City" error={errors.city}>
          <input
            type="text"
            value={form.city}
            onChange={set('city')}
            disabled={disabled}
            className={inputClass(errors.city, disabled)}
          />
        </ProfileField>

        <ProfileField label="Country" error={errors.country}>
          <input
            type="text"
            value={form.country}
            onChange={set('country')}
            disabled={disabled}
            className={inputClass(errors.country, disabled)}
          />
        </ProfileField>

        <ProfileField label="Address" error={errors.address_line}>
          <input
            type="text"
            value={form.address_line}
            onChange={set('address_line')}
            disabled={disabled}
            className={inputClass(errors.address_line, disabled)}
          />
        </ProfileField>
      </div>

      <ProfileField label="Bio" hint="20–1000 characters" error={errors.bio}>
        <textarea
          rows={4}
          value={form.bio}
          onChange={set('bio')}
          disabled={disabled}
          className={inputClass(errors.bio, disabled)}
          placeholder="Tell people about yourself…"
        />
      </ProfileField>

      <ProfileField label="Languages" error={errors.languages}>
        <div className="flex gap-2">
          <input
            type="text"
            value={langInput}
            onChange={(e) => setLangInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLanguage();
              }
            }}
            disabled={disabled}
            className={inputClass(false, disabled)}
            placeholder="Add language"
          />
          <Button type="button" variant="secondary" onClick={addLanguage} disabled={disabled}>
            Add
          </Button>
        </div>
        {form.languages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.languages.map((l) => (
              <span
                key={l}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 text-brand-800 text-xs font-semibold px-3 py-1"
              >
                {l}
                {editing && (
                  <button
                    type="button"
                    onClick={() => removeLanguage(l)}
                    className="text-brand-700 hover:text-brand-900"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </ProfileField>
    </form>
  );
}