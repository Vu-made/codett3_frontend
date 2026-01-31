"use client" ;
import { ReactNode } from "react";

 

export default function User( { children } : Readonly<{ children : ReactNode }>){
    return (
        <div className="flex w-full h-full overflow-auto  bg-[#f3f3f3] ">
            {children}
        </div>  
    );
};