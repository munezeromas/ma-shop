import toast from 'react-hot-toast';
import React from 'react';

export default function confirmToast({ title = 'Confirm', description = '', confirmText = 'Confirm', cancelText = 'Cancel' } = {}) {
  return new Promise((resolve) => {
    const content = (idRef) =>
      React.createElement(
        'div',
        { className: 'p-3 max-w-md' },
        React.createElement('div', { className: 'font-semibold' }, title),
        description ? React.createElement('div', { className: 'text-sm text-gray-600 mt-1' }, description) : null,
        React.createElement(
          'div',
          { className: 'mt-3 flex justify-end gap-2' },
          React.createElement(
            'button',
            {
              onClick: () => {
                toast.dismiss(idRef.id);
                toast('Cancelled', { icon: '✖️' });
                resolve(false);
              },
              className: 'px-3 py-1 rounded bg-gray-100 text-sm',
            },
            cancelText
          ),
          React.createElement(
            'button',
            {
              onClick: () => {
                toast.dismiss(idRef.id);
                resolve(true);
              },
              className: 'px-3 py-1 rounded bg-red-600 text-white text-sm',
            },
            confirmText
          )
        )
      );

    const idRef = { id: null };
    idRef.id = toast(() => content(idRef), {
      duration: Infinity,
      position: 'top-center',
    });
  });
}
