// Use env-configured API base or fall back to same-origin /api when deployed
const defaultApi = typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api';
const CORE_API_BASE = (import.meta.env.VITE_CORE_API_URL || defaultApi).replace(/\/$/, '');

const buildError = async (response) => {
  try {
    const data = await response.json();
    return data?.message || 'Neznáma chyba z core služby';
  } catch (error) {
    return 'Neznáma chyba z core služby';
  }
};

export const fetchCompanyProfile = async (slug) => {
  if (!slug) {
    throw new Error('Chýba identifikátor firmy (slug)');
  }

  const normalizedSlug = slug.trim().toLowerCase();
  const response = await fetch(`${CORE_API_BASE}/companies/public/${normalizedSlug}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(await buildError(response));
  }

  const payload = await response.json();
  return payload?.data?.company;
};

export default CORE_API_BASE;
