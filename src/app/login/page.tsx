import { UserAuthForm } from "@/components/auth/user-auth-form";
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight font-headline">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to sign in to your account
          </p>
        </div>
        <UserAuthForm mode="login" />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="hover:text-brand underline underline-offset-4"
          >
            Sign up
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
