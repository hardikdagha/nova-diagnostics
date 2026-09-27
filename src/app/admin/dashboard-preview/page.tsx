import { notFound } from "next/navigation";
import AdminDashboardPage from "../dashboard/page";

export default function AdminDashboardPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <AdminDashboardPage />;
}
