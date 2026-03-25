import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import {
  GithubIcon,
  GoogleIcon,
  InventoryIcon,
  LockIcon,
} from "@/mock/app/components/Icons";
import useForgotPasswordMutation from "@/mock/lib/apis/mutations/auth/useForgotPasswordMutation/useForgotPasswordMutation";
import { useLoginMutation, useRegisterMutation } from "@lib/apis/mutations";
import { useAuthStore } from "@lib/stores";

interface AuthFormValues {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const navigate = useNavigate();
  const setTokens = useAuthStore(state => state.setTokens);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();

  const mutation = isSignUp ? registerMutation : loginMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthFormValues>();

  const handleToggleMode = () => {
    setIsSignUp(prev => !prev);
    setShowForgotPassword(false);
    setForgotEmail("");
    setForgotMsg("");
    reset();
    loginMutation.reset();
    registerMutation.reset();
    forgotPasswordMutation.reset();
  };

  const handleForgotPassword = () => {
    if (!forgotEmail.trim()) return;
    setForgotMsg("");
    forgotPasswordMutation.mutate(
      { email: forgotEmail.trim() },
      {
        onSuccess: () => {
          setForgotMsg("Password reset link has been sent to your email.");
        },
        onError: () => {
          setForgotMsg("Failed to send reset link. Please try again.");
        },
      },
    );
  };

  const onSubmit = (data: AuthFormValues) => {
    mutation.mutate(data, {
      onSuccess: ({ access_token, refresh_token, expires_in }) => {
        setTokens(access_token, refresh_token, expires_in);
        navigate("/");
      },
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-[2.4rem] selection:bg-primary selection:text-on-primary">
      {/* Brand Header */}
      <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between px-[3.2rem] py-[3.2rem]">
        <div className="flex items-center gap-[0.8rem]">
          <span className="font-headline text-[2rem] font-extrabold tracking-tight text-primary">
            Cognitive Canvas
          </span>
        </div>
        <button
          type="button"
          onClick={handleToggleMode}
          className="font-body text-[1.4rem] text-on-surface-variant transition-colors hover:text-primary">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <span className="font-semibold text-primary">Sign In</span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span className="font-semibold text-primary">Sign Up</span>
            </>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="grid w-full max-w-[96rem] grid-cols-1 items-center gap-[4.8rem] md:grid-cols-12">
        {/* Left Column: Value Prop */}
        <div className="flex flex-col gap-[3.2rem] md:col-span-5">
          <div className="space-y-[1.6rem]">
            <p className="font-headline text-[1.4rem] font-semibold uppercase tracking-[0.2em] text-secondary">
              The Digital Atelier
            </p>
            <h1 className="font-headline text-[4.8rem] font-extrabold leading-tight tracking-tighter text-on-surface md:text-[6rem]">
              Start your{" "}
              <span className="italic text-primary">digital atelier</span>{" "}
              today.
            </h1>
            <p className="max-w-[40rem] font-body text-[1.8rem] leading-relaxed text-on-surface-variant">
              A grounded sanctuary for deep work, cognitive organization, and
              architectural thought. Secure your knowledge vault with AES-256.
            </p>
          </div>

          {/* Bento Mini-Feature Display */}
          <div className="grid grid-cols-2 gap-[1.6rem]">
            <div className="space-y-[1.2rem] rounded-[0.25rem] bg-surface-container-low p-[2.4rem]">
              <LockIcon
                size="2.4rem"
                fill="#9fd0cd"
              />
              <p className="font-headline text-[1.2rem] font-bold uppercase tracking-[0.1em] text-on-surface">
                Vault Security
              </p>
            </div>
            <div className="space-y-[1.2rem] rounded-[0.25rem] bg-surface-container-low p-[2.4rem]">
              <InventoryIcon
                size="2.4rem"
                fill="#ffe2ab"
              />
              <p className="font-headline text-[1.2rem] font-bold uppercase tracking-[0.1em] text-on-surface">
                Neural Archive
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Focus Plate (Auth Form) */}
        <div className="flex justify-center md:col-span-7 md:justify-end">
          <div className="relative w-full max-w-[51.2rem] rounded-[0.5rem] bg-surface-container p-[4rem] shadow-[0px_0px_32px_rgba(0,0,0,0.4)] md:p-[5.6rem]">
            {/* Progress Indicator */}
            {isSignUp && (
              <div className="mb-[4rem] flex gap-[0.8rem]">
                <div className="h-[0.4rem] flex-1 rounded-full bg-primary" />
                <div className="h-[0.4rem] flex-1 rounded-full bg-surface-container-highest" />
                <div className="h-[0.4rem] flex-1 rounded-full bg-surface-container-highest" />
              </div>
            )}

            <div className="mb-[3.2rem] space-y-[0.8rem]">
              <h2 className="font-headline text-[3rem] font-bold text-on-surface">
                {isSignUp ? "Create Your Account" : "Welcome Back"}
              </h2>
              <p className="font-body text-[1.4rem] text-on-surface-variant">
                {isSignUp
                  ? "Step 1 of 3: Identity & Access"
                  : "Sign in to your cognitive workspace"}
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-[2.4rem]">
              <div className="space-y-[0.4rem]">
                <label
                  htmlFor="auth-email"
                  className="block px-[0.4rem] font-headline text-[1.2rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="julian@atelier.digital"
                  {...register("email", { required: true })}
                  className="w-full border-0 border-b-2 border-outline-variant bg-surface-container-highest px-[1.6rem] py-[1.2rem] font-body text-[1.4rem] text-on-surface transition-all placeholder:text-on-surface-variant/30 focus:border-primary focus:outline-none focus:ring-0"
                />
                {errors.email && (
                  <p className="text-[1.2rem] text-error">필수 항목입니다.</p>
                )}
              </div>

              <div className="space-y-[0.4rem]">
                <label
                  htmlFor="auth-password"
                  className="block px-[0.4rem] font-headline text-[1.2rem] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: true })}
                  className="w-full border-0 border-b-2 border-outline-variant bg-surface-container-highest px-[1.6rem] py-[1.2rem] font-body text-[1.4rem] text-on-surface transition-all placeholder:text-on-surface-variant/30 focus:border-primary focus:outline-none focus:ring-0"
                />
                {errors.password && (
                  <p className="text-[1.2rem] text-error">필수 항목입니다.</p>
                )}
              </div>

              {mutation.error && (
                <p className="text-[1.2rem] text-error">
                  {isSignUp
                    ? "회원가입에 실패했습니다. 다시 시도해주세요."
                    : "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요."}
                </p>
              )}

              <div className="pt-[1.6rem]">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full rounded-[0.375rem] bg-linear-to-br from-primary to-primary-container py-[1.6rem] px-[2.4rem] font-headline font-bold text-[1.6rem] text-on-primary shadow-lg shadow-primary/10 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                  {mutation.isPending
                    ? "Processing..."
                    : isSignUp
                      ? "Create Account"
                      : "Sign In"}
                </button>
              </div>

              {!isSignUp && (
                <div className="pt-[1.2rem] text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(prev => !prev)}
                    className="font-body text-[1.3rem] text-secondary transition-colors hover:text-primary">
                    Forgot password?
                  </button>
                </div>
              )}
            </form>

            {/* Forgot Password Form */}
            {showForgotPassword && !isSignUp && (
              <div className="mt-[2.4rem] rounded-[0.375rem] border border-outline-variant/10 bg-surface-container-highest p-[2.4rem]">
                <p className="mb-[1.6rem] font-headline text-[1.4rem] font-semibold text-on-surface">
                  Reset Your Password
                </p>
                <p className="mb-[2rem] text-[1.3rem] text-on-surface-variant">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
                <div className="space-y-[1.6rem]">
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full border-0 border-b-2 border-outline-variant bg-surface-container px-[1.6rem] py-[1.2rem] font-body text-[1.4rem] text-on-surface transition-all placeholder:text-on-surface-variant/30 focus:border-primary focus:outline-none focus:ring-0"
                  />
                  {forgotMsg && (
                    <p
                      className={`text-[1.2rem] ${forgotPasswordMutation.isError ? "text-error" : "text-secondary"}`}>
                      {forgotMsg}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={
                      !forgotEmail.trim() || forgotPasswordMutation.isPending
                    }
                    className="w-full rounded-[0.375rem] bg-primary py-[1.2rem] font-semibold text-on-primary transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                    {forgotPasswordMutation.isPending
                      ? "Sending..."
                      : "Send Reset Link"}
                  </button>
                </div>
              </div>
            )}

            {/* Social Options */}
            <div className="mt-[4rem]">
              <div className="relative mb-[3.2rem] flex items-center">
                <div className="grow border-t border-outline-variant/20" />
                <span className="mx-[1.6rem] shrink-0 font-headline text-[1.2rem] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
                  Or continue with
                </span>
                <div className="grow border-t border-outline-variant/20" />
              </div>

              <div className="grid grid-cols-2 gap-[1.6rem]">
                <button
                  type="button"
                  className="flex items-center justify-center gap-[1.2rem] rounded-[0.375rem] border border-outline-variant/10 bg-surface-container-highest py-[1.2rem] text-on-surface transition-colors hover:bg-surface-bright">
                  <GoogleIcon size="2rem" />
                  <span className="font-body text-[1.4rem] font-medium">
                    Google
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-[1.2rem] rounded-[0.375rem] border border-outline-variant/10 bg-surface-container-highest py-[1.2rem] text-on-surface transition-colors hover:bg-surface-bright">
                  <GithubIcon size="2rem" />
                  <span className="font-body text-[1.4rem] font-medium">
                    GitHub
                  </span>
                </button>
              </div>
            </div>

            {/* Privacy/TOS */}
            <p className="mt-[3.2rem] text-center font-body text-[1rem] uppercase leading-relaxed tracking-[0.1em] text-on-surface-variant/50">
              By continuing, you agree to Cognitive Canvas's{" "}
              <a
                className="underline hover:text-primary"
                href="#">
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                className="underline hover:text-primary"
                href="#">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Background Decorative Elements */}
      <div className="pointer-events-none fixed top-[-10%] right-[-10%] -z-10 h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-10%] left-[-10%] -z-10 h-[30%] w-[30%] rounded-full bg-secondary/5 blur-[100px]" />

      {/* Footer */}
      <footer className="pointer-events-none fixed bottom-0 left-0 z-50 flex w-full items-center justify-between p-[3.2rem]">
        <div className="pointer-events-auto font-body text-[1rem] uppercase tracking-[0.15em] text-on-surface-variant/40">
          © 2024 Cognitive Canvas. Secured by AES-256.
        </div>
        <div className="pointer-events-auto flex gap-[2.4rem]">
          <a
            className="font-body text-[1rem] uppercase tracking-[0.15em] text-on-surface-variant/40 transition-colors hover:text-secondary"
            href="#">
            Support
          </a>
          <a
            className="font-body text-[1rem] uppercase tracking-[0.15em] text-on-surface-variant/40 transition-colors hover:text-secondary"
            href="#">
            Security Architecture
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
