import axiosInstance from '../../../shared/lib/axios';

export const profileService = {
  async getMine() {
    const { data } = await axiosInstance.get('/profile');
    return data;
  },

  async create(payload, photoFile) {
    const fd = buildProfileFormData(payload, photoFile);
    const { data } = await axiosInstance.post('/profile', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async update(payload, photoFile) {
    const fd = buildProfileFormData(payload, photoFile);
    fd.append('_method', 'PUT'); // Laravel method spoofing for multipart
    const { data } = await axiosInstance.post('/profile', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async updatePhoto(file) {
    const fd = new FormData();
    fd.append('photo', file);
    const { data } = await axiosInstance.post('/profile/photo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async removePhoto() {
    const { data } = await axiosInstance.delete('/profile/photo');
    return data;
  },

  // Public profile
  async getPublic(username) {
    const { data } = await axiosInstance.get(`/u/${encodeURIComponent(username)}`);
    return data;
  },

  // Languages (public)
  async getLanguages() {
    const { data } = await axiosInstance.get('/languages');
    return data;
  },

  // Email change flows
  async initiateEmailChange(newEmail) {
    const { data } = await axiosInstance.post('/profile/email/initiate', {
      new_email: newEmail,
    });
    return data;
  },

  async initiateEmailChangeWithPassword(newEmail, currentPassword) {
    const { data } = await axiosInstance.post(
      '/profile/email/initiate-with-password',
      { new_email: newEmail, current_password: currentPassword }
    );
    return data;
  },

  async verifyCurrentEmailCode(code) {
    const { data } = await axiosInstance.post('/profile/email/verify-current', {
      code,
    });
    return data;
  },

  async verifyNewEmailCode(code) {
    const { data } = await axiosInstance.post('/profile/email/verify-new', {
      code,
    });
    return data;
  },
};

function buildProfileFormData(payload, photoFile) {
  const fd = new FormData();

  Object.entries(payload || {}).forEach(([key, val]) => {
    if (val === undefined || val === null) return;

  if (key === 'language_ids') {
  (Array.isArray(val) ? val : [])
    .map((id) => Number(id))
    .filter((n) => Number.isInteger(n) && n > 0)
    .forEach((id) => fd.append('language_ids[]', id));
  return;
}

    // Skip photo URL — it's read-only and not part of the payload contract.
    if (key === 'profile_photo_url') return;

    fd.append(key, val);
  });

  if (photoFile) fd.append('photo', photoFile);

  return fd;
}