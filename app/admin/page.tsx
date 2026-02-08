"use client";

import api from "@/lib/api";

export default function ADMIN(){
  return (
    <button onClick={async()=>{
      await api.post("/admin/users/disconnect_all");
    }}>
      disconnect all users
    </button>
  )
}