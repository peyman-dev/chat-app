import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const SESSION_COOKIE_NAME = process.env.TOKEN_COOKIE_NAME?.trim() || "chat_app_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const SESSION_BCRYPT_ROUNDS = Number(process.env.SESSION_BCRYPT_ROUNDS ?? 8);
const SESSION_JWT_SECRET = process.env.SESSION_JWT_SECRET ?? "dev-session-secret-change-me";

export type SessionUser = {
  id: number;
  firstName: string;
  lastName: string;
  mobile: string;
  access: string;
  refresh: string;
};

type SessionTokenPayload = JwtPayload & {
  session: SessionUser;
  checksum: string;
};

const normalizePhoneNumber = (value: string) => {
  const normalized = value.trim().replace(/\s+/g, "");

  if (normalized.startsWith("+98")) {
    return `0${normalized.slice(3).replace(/\D+/g, "")}`;
  }

  const digits = normalized.replace(/\D+/g, "");

  if (digits.startsWith("98")) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith("9")) {
    return `0${digits}`;
  }

  return digits;
};

const normalizeName = (value: string | null | undefined) => value?.trim() ?? "";

const buildChecksumSource = (session: SessionUser) => {
  return [
    session.id,
    session.firstName,
    session.lastName,
    session.mobile,
    session.access,
    session.refresh,
  ].join("|");
};

export const createSessionUser = ({
  id,
  first_name,
  last_name,
  phone_number,
  access,
  refresh,
}: {
  id: number;
  first_name: string | null | undefined;
  last_name: string | null | undefined;
  phone_number: string;
  access: string;
  refresh: string;
}): SessionUser => {
  return {
    id,
    firstName: normalizeName(first_name),
    lastName: normalizeName(last_name),
    mobile: normalizePhoneNumber(phone_number),
    access,
    refresh,
  };
};

export const signSessionToken = async (session: SessionUser) => {
  const checksum = await bcrypt.hash(buildChecksumSource(session), SESSION_BCRYPT_ROUNDS);

  return jwt.sign(
    {
      session,
      checksum,
    },
    SESSION_JWT_SECRET,
    {
      expiresIn: SESSION_MAX_AGE_SECONDS,
    },
  );
};

export const validateSessionToken = async (token?: string): Promise<SessionUser | null> => {
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, SESSION_JWT_SECRET) as SessionTokenPayload | string;

    if (typeof payload === "string" || !payload.session || typeof payload.checksum !== "string") {
      return null;
    }

    const isValidChecksum = await bcrypt.compare(buildChecksumSource(payload.session), payload.checksum);
    if (!isValidChecksum) {
      return null;
    }

    return payload.session;
  } catch {
    return null;
  }
};
