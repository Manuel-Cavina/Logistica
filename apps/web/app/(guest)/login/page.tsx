import { LoginPageView } from "@/features/auth/pages/login-page";

type LoginPageProps = {
  searchParams?: Promise<{
    registered?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const justRegistered = resolvedSearchParams?.registered === "1";

  return <LoginPageView justRegistered={justRegistered} />;
}
