import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LEGAL_EFFECTIVE_DATE, LEGAL_TERMS_VERSION } from "@/legal/legalMeta";
import PlatformTypeOnboarding from "@/components/PlatformTypeOnboarding";
import {
  confirmPasswordReset,
  EmailVerificationRequiredError,
  login,
  logout,
  type OrganizationType,
  requestPasswordReset,
  setCompanyOrganizationType,
  signupCompany,
  verifyCompanyEmail,
} from "@/lib/auth";
import { toast } from "sonner";

type LoginMode = "signin" | "signup" | "signupVerify" | "platformSelect" | "forgotRequest" | "forgotConfirm";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<LoginMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [signupCode, setSignupCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [platformType, setPlatformType] = useState<OrganizationType | null>(null);
  const [emailVerifiedForPlatform, setEmailVerifiedForPlatform] = useState(false);

  useEffect(() => {
    if (searchParams.get("verify") === "1") {
      const verifyEmail = searchParams.get("email")?.trim();
      if (verifyEmail) setEmail(verifyEmail);
      setMode("signupVerify");
      setSearchParams({}, { replace: true });
      toast.message("Verify your email before signing in.");
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (mode === "platformSelect" && !emailVerifiedForPlatform) {
      setMode("signupVerify");
      toast.error("Verify your email with the 6-digit code before choosing how you use MovaraHub.");
    }
  }, [mode, emailVerifiedForPlatform]);

  const isSignUp = mode === "signup";
  const isForgotRequest = mode === "forgotRequest";
  const isForgotConfirm = mode === "forgotConfirm";
  const isSignupVerify = mode === "signupVerify";
  const isPlatformSelect = mode === "platformSelect";

  const switchToSignIn = () => {
    setMode("signin");
    setPassword("");
    setResetCode("");
    setSignupCode("");
    setNewPassword("");
    setAcceptedLegal(false);
    setEmailVerifiedForPlatform(false);
    setPlatformType(null);
  };

  const savePlatformType = async () => {
    if (!emailVerifiedForPlatform) {
      setMode("signupVerify");
      return toast.error("Verify your email first, then choose your platform type.");
    }
    if (!platformType || !email.trim()) {
      return toast.error("Please select how you will use the platform");
    }
    setLoading(true);
    try {
      await setCompanyOrganizationType(email.trim(), platformType);
      toast.success("Platform preference saved. You can sign in now.");
      switchToSignIn();
    } catch (err) {
      if (err instanceof EmailVerificationRequiredError) {
        setEmail(err.email);
        setEmailVerifiedForPlatform(false);
        setMode("signupVerify");
        toast.error(err.message);
        return;
      }
      toast.error(err instanceof Error ? err.message : "Failed to save platform type");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isForgotRequest) {
      if (!email.trim()) return toast.error("Email is required");
      setLoading(true);
      try {
        await requestPasswordReset(email.trim());
        toast.success("If that account exists, we sent a 6-digit verification code to the email.");
        setMode("forgotConfirm");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to request password reset");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isForgotConfirm) {
      if (!email.trim()) return toast.error("Email is required");
      if (!/^\d{6}$/.test(resetCode.trim())) {
        return toast.error("Verification code must be 6 digits");
      }
      if (newPassword.length < 8) {
        return toast.error("New password must be at least 8 characters");
      }
      setLoading(true);
      try {
        await confirmPasswordReset(email.trim(), resetCode.trim(), newPassword);
        toast.success("Password changed successfully. Please sign in.");
        switchToSignIn();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reset password");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isSignupVerify) {
      if (!email.trim()) return toast.error("Email is required");
      if (!/^\d{6}$/.test(signupCode.trim())) {
        return toast.error("Verification code must be 6 digits");
      }
      setLoading(true);
      try {
        await verifyCompanyEmail(email.trim(), signupCode.trim());
        setEmailVerifiedForPlatform(true);
        toast.success("Email verified. Tell us how you will use MovaraHub.");
        setPlatformType(null);
        setMode("platformSelect");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Verification failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password) return toast.error("Email and password are required");
    if (isSignUp && !companyName.trim()) return toast.error("Company name is required");
    if (isSignUp && !acceptedLegal) {
      return toast.error("Please read and accept the Terms of Service and Privacy Policy to continue.");
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signupCompany({
            email,
            password,
            companyName: companyName.trim(),
            firstName: firstName.trim() || undefined,
            lastName: lastName.trim() || undefined,
            acceptedTerms: true,
            termsVersion: LEGAL_TERMS_VERSION,
            termsEffectiveDate: LEGAL_EFFECTIVE_DATE,
          });
        toast.success("Account created. Check your email for a 6-digit verification code before signing in.");
        setEmailVerifiedForPlatform(false);
        setMode("signupVerify");
        setPassword("");
        return;
      }

      const session = await login(email, password);
      if (session.role !== "client") {
        logout();
        toast.error("This dashboard is for client (monitoring) accounts only. Guards use the mobile app.");
        return;
      }
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof EmailVerificationRequiredError) {
        setEmail(err.email);
        setMode("signupVerify");
        toast.error(err.message);
        return;
      }
      toast.error(err instanceof Error ? err.message : isSignUp ? "Sign-up failed" : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <Link to="/" className="flex items-center justify-center gap-2">
            <img src="/logo.png" alt="MovaraHub logo" className="h-8 w-8 rounded-md object-cover" />
            <span className="font-semibold">MovaraHub</span>
          </Link>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">
            {isSignUp
              ? "Create company account"
              : isPlatformSelect
                ? "How will you use MovaraHub?"
              : isSignupVerify
                ? "Verify your company email"
              : isForgotRequest
                ? "Forgot password"
                : isForgotConfirm
                  ? "Enter verification code"
                  : "Sign in"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignUp
              ? "Enter your details to create your company account."
              : isPlatformSelect
                ? "This helps us show the right tools in your dashboard after you sign in."
              : isSignupVerify
                ? "Enter the 6-digit code we sent to your email. You must verify before signing in."
              : isForgotRequest
                ? "Enter your email and we will send a 6-digit reset code."
                : isForgotConfirm
                  ? "Use the email code and choose your new password."
                  : "Company admins sign in here. Guards register/sign in in the mobile app."}
          </p>
        </div>

        {isPlatformSelect ? (
          <PlatformTypeOnboarding
            value={platformType}
            onChange={setPlatformType}
            onContinue={savePlatformType}
            loading={loading}
          />
        ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company name</Label>
                <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSignupVerify}
              required
            />
          </div>

          {!isForgotRequest && !isSignupVerify && (
            <div className="space-y-1.5">
              <Label htmlFor={isForgotConfirm ? "newPassword" : "password"}>
                {isForgotConfirm ? "New password" : "Password"}
              </Label>
              <Input
                id={isForgotConfirm ? "newPassword" : "password"}
                type="password"
                value={isForgotConfirm ? newPassword : password}
                onChange={(e) =>
                  isForgotConfirm ? setNewPassword(e.target.value) : setPassword(e.target.value)
                }
                required
              />
            </div>
          )}

          {isForgotConfirm && (
            <div className="space-y-1.5">
              <Label htmlFor="resetCode">Verification code</Label>
              <Input
                id="resetCode"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                inputMode="numeric"
                required
              />
            </div>
          )}

          {isSignupVerify && (
            <div className="space-y-1.5">
              <Label htmlFor="signupCode">Verification code</Label>
              <Input
                id="signupCode"
                value={signupCode}
                onChange={(e) => setSignupCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                inputMode="numeric"
                required
              />
            </div>
          )}

          {isSignUp && (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Checkbox
                id="accept-legal"
                checked={acceptedLegal}
                onCheckedChange={(v) => setAcceptedLegal(v === true)}
                className="mt-0.5"
              />
              <label htmlFor="accept-legal" className="text-sm leading-snug text-muted-foreground">
                I have read and agree to the{" "}
                <Link to="/terms" target="_blank" rel="noreferrer" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" target="_blank" rel="noreferrer" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || (isSignUp && !acceptedLegal)}>
            {loading
              ? isSignUp
                ? "Creating account..."
                : isSignupVerify
                  ? "Verifying..."
                : isPlatformSelect
                  ? "Saving..."
                : isForgotRequest
                  ? "Sending code..."
                  : isForgotConfirm
                    ? "Changing password..."
                    : "Signing in..."
              : isSignUp
                ? "Create account"
                : isSignupVerify
                  ? "Verify email"
                : isForgotRequest
                  ? "Send verification code"
                  : isForgotConfirm
                    ? "Change password"
                    : "Sign in"}
          </Button>
        </form>
        )}

        <p className="mt-4 text-center text-sm">
          {isForgotRequest || isForgotConfirm || isSignupVerify || isPlatformSelect ? (
            <button onClick={switchToSignIn} className="text-muted-foreground underline-offset-4 hover:underline">
              Back to sign in
            </button>
          ) : (
            <button
              onClick={() => {
                if (!isSignUp) setAcceptedLegal(false);
                setMode(isSignUp ? "signin" : "signup");
              }}
              className="text-muted-foreground underline-offset-4 hover:underline"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          )}
        </p>

        {mode === "signin" && (
          <p className="mt-2 text-center text-sm">
            <button onClick={() => setMode("forgotRequest")} className="text-muted-foreground underline-offset-4 hover:underline">
              Forgot password?
            </button>
          </p>
        )}
        {mode === "forgotConfirm" && (
          <p className="mt-2 text-center text-sm">
            <button onClick={() => setMode("forgotRequest")} className="text-muted-foreground underline-offset-4 hover:underline">
              Resend code
            </button>
          </p>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/privacy" className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
            Privacy
          </Link>
          <span className="mx-2 text-border">·</span>
          <Link to="/terms" className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
            Terms
          </Link>
          <span className="mx-2 text-border">·</span>
          <Link to="/" className="underline-offset-4 hover:underline">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}