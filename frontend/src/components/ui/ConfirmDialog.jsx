import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm', tone = 'danger', loading }) => (
  <Modal open={open} onClose={onClose} size="sm" title="" >
    <div className="flex flex-col items-center text-center py-2">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${tone === 'danger' ? 'bg-danger-100 text-danger' : 'bg-amber-50 text-amber-600'}`}>
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
      <div className="mt-6 flex w-full gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button variant={tone === 'danger' ? 'danger' : 'accent'} className="flex-1" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;
