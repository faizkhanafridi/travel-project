import { useState } from 'react';
import Button from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import FileDropzone from './FileDropzone';
import DocumentLink from './DocumentLink';
import { extractErrors, firstGeneral } from '../../../lib/errors';
import { useUploadDocuments } from '../hooks/useAgent';

const REQUIRED = [
  { key: 'business_registration', label: 'Business Registration' },
  { key: 'license', label: 'License' },
  { key: 'identity', label: 'Identity Document' },
];

export default function StepDocuments({ agent, onSaved, readOnly }) {
  const [files, setFiles] = useState({
    business_registration: null,
    license: null,
    identity: null,
  });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const upload = useUploadDocuments();

  const existingByType = {};
  (agent?.documents?.data || agent?.documents || []).forEach((d) => {
    existingByType[d.type] = d;
  });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBanner(null);

    const missing = [];
    REQUIRED.forEach((r) => {
      if (!files[r.key] && !existingByType[r.key]) missing.push(r.key);
    });
    if (missing.length > 0) {
      const fe = {};
      missing.forEach((k) => {
        fe[k] = 'This document is required';
      });
      setErrors(fe);
      return;
    }

    const fd = new FormData();
    Object.entries(files).forEach(([key, file]) => {
      if (file) fd.append(key, file);
    });

    try {
      const result = await upload.mutateAsync(fd);
      onSaved?.(result);
    } catch (err) {
      const errs = extractErrors(err);
      setErrors(errs);
      setBanner(firstGeneral(errs));
    }
  };

  const fieldErr = (k) => {
    const v = errors[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const hasExisting = Object.keys(existingByType).length > 0;

  return (
    <form onSubmit={submit} className="space-y-5">
      {banner && <Alert variant="error">{banner}</Alert>}

      <p className="text-sm text-slate-500">
        Upload clear, legible documents. Each file must be PDF, JPG, PNG, or WEBP
        and no larger than 10 MB.
      </p>

      <div className="space-y-4">
        {REQUIRED.map((r) => (
          <FileDropzone
            key={r.key}
            label={r.label}
            required
            file={files[r.key]}
            existing={existingByType[r.key]}
            onFile={(f) => setFiles((prev) => ({ ...prev, [r.key]: f }))}
            onClear={() => setFiles((prev) => ({ ...prev, [r.key]: null }))}
            error={fieldErr(r.key)}
            disabled={readOnly}
          />
        ))}
      </div>

      {hasExisting && (
        <div>
          <p className="text-sm font-semibold text-slate-900 mb-2">
            Uploaded documents
          </p>
          <ul className="space-y-2">
            {Object.values(existingByType).map((d) => (
              <DocumentLink key={d.uuid} doc={d} />
            ))}
          </ul>
        </div>
      )}

      {existingByType.business_registration?.locked && (
        <Alert variant="info">
          Approved documents are view-only and cannot be replaced.
        </Alert>
      )}

      {!readOnly && (
        <div className="flex justify-end">
          <Button type="submit" loading={upload.isPending}>
            Save & continue
          </Button>
        </div>
      )}
    </form>
  );
}