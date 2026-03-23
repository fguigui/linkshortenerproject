import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export async function Header() {
  const { userId } = await auth();

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Link Shortener
        </h1>
        <nav className="flex gap-4">
          {userId ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="outline">Sign in</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Sign up</Button>
              </SignUpButton>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
