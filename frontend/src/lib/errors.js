export function extractErrors(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status === 419) {
    return {
      _general: ['Your session expired. Please refresh the page and try again.'],
    };
  }
  if (status === 429) {
    return {
      _general: ['Too many attempts. Please wait a minute and try again.'],
    };
  }
  if (!data) {
    return { _general: ['Network error. Please check your connection and try again.'] };
  }
  if (data.errors && typeof data.errors === 'object') {
    return data.errors;
  }
  if (data.message) {
    return { _general: [data.message] };
  }
  return { _general: ['An unexpected error occurred. Please try again.'] };
}

export function firstGeneral(errors) {
  return errors?._general?.[0] || null;
}