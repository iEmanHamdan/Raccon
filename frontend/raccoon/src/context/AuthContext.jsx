import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "../api/users/usersApi";

const AuthContext = createContext(null);
const TOKEN_KEY = "raccoon_access_token";

// معرّف محلي يفصل كاش كل جلسة.
// لا نضع التوكن نفسه داخل queryKey.
function createSession(token) {
  return {
    token,
    key: crypto.randomUUID(),
  };
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const [session, setSession] = useState(() =>
    createSession(sessionStorage.getItem(TOKEN_KEY)),
  );

  // نوقف طلب الحساب بعد حذفه، مع إبقاء رسالة النجاح مفتوحة.
  const [accountDeleted, setAccountDeleted] = useState(false);

  const accessToken = session.token;
  const profileKey = ["profile", session.key];

  const profileQuery = useQuery({
    queryKey: profileKey,

    queryFn: ({ signal }) => getCurrentUser(accessToken, { signal }),

    enabled: Boolean(accessToken) && !accountDeleted,

    staleTime: 60_000,

    // لا نكرر طلب الجلسة الفاشل تلقائيًا.
    retry: false,
  });

  const unauthorized =
    profileQuery.error?.status === 401 || profileQuery.error?.status === 403;

  const user =
    accessToken && !unauthorized ? (profileQuery.data ?? null) : null;

  const isRestoring =
    Boolean(accessToken) && profileQuery.isPending && !accountDeleted;

  // فشل التحديث الخلفي لا يخفي حسابًا سبق تحميله بنجاح.
  const restoreError =
    accessToken &&
    !accountDeleted &&
    !unauthorized &&
    profileQuery.isError &&
    !profileQuery.data
      ? "تعذر التحقق من جلسة الدخول. حاول مرة أخرى."
      : "";

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);

    // نلغي الطلبات القديمة ونزيل بيانات الحساب من الكاش.
    void queryClient.cancelQueries({
      queryKey: ["profile"],
    });

    queryClient.removeQueries({
      queryKey: ["profile"],
    });

    setAccountDeleted(false);
    setSession(createSession(null));
  }, [queryClient]);

  // الجلسة غير صالحة: ننظفها.
  // أخطاء الشبكة و500 لا تُعامل كتسجيل خروج.
  useEffect(() => {
    if (unauthorized) {
      clearSession();
    }
  }, [unauthorized, clearSession]);

  function signIn(token, userData) {
    const nextSession = createSession(token);

    void queryClient.cancelQueries({
      queryKey: ["profile"],
    });

    queryClient.removeQueries({
      queryKey: ["profile"],
    });

    sessionStorage.setItem(TOKEN_KEY, token);

    // LoginPage وRegisterPage يجلبان المستخدم بالفعل.
    // نستفيد من النتيجة بدل إرسال طلب إضافي مباشرة.
    queryClient.setQueryData(["profile", nextSession.key], userData);

    setAccountDeleted(false);
    setSession(nextSession);
  }

  async function updateUser(updatedUser) {
    // يمنع استجابة GET أقدم من الكتابة فوق نتيجة التعديل.
    await queryClient.cancelQueries({
      queryKey: profileKey,
      exact: true,
    });

    queryClient.setQueryData(profileKey, updatedUser);
  }

  async function markAccountDeleted() {
    sessionStorage.removeItem(TOKEN_KEY);

    setAccountDeleted(true);

    await queryClient.cancelQueries({
      queryKey: profileKey,
      exact: true,
    });

    // نبقي البيانات المعروضة مؤقتًا خلف نافذة نجاح الحذف.
    // عند إغلاقها، close() تستدعي clearSession وتمسح الباقي.
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isRestoring,
        restoreError,
        signIn,
        clearSession,
        updateUser,
        markAccountDeleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
