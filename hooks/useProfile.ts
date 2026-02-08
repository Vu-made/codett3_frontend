"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
export interface Profile {
    username: string;
    email: string;
    role: string;
    ws_token:string;
    full_name:string;
    contest_is_joining:string;
}

export function useProfile() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/user/profile", { withCredentials: true });
                setProfile(res.data);
            } catch (err) {
                console.log(err);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);


    const updateProfile = (data: Profile) => {
        localStorage.setItem("user", JSON.stringify(data));
        setProfile(data);
    };

    const clearProfile = () => {
        localStorage.removeItem("user");
        setProfile(null);
    };

    return { profile, loading, updateProfile, clearProfile };
}
