"use client";

import Image from "next/image";
import md5 from "crypto-js/md5";
import api from "@/lib/api";
import { useEffect, useState } from "react";

interface UserAvatarProps {
  username?: string;
  email?: string;
  size?: number;
  className?: string;
}

export default function UserAvatar({
  username,
  email: initialEmail,
  size = 40,
  className = "",
}: UserAvatarProps) {
  const [email, setEmail] = useState(initialEmail ?? "anonymous@system");

  useEffect(() => {
    if (!initialEmail && username) {
      (async () => {
        try {
          const user = await api.get(`/user/public/info?option=email&username=${encodeURIComponent(username)}`);
          setEmail(user.data.email || "anonymous@system");
        } catch {
          setEmail("anonymous@system");
        }
      })();
    }
  }, [username, initialEmail]);

  const hash = md5(email.trim().toLowerCase()).toString();
  const avatarUrl = `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;

  return (
    <Image
      src={avatarUrl}
      alt={`${username || "User"} Avatar`}
      width={size}
      height={size}
      className={`rounded-xl border border-[#ccc] ${className}`}
    />
  );
}
