import toast, { Toaster } from 'react-hot-toast';

export const notify = {
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
  info: (msg) => toast(msg),
};

export const ToastHost = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3500,
      style: {
        background: 'rgb(var(--surface))',
        color: 'rgb(var(--ink))',
        border: '1px solid rgb(var(--border))',
        borderRadius: '12px',
        fontSize: '14px',
        boxShadow: '0 8px 24px -8px rgba(0,0,0,0.18)',
      },
    }}
  />
);
