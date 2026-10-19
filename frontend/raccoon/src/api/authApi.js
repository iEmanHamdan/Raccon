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

export async function loginUser({ identifier, password }) {
  const formData = new URLSearchParams();

  formData.append("username", identifier);
  formData.append("password", password);
  formData.append("grant_type", "password");

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },

    body: formData.toString(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error("Login failed");

    error.status = response.status;
    error.detail = data.detail;

    throw error;
  }

  return data;
}
