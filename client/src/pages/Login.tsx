import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type SyntheticEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function Form() {
  const {
    login: performLogin,
    signup: performSignup,
    isLoggingIn,
    isSigningUp,
    loginError,
    signupError,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isLoading = isLoggingIn || isSigningUp;
  const error = isSignup ? signupError : loginError;

  const handleAuth = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSignup) {
      performSignup({ email, password, name });
    } else {
      performLogin({ email, password });
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
          <h1 className="font-display mb-10 bg-linear-to-tr from-[#6A7D13] to-[#839B1A] bg-clip-text text-7xl font-semibold tracking-wide text-transparent select-none">
            utang!
          </h1>
          <h2 className="font-heading text-2xl font-bold tracking-wide select-none">
            {title}
          </h2>
          <p className="mb-7 text-xs text-gray-500 select-none">{subtitle}</p>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(error as AxiosError<{ error: string }>).response?.data?.error ||
                error.message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleAuth} className="w-full">
          {isSignup && (
            <Field className="mb-5 w-full">
              <FieldLabel>Name</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </Field>
          )}

          <Field className="mb-5 w-full">
            <FieldLabel>Email</FieldLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </Field>

          <Field
            className={
              isSignup ? "relative mb-10 w-full" : "relative mb-5 w-full"
            }
          >
            <FieldLabel>Password</FieldLabel>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </Field>

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
            className="w-full rounded-xl bg-[#839B1A] py-6 text-white select-none hover:scale-101 hover:bg-[#6A7D13] active:scale-99 disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              mainActionLabel
            )}
          </Button>
        </form>

        <footer className="mt-8 w-full text-center text-sm text-gray-500 select-none">
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
