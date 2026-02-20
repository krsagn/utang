import { LoginForm } from "@/features/auth";

export function Login() {
  return (
    <main className="flex h-screen w-full items-stretch gap-10 overflow-hidden overscroll-none p-3">
      <LoginForm />
      <Illustration />
    </main>
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
