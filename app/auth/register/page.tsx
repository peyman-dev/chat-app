import AuthFlow from "@/components/templates/auth/auth-flow";

type RegisterPageProps = {
  searchParams: Promise<{
    phone_number?: string | string[];
  }>;
};

export default async function RegisterPage(props: RegisterPageProps) {
  const searchParams = await props.searchParams;
  const phoneNumber = Array.isArray(searchParams.phone_number)
    ? searchParams.phone_number[0]
    : searchParams.phone_number;

  return <AuthFlow mode="register" initialMobile={phoneNumber ?? ""} />;
}
