"use client";

import Image from "next/image";
import md5 from "crypto-js/md5";

interface UserAvatarProps {
  email: string;
  size?: number;
  className?: string;
}

export default function UserAvatar({
  email,
  size = 40,
  className = "",
}: UserAvatarProps) {
  const hash = md5(email.trim().toLowerCase()).toString();
  const avatarUrl = `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;

  return (
    <Image
      src={avatarUrl}
      alt="User Avatar"
      width={size}
      height={size}
      className={`rounded-xl border border-[#ccc] ${className}`}
    />
  );
}
