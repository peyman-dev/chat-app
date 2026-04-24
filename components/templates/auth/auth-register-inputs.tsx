import AuthNameInput from "@/components/templates/auth/auth-name-input";
import MobileInput from "@/components/templates/auth/mobile-input";

type AuthRegisterInputsProps = {
  firstName: string;
  lastName: string;
  mobile: string;
  firstNameError: string;
  lastNameError: string;
  mobileError: string;
  isPending: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onMobileChange: (value: string) => void;
};

const AuthRegisterInputs = ({
  firstName,
  lastName,
  mobile,
  firstNameError,
  lastNameError,
  mobileError,
  isPending,
  onFirstNameChange,
  onLastNameChange,
  onMobileChange,
}: AuthRegisterInputsProps) => {
  return (
    <div className="space-y-4">
      <AuthNameInput
        label="نام"
        value={firstName}
        onChange={onFirstNameChange}
        disabled={isPending}
        error={firstNameError}
        autoComplete="given-name"
      />

      <AuthNameInput
        label="نام خانوادگی"
        value={lastName}
        onChange={onLastNameChange}
        disabled={isPending}
        error={lastNameError}
        autoComplete="family-name"
      />

      <MobileInput
        value={mobile}
        onChange={onMobileChange}
        disabled={isPending}
        error={mobileError}
        showSubmitButton={false}
      />
    </div>
  );
};

export default AuthRegisterInputs;
