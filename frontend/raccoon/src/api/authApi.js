const API_URL = process.env.REACT_APP_API_URL;

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(userData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error("Registration failed");

    error.status = response.status;
    error.detail = data.detail;

    throw error;
  }

  return data;
}
