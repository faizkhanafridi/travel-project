import { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';

export default function AdminRejectModal({ open, onClose, onSubmit, attempt, loading }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (reason.trim().length < 5) {
      setError('At least 5 characters required.');
      return;
    }
    await onSubmit(reason.trim());
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setReason('');
        setError('');
        onClose?.();
      }}
      title={`Reject submission #${attempt ?? 1}`}
    >
      <p className="text-sm text-ink-600">
        Explain what the agent needs to fix.
      </p>
      <textarea
        rows={4}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g., Please upload a clearer copy of your business license."
        className="mt-3 w-full rounded-lg border border-ink-300 bg-white p-3 text-sm focus-ring"
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={submit}
          loading={loading}
        >
          Reject
        </Button>
      </div>
    </Modal>
  );
}