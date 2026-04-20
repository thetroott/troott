import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IForm, IRegisterFormErrors } from "@/utils/interfaces.util";
import { Eye, EyeOffIcon, Loader2, LockIcon, Mail, User } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { usePasswordUtils } from "@/hooks/shared/useValidaton";
import type { RegisterUserDTO } from "@/dtos/auth.dto";
import { useRegisterStore } from "@/store/register-store";


const RegisterForm = (data: IForm) => {
  const { className, ...props } = data;
  const {
    formData,
    errors,
    touched,
    showPassword,
    passwordStrength,
    setField,
    setTouched,
    setErrors,
    togglePassword,
    setPasswordStrength,
  } = useRegisterStore();

  const { validateName, validateEmail, validatePassword, calculateStrength } =
    usePasswordUtils();
    
  const { Register } = useAuth();

  const validators = {
    firstName: (value: string) => validateName(value, "First Name"),
    lastName: (value: string) => validateName(value, "Last Name"),
    email: validateEmail,
    password: validatePassword,
  };

  const validateForm = () => {
    const newErrors: IRegisterFormErrors = {};
    (Object.keys(validators) as Array<keyof typeof validators>).forEach(
      (field) => {
        const error = validators[field](
          formData[field as keyof typeof validators]
        );
        if (error) newErrors[field] = error;
      }
    );
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange =
    (field: keyof Omit<RegisterUserDTO, "userType">) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setField(field, value);

      if (field === "password") {
        setPasswordStrength(calculateStrength(value));
      }

      if (errors[field]) {
        setErrors({ [field]: undefined });
      }
    };

  const handleBlur = (field: keyof typeof validators) => () => {
    // mark the field as touched
    setTouched(field, true);

    // validate field and update error
    const error = validators[field](formData[field]);
    setErrors({ [field]: error });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // mark all fields touched
    (Object.keys(validators) as Array<keyof typeof validators>).forEach(
      (field) => setTouched(field, true)
    );

    if (!validateForm()) return;

    await Register.mutate(formData);
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4 items-start">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">First name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange("firstName")}
                onBlur={handleBlur("firstName")}
                className={cn(
                  "pl-10",
                  "h-12",
                  errors.firstName &&
                    touched.firstName &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={
                  errors.firstName && touched.firstName ? "true" : "false"
                }
                aria-describedby={
                  errors.firstName && touched.firstName
                    ? "firstName-error"
                    : undefined
                }
              />
            </div>

            {errors.firstName && touched.firstName && (
              <p
                id="firstName-error"
                className="text-sm min-h-[20px] text-destructive mt-1"
                role="alert"
              >
                {errors.firstName}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange("lastName")}
                onBlur={handleBlur("lastName")}
                className={cn(
                  "pl-10",
                  "h-12",
                  errors.lastName &&
                    touched.lastName &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={
                  errors.lastName && touched.lastName ? "true" : "false"
                }
                aria-describedby={
                  errors.lastName && touched.lastName
                    ? "lastName-error"
                    : undefined
                }
              />
            </div>

            {errors.lastName && touched.lastName && (
              <p
                id="lastName-error"
                className="text-sm min-h-[20px] text-destructive mt-1"
                role="alert"
              >
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={formData.email}
              onChange={handleInputChange("email")}
              onBlur={handleBlur("email")}
              className={cn(
                "pl-9",
                "pr-10",
                "h-12",
                errors.email &&
                  touched.email &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={errors.email && touched.email ? "true" : "false"}
              aria-describedby={
                errors.email && touched.email ? "email-error" : undefined
              }
            />
          </div>
          {errors.email && touched.email && (
            <p
              id="email-error"
              className="text-sm text-destructive mt-1"
              role="alert"
            >
              {errors.email}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange("password")}
              onBlur={handleBlur("password")}
              className={cn(
                "pl-9",
                "pr-10",
                "h-12",
                errors.password &&
                  touched.password &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={
                errors.password && touched.password ? "true" : "false"
              }
              aria-describedby={
                errors.password && touched.password
                  ? "password-error"
                  : undefined
              }
            />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={togglePassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      passwordStrength.score === 0 && "w-0",
                      passwordStrength.score === 1 && "w-1/5 bg-red-500",
                      passwordStrength.score === 2 && "w-2/5 bg-orange-500",
                      passwordStrength.score === 3 && "w-3/5 bg-yellow-500",
                      passwordStrength.score === 4 && "w-4/5 bg-blue-500",
                      passwordStrength.score === 5 && "w-full bg-green-500"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    passwordStrength.score <= 1 && "text-red-500",
                    passwordStrength.score === 2 && "text-orange-500",
                    passwordStrength.score === 3 && "text-yellow-600",
                    passwordStrength.score === 4 && "text-blue-500",
                    passwordStrength.score === 5 && "text-green-500"
                  )}
                >
                  {passwordStrength.label}
                </span>
              </div>

              {passwordStrength.feedback.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <p className="mb-1">Password needs:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {passwordStrength.feedback.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {errors.password && touched.password && (
            <p
              id="password-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.password}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12"
          disabled={Register.isPending}
        >
          {Register.isPending ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        {/* <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full" type="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="mr-2 h-4 w-4"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Signup with Google
        </Button>
        <Button variant="outline" className="w-full" type="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="mr-2 h-4 w-4"
          >
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            />
          </svg>
          Sign up with GitHub
        </Button> */}
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Sign in
        </a>
      </div>
    </form>
  );
};

export default RegisterForm;
