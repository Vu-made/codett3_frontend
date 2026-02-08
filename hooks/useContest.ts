"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export interface Contest {
    id: string;
    title: string;
    description: string;
    start_time: string;
    time_mode:string;
    realtime_rank:boolean;
    use_password:boolean;
    end_time: string;
    is_public: boolean;
    problems?: { id: string; title: string }[]; 
}

export function useContest() {
    const [contest, setContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContest = async () => {
            try {
                const res = await api.get(`/contest/`, { withCredentials: true });
                // console.log(res.data);
                setContest(res.data);
            } catch{
                setContest(null);
            } finally {
                setLoading(false);
            }
        };

        fetchContest();
    }, []);

    const updateContest = (data: Contest) => {
        localStorage.setItem(`contest_${data.id}`, JSON.stringify(data));
        setContest(data);
    };

    const clearContest = () => {
        if (contest?.id) localStorage.removeItem(`contest_${contest.id}`);
        setContest(null);
    };

    return { contest, loading, updateContest, clearContest };
}
