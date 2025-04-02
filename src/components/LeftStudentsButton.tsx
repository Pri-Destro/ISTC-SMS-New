"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const LeftStudentsButton = () => {
  const searchParams = useSearchParams();
  const showLeft = searchParams.get("showLeft") === "true";
  
  // Clone the current search params
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    
    // Reset to page 1 when changing filters
    params.set("page", "1");
    
    return params.toString();
  };

  return (
    <Link
      href={`/list/students?${createQueryString("showLeft", showLeft ? "false" : "true")}`}
      className={`flex items-center justify-center p-2 ${
        showLeft ? "bg-blue-500 hover:bg-blue-600" : "bg-purple-500 hover:bg-purple-600"
      } text-white rounded px-4`}
    >
      {showLeft ? "Show Active Students" : "Show Left Students"}
    </Link>
  );
};

export default LeftStudentsButton;