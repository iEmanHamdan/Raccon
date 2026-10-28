const API_URL = process.env.REACT_APP_API_URL;

// Register
export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json", // tell the server the data is json
    },

    body: JSON.stringify(userData), // convert userData obj to json
  });

  const data = await response.json().catch(() => ({})); // read the server response as json . if the response is not json or empty will return {} function

  if (!response.ok) {
    const error = new Error("Registration failed");

    error.status = response.status; // 400
    error.detail = data.detail;

    throw error; // to catch it by catch
  }

  return data; // after success
}

//Login
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

// Logout
export async function logoutUser(accessToken) {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}

// userData with token
export async function getCurrentUser(accessToken) {
  const response = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error("Failed to fetch user profile");
    error.status = response.status;
    throw error;
  }

  return data;
}

// Shared helper for the password reset calls (JSON in, JSON out)
async function postJson(path, body, errorMessage) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(errorMessage);

    error.status = response.status;
    error.detail = data.detail; // e.g. "Invalid reset token" (expired, used or broken link)
    throw error;
  }

  return data;
}

// forgot-password: same answer whether the email has an account or not
export function requestPasswordReset(email) {
  return postJson("/auth/forgot-password", { email }, "Forgot password failed");
}

// reset-password: save the new password (the link stops working after this)
export function resetPassword({ token, newPassword }) {
  return postJson(
    "/auth/reset-password",
    { token, new_password: newPassword },
    "Reset password failed",
  );
}

//change-password
//delete-account
