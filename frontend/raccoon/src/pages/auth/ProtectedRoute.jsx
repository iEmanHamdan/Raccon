// Prevent anyone who are not sign in to access to the system
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { accessToken, user, isRestoring, restoreError } = useAuth();

  // Premature Redirect: to prevent the use to route before validate state complated
  // Wait until session restoration finishes
  if (isRestoring) {
    return (
      <p dir="rtl" role="status">
        جارٍ التحقق من جلسة الدخول...
      </p>
    );
  }

  // Temporary server/network failure
  if (restoreError) {
    return (
      <div dir="rtl" role="alert">
        <p>{restoreError}</p>

        <button type="button" onClick={() => window.location.reload()}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // User is not authenticated
  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated and display the site
  return children;
}
