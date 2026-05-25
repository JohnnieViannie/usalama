import { apiPrefix } from "@/lib/api";

const KEY = "movara_auth";

export type OrganizationType = "guard_company" | "corporate_security";

export type Session = {
  email: string;
  name: string;
  company: string;
  role: string;
  token: string;
  expiresAt?: number;
  organizationType?: OrganizationType | "";
  corporateSecurityEnabled?: boolean;
};

export type SignupCompanyResult = {
  state: "requires_email_verification";
  email: string;
  requiresEmailVerification: true;
};

/** Thrown when login is blocked until the company email is verified. */
export class EmailVerificationRequiredError extends Error {
  readonly email: string;

  constructor(email: string, message?: string) {
    super(message || "Email not verified. Please verify your email first.");
    this.name = "EmailVerificationRequiredError";
    this.email = email;
  }
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<Session> {
  let res: Response;
  try {
    res = await fetch(`${apiPrefix}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (!res.ok) {
    const t = await res.text();
    let message = "Login failed";
    try {
      const parsed = JSON.parse(t) as {
        detail?: string;
        state?: string;
        email?: string;
      };
      message = parsed.detail || message;
      if (
        res.status === 403 &&
        parsed.state === "requires_email_verification"
      ) {
        throw new EmailVerificationRequiredError(
          parsed.email || email,
          message,
        );
      }
    } catch (err) {
      if (err instanceof EmailVerificationRequiredError) {
        throw err;
      }
      message = t || message;
    }
    throw new Error(message);
  }
  const data = (await res.json()) as {
    user: {
      name: string;
      email: string;
      companyName?: string;
      organizationType?: string;
      corporateSecurityEnabled?: boolean;
    };
    role: string;
    token: string;
    organizationType?: string;
    corporateSecurityEnabled?: boolean;
  };
  const session = buildSessionFromAuth(email, data);
  localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

function buildSessionFromAuth(
  email: string,
  data: {
    user: {
      name: string;
      email: string;
      companyName?: string;
      organizationType?: string;
      corporateSecurityEnabled?: boolean;
    };
    role: string;
    token: string;
    organizationType?: string;
    corporateSecurityEnabled?: boolean;
  },
): Session {
  const orgType = (data.organizationType ||
    data.user.organizationType ||
    "") as Session["organizationType"];
  const corporateEnabled =
    data.corporateSecurityEnabled ?? data.user.corporateSecurityEnabled ?? orgType === "corporate_security";
  return {
    email: data.user.email || email,
    name: data.user.name,
    company: data.user.companyName || "MovaraShiftHub",
    role: data.role,
    token: data.token,
    expiresAt: decodeJwtPayload(data.token)?.exp,
    organizationType: orgType,
    corporateSecurityEnabled: corporateEnabled,
  };
}

export function saveSession(session: Session): void {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export async function setCompanyOrganizationType(
  email: string,
  organizationType: OrganizationType,
): Promise<{ organizationType: OrganizationType; corporateSecurityEnabled: boolean }> {
  let res: Response;
  try {
    res = await fetch(`${apiPrefix}/company-organization-type/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, organizationType }),
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (!res.ok) {
    const t = await res.text();
    let message = "Failed to save platform type";
    try {
      const parsed = JSON.parse(t) as {
        detail?: string;
        state?: string;
        email?: string;
      };
      message = parsed.detail || message;
      if (parsed.state === "requires_email_verification") {
        throw new EmailVerificationRequiredError(parsed.email || email, message);
      }
    } catch (err) {
      if (err instanceof EmailVerificationRequiredError) {
        throw err;
      }
      message = t || message;
    }
    throw new Error(message);
  }
  const data = (await res.json()) as {
    organizationType: OrganizationType;
    corporateSecurityEnabled: boolean;
  };
  return {
    organizationType: data.organizationType,
    corporateSecurityEnabled: data.corporateSecurityEnabled,
  };
}

export function updateSessionOrganization(
  organizationType: OrganizationType,
  corporateSecurityEnabled: boolean,
): Session | null {
  const session = getSession();
  if (!session) return null;
  const updated: Session = {
    ...session,
    organizationType,
    corporateSecurityEnabled,
  };
  saveSession(updated);
  return updated;
}

export async function signupCompany(payload: {
  email: string;
  password: string;
  companyName: string;
  firstName?: string;
  lastName?: string;
  acceptedTerms: boolean;
  termsVersion?: string;
  termsEffectiveDate?: string;
}): Promise<SignupCompanyResult> {
  let res: Response;
  try {
    res = await fetch(`${apiPrefix}/company-signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        companyName: payload.companyName,
        firstName: payload.firstName,
        lastName: payload.lastName,
        acceptedTerms: payload.acceptedTerms,
        termsVersion: payload.termsVersion,
        termsEffectiveDate: payload.termsEffectiveDate,
      }),
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (!res.ok) {
    const t = await res.text();
    let message = "Sign-up failed";
    try {
      const parsed = JSON.parse(t) as { detail?: string };
      message = parsed.detail || message;
    } catch {
      message = t || message;
    }
    throw new Error(message);
  }
  const data = (await res.json()) as {
    state?: "requires_email_verification";
    email?: string;
    requiresEmailVerification?: boolean;
  };
  if (data.state !== "requires_email_verification" || !data.requiresEmailVerification) {
    throw new Error("Sign-up response was invalid. Please try again.");
  }
  return {
    state: "requires_email_verification",
    email: data.email || payload.email,
    requiresEmailVerification: true,
  };
}

export async function verifyCompanyEmail(
  email: string,
  code: string,
  organizationType?: OrganizationType,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${apiPrefix}/company-verify-email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, organizationType }),
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (!res.ok) {
    const t = await res.text();
    let message = "Failed to verify email";
    try {
      const parsed = JSON.parse(t) as { detail?: string };
      message = parsed.detail || message;
    } catch {
      message = t || message;
    }
    throw new Error(message);
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${apiPrefix}/password-reset-request/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (!res.ok) {
    const t = await res.text();
    let message = "Failed to request password reset";
    try {
      const parsed = JSON.parse(t) as { detail?: string };
      message = parsed.detail || message;
    } catch {
      message = t || message;
    }
    throw new Error(message);
  }
}

export async function confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${apiPrefix}/password-reset-confirm/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });
  } catch {
    throw new Error("Network error: unable to reach API server");
  }
  if (!res.ok) {
    const t = await res.text();
    let message = "Failed to reset password";
    try {
      const parsed = JSON.parse(t) as { detail?: string };
      message = parsed.detail || message;
    } catch {
      message = t || message;
    }
    throw new Error(message);
  }
}

export const logout = () => localStorage.removeItem(KEY);

export const getSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Session) : null;
    if (!parsed) return null;
    if (!parsed.token) return null;
    if (parsed.expiresAt && parsed.expiresAt * 1000 <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const requireClientSession = (): Session | null => {
  const s = getSession();
  if (!s || s.role !== "client") {
    logout();
    return null;
  }
  return s;
};

export const requireCorporateSession = (): Session | null => {
  const s = requireClientSession();
  if (!s || !s.corporateSecurityEnabled) {
    return null;
  }
  return s;
};

export function sessionNeedsOrganizationType(session: Session): boolean {
  return !session.organizationType;
}
