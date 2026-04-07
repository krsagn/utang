// React
import { useState, type SyntheticEvent } from "react";

// Types
import type { SignupCredentials, LoginCredentials } from "../model/types";

// External libraries
import { AxiosError } from "axios";

// UI shared
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Checkbox,
  Field,
  Input,
  Label,
  Spinner,
} from "@/shared/ui";

import { useLogin } from "../model/useLogin";
import { useSignup } from "../model/useSignup";

const REMEMBERED_EMAIL_KEY = "utang:rememberedEmail";

export function LoginForm() {
  const {
    mutate: performLogin,
    isPending: isLoggingIn,
    error: loginError,
  } = useLogin();
  const {
    mutate: performSignup,
    isPending: isSigningUp,
    error: signupError,
  } = useSignup();

  const [signupDetails, setSignupDetails] = useState<SignupCredentials>({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [loginDetails, setLoginDetails] = useState<LoginCredentials>(() => {
    const rememberedEmail =
      typeof window === "undefined"
        ? ""
        : (localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "");

    return {
      email: rememberedEmail,
      password: "",
    };
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(REMEMBERED_EMAIL_KEY));
  });

  const isLoading = isLoggingIn || isSigningUp;
  const error = isSignup ? signupError : loginError;

  const handleAuth = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSignup) {
      performSignup(signupDetails);
    } else {
      if (rememberMe && loginDetails.email.trim()) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, loginDetails.email.trim());
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

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
          <h1 className="font-display to-incoming from-incoming-dark mb-10 bg-linear-to-tr bg-clip-text text-7xl font-semibold tracking-wide text-transparent select-none">
            utang!
          </h1>
          <h2 className="font-heading text-2xl font-bold tracking-wide select-none">
            {title}
          </h2>
          <p className="text-primary/50 mb-7 text-xs tracking-wide select-none">
            {subtitle}
          </p>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6">
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
                    autoComplete="given-name"
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
                    autoComplete="family-name"
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
                  autoComplete="username"
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
                  autoComplete="email"
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
                    autoComplete="new-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-primary/50 hover:text-primary/75 absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
                  ></button>
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
                  autoComplete="email"
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
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-primary/50 hover:text-primary/75 absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
                  ></button>
                </div>
              </Field>
            </>
          )}

          {!isSignup && (
            <Field orientation="horizontal" className="mb-10">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => {
                  const shouldRemember = checked === true;
                  setRememberMe(shouldRemember);

                  if (!shouldRemember) {
                    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
                  }
                }}
              />
              <Label htmlFor="remember" className="cursor-pointer text-sm">
                Remember me
              </Label>
            </Field>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="hover:bg-incoming-dark w-full rounded-xl py-6 select-none"
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
            className="text-incoming-dark cursor-pointer font-bold hover:underline"
            onClick={() => setIsSignup(!isSignup)}
          >
            {toggleLink}
          </span>
        </footer>
      </div>
    </section>
  );
}
