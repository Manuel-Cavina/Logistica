import { LoginPageView } from "@/features/auth/pages/login-page";

type LoginPageProps = {
  searchParams?: Promise<{
    registered?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;

  return <LoginPageView justRegistered={resolvedSearchParams?.registered === "1"} />;
}
