import AdminLayout from "@/shared/components/MainLayout/AdminLayout";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
    return <AdminLayout>{children}</AdminLayout>;
}
