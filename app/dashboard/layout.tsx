import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <DashboardSidebar />
      <div style={{ flex: 1, marginLeft: 224 }}>
        {children}
      </div>
    </div>
  );
}