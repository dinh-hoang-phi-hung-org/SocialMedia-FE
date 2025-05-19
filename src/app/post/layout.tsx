import MainLayout from "@/shared/components/MainLayout/MainLayout";

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
