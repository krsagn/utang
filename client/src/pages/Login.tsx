// React
import { useState, type SyntheticEvent } from "react";

// Types
import type { SignupCredentials, LoginCredentials } from "@/types";

// External libraries
import { AxiosError } from "axios";

// UI Components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Icons
import { Eye, EyeClosed, DangerCircle } from "@solar-icons/react";

// Contexts
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";

function Form() {
  const {
    login: performLogin,
    signup: performSignup,
    isLoggingIn,
    isSigningUp,
    loginError,
    signupError,
  } = useAuth();

  const [signupDetails, setSignupDetails] = useState<SignupCredentials>({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [loginDetails, setLoginDetails] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const isLoading = isLoggingIn || isSigningUp;
  const error = isSignup ? signupError : loginError;

  const handleAuth = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSignup) {
      performSignup(signupDetails);
    } else {
      performLogin(loginDetails);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isSignup) {
      setSignupDetails((prev) => ({ ...prev, [name]: value }));
    } else {
      setLoginDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const title = isSignup ? "Create Account" : "Welcome back!";
  const subtitle = isSignup
    ? "Join utang! and start tracking your debts."
    : "Fill in your credentials to continue.";
  const mainActionLabel = isSignup ? "Sign Up" : "Login";
  const toggleText = isSignup
    ? "Already have an account?"
    : "Don't have an account?";
  const toggleLink = isSignup ? "Sign in" : "Sign up";

  return (
    <section className="flex shrink-0 items-center justify-center px-40 text-left">
      <div className="flex w-xs min-w-[320px] flex-col items-start">
        <header>
          <h1 className="font-display to-primary mb-10 bg-linear-to-tr from-[#6A7D13] bg-clip-text text-7xl font-semibold tracking-wide text-transparent select-none">
            utang!
          </h1>
          <h2 className="font-heading text-2xl font-bold tracking-wide select-none">
            {title}
          </h2>
          <p className="mb-7 text-xs tracking-wide text-black/50 select-none">
            {subtitle}
          </p>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <DangerCircle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(error as AxiosError<{ error: string }>).response?.data?.error ||
                error.message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleAuth} className="w-full">
          {isSignup ? (
            // Signup Form Fields
            <>
              <div className="mb-5 flex gap-4">
                <Field className="w-full">
                  <Input
                    name="firstName"
                    value={signupDetails?.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    aria-label="First Name"
                    required
                  />
                </Field>
                <Field className="w-full">
                  <Input
                    name="lastName"
                    value={signupDetails?.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    aria-label="Last Name"
                    required
                  />
                </Field>
              </div>

              <Field className="mb-5 w-full">
                <Input
                  name="username"
                  value={signupDetails?.username}
                  onChange={handleChange}
                  placeholder="Username"
                  aria-label="Username"
                  required
                />
              </Field>

              <Field className="mb-5 w-full">
                <Input
                  type="email"
                  name="email"
                  value={signupDetails?.email}
                  onChange={handleChange}
                  placeholder="Email"
                  aria-label="Email"
                  required
                />
              </Field>

              <Field className="relative mb-10 w-full">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={signupDetails?.password}
                    onChange={handleChange}
                    placeholder="Password"
                    aria-label="Password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-black/50 hover:text-black/75 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeClosed className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </Field>
            </>
          ) : (
            // Login Form Fields
            <>
              <Field className="mb-5 w-full">
                <Input
                  type="email"
                  name="email"
                  value={loginDetails?.email}
                  onChange={handleChange}
                  placeholder="Email"
                  aria-label="Email"
                  required
                />
              </Field>

              <Field className="relative mb-5 w-full">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginDetails?.password}
                    onChange={handleChange}
                    placeholder="Password"
                    aria-label="Password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-black/50 hover:text-black/75 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeClosed className="-mb-2 size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </Field>
            </>
          )}

          {!isSignup && (
            <Field orientation="horizontal" className="mb-10">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="cursor-pointer text-sm">
                Remember me
              </Label>
            </Field>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl py-6 select-none hover:scale-101 hover:bg-[#6A7D13] active:scale-99 disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 size-3" />
                Please wait
              </>
            ) : (
              mainActionLabel
            )}
          </Button>
        </form>

        <footer className="mt-8 w-full text-center text-sm select-none">
          {toggleText}{" "}
          <span
            className="cursor-pointer font-bold text-[#6A7D13] hover:underline"
            onClick={() => setIsSignup(!isSignup)}
          >
            {toggleLink}
          </span>
        </footer>
      </div>
    </section>
  );
}

function Illustration() {
  return (
    <aside className="relative flex-1 self-stretch overflow-hidden rounded-3xl bg-black">
      <img
        src="/illustration.webp"
        alt="Utang Illustration"
        className="h-full w-full object-cover opacity-100"
      />
      {/* Add an overlay for better contrast with the Login form */}
      <div className="absolute bottom-0 flex h-1/2 w-full items-end justify-center bg-linear-to-t from-black/75 to-transparent p-8">
        <div className="flex w-full items-center gap-5">
          <div className="ml-2 w-full border-b border-white/50" />
          <p className="text-md shrink-0 font-light tracking-wider text-white select-none">
            Track who owes you, and who you owe.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default function Login() {
  return (
    <main className="flex h-screen w-full items-stretch gap-10 overflow-hidden overscroll-none p-3">
      <Form />
      <Illustration />
    </main>
  );
}
