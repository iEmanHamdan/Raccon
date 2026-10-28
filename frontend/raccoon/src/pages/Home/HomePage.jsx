import AppNavbar from "../../components/layout/AppNavbar";
export default function HomePage() {
  return (
    <div dir="rtl">
      <AppNavbar />

      <section className="home-page">
        <h1>هلا بك في راكون</h1>
        <p>من هنا تبدأ مغامرتك.</p>
      </section>
    </div>
  );
}
