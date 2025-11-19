/**
 * Get authentication headers for API requests
 * Includes Authorization header with Bearer token if available
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Get authentication headers without Content-Type
 * Useful for FormData requests where browser sets Content-Type
 */
export const getAuthHeadersWithoutContentType = () => {
  const token = localStorage.getItem("access_token");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
