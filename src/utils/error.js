export const getErrorMessage = (err, defaultMessage = 'An error occurred') => {
  const data = err?.response?.data;
  if (data?.validationErrors && Array.isArray(data.validationErrors) && data.validationErrors.length > 0) {
    return data.validationErrors
      .map(item => {
        if (item.field) {
          // Capitalize field name
          const fieldName = item.field.charAt(0).toUpperCase() + item.field.slice(1);
          // If the message already contains the field name, just show the message
          if (item.message.toLowerCase().includes(item.field.toLowerCase())) {
            return item.message;
          }
          return `${fieldName}: ${item.message}`;
        }
        return item.message;
      })
      .join('\n');
  }
  return data?.message || defaultMessage;
};
