import DocumentUploader from '../DocumentUploader';
import {
  REQUIRED_DOCUMENT_TYPES,
  OPTIONAL_DOCUMENT_TYPES,
  DOCUMENT_LABELS,
} from '../../schemas/agentSchemas';

const DESCRIPTIONS = {
  business_registration: 'Official document showing your business is registered.',
  license: 'Your travel/tourism business license.',
  identity: 'Owner or authorized representative ID (passport / national ID).',
  other: 'Any additional supporting document.',
};

export default function DocumentsStep({ documents = [], disabled }) {
  const byType = (type) => documents.filter((d) => d.type === type);

  const requiredUploaded = REQUIRED_DOCUMENT_TYPES.every(
    (t) => byType(t).length > 0
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-600">
        Upload clear scans or photos. Required documents must be provided
        before you can submit.
      </p>

      {REQUIRED_DOCUMENT_TYPES.map((type) => (
        <DocumentUploader
          key={type}
          type={type}
          label={DOCUMENT_LABELS[type]}
          description={DESCRIPTIONS[type]}
          existingDocs={byType(type)}
          disabled={disabled}
          required
        />
      ))}

      {OPTIONAL_DOCUMENT_TYPES.map((type) => (
        <DocumentUploader
          key={type}
          type={type}
          label={DOCUMENT_LABELS[type]}
          description={DESCRIPTIONS[type]}
          existingDocs={byType(type)}
          disabled={disabled}
        />
      ))}

      {!requiredUploaded && (
        <p className="text-xs text-danger">
          All required documents must be uploaded to continue.
        </p>
      )}
    </div>
  );
}