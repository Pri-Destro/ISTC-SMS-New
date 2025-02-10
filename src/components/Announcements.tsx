import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const Announcements = async () => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Define the conditions based on user role
  const roleConditions = {
    teacher: { lectures: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    // Registrar and Admin have global access, so no specific conditions
    registrar: {},
    admin: {},
  };

  const whereConditions: any =
  role !== "admin" && role !== "registrar"
    ? {
        OR: [
          { branchId: null }, // Public announcements
          role === "teacher"
            ? { branch: { lectures: { some: { teacherId: userId! } } } } // Teacher's branches
            : role === "student"
            ? { branch: { students: { some: { id: userId! } } } } // Student's branch
            : {},
        ],
      }
    : {}; // Admin and Registrar see all
  // Fetch the announcements
  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { title: "desc" },
    where: whereConditions, // Apply the refactored whereConditions
  });
  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <Link href={"/list/announcements"}><span className="text-xs text-gray-400">View All</span></Link>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {data[0] && (
          <div className="bg-lamaSkyLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[0].title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(data[0].date)}
              </span>
            </div>
          </div>
        )}
        {data[1] && (
          <div className="bg-lamaPurpleLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[1].title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(data[1].date)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{data[1].title}</p>
          </div>
        )}
        {data[2] && (
          <div className="bg-lamaYellowLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{data[2].title}</h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(data[2].date)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{data[2].title}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
