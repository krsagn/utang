import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function Form() {
  return (
    <div className="flex shrink-0 items-center justify-center px-40">
      <div className="flex flex-col items-start">
        <h1 className="font-display mb-10 bg-linear-to-tr from-[#6A7D13] to-[#839B1A] bg-clip-text text-7xl font-semibold tracking-wide text-transparent select-none">
          utang!
        </h1>
        <h2 className="font-heading text-2xl font-bold tracking-wide">
          Welcome back!
        </h2>
        <h3 className="mb-7 text-xs">Fill in your credentials to continue.</h3>
        <Field className="mb-5 max-w-xs">
          <FieldLabel>Username</FieldLabel>
          <Input placeholder="Enter your username" />
        </Field>
        <Field className="mb-10 max-w-xs">
          <FieldLabel>Password</FieldLabel>
          <Input placeholder="Enter your password" />
        </Field>
        <Button variant="outline" className="w-xs rounded-xl">
          Login
        </Button>
      </div>
    </div>
  );
}

function Illustration() {
  return (
    <div className="relative flex-1 self-stretch overflow-hidden rounded-3xl bg-black">
      <img
        src="/illustration.png"
        alt="Utang Illustration"
        className="h-full w-full object-cover opacity-100"
      />
      {/* Optional: Add an overlay for better contrast with the Login form */}
      <div className="absolute bottom-0 flex h-1/2 w-full items-end justify-end bg-linear-to-t from-black/75 to-transparent p-6">
        <p className="text-sm font-light tracking-wide text-white">
          Kristian Agena • Full-stack Developer
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div className="flex h-screen w-full items-stretch gap-10 overflow-hidden p-3">
      <Form />
      <Illustration />
    </div>
  );
}
