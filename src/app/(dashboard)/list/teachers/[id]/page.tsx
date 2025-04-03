// import Announcements from "@/components/Announcements";
// import BigCalendarContainer from "@/components/BigCalendarContainer";
// import BigCalendar from "@/components/BigCalender";
// import FormContainer from "@/components/FormContainer";
// import prisma from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import { Teacher } from "@prisma/client";
// import Image from "next/image";
// import Link from "next/link";
// import { notFound } from "next/navigation";

// const SingleTeacherPage = async ({
//   params: { id },
// }: {
//   params: { id: string };
// }) => {
//   const { sessionClaims } = auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   const teacher:
//     | (Teacher & {
//         _count: { subjects: number; lectures: number; branches: number };
//       })
//     | null = await prisma.teacher.findUnique({
//     where: { id },
//     include: {
//       _count: {
//         select: {
//           subjects: true,
//           lectures: true,
//           branches: true,
//         },
//       },
//     },
//   });

//   if (!teacher) {
//     return notFound();
//   }
//   return (
//     <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
//       {/* LEFT */}
//       <div className="w-full xl:w-2/3">
//         {/* TOP */}
//         <div className="flex flex-col lg:flex-row gap-4">
//           {/* USER INFO CARD */}
//           <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
//             <div className="w-1/3">
//               <Image
//                 src={teacher.img || "/noAvatar.png"}
//                 alt=""
//                 width={144}
//                 height={144}
//                 className="w-36 h-36 rounded-full object-cover"
//               />
//             </div>
//             <div className="w-2/3 flex flex-col justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <h1 className="text-xl font-semibold">
//                   {teacher.name + " " + teacher.surname}
//                 </h1>
//                 {role === "admin" && (
//                   <FormContainer table="teacher" type="update" data={teacher} />
//                 )}
//               </div>
//               <p className="text-sm text-gray-500">
//                 Username - {teacher.username}<br/>
//                 Email - {teacher.email}<br/>
//               </p>
//               <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
//                 <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
//                   <Image src="/blood.png" alt="" width={14} height={14} />
//                   <span>{teacher.bloodType}</span>
//                 </div>
//                 <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
//                   <Image src="/date.png" alt="" width={14} height={14} />
//                   <span>
//                     {new Intl.DateTimeFormat("en-GB").format(teacher.birthday)}
//                   </span>
//                 </div>
//                 <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
//                   <Image src="/mail.png" alt="" width={14} height={14} />
//                   <span>{teacher.email || "-"}</span>
//                 </div>
//                 <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
//                   <Image src="/phone.png" alt="" width={14} height={14} />
//                   <span>{teacher.phone || "-"}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* SMALL CARDS */}
//           <div className="flex-1 flex gap-4 justify-between flex-wrap">
//             {/* CARD */}
//             <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
//               <Image
//                 src="/singleAttendance.png"
//                 alt=""
//                 width={24}
//                 height={24}
//                 className="w-6 h-6"
//               />
//               <div className="">
//                 <h1 className="text-xl font-semibold">90%</h1>
//                 <span className="text-sm text-gray-400">Attendance</span>
//               </div>
//             </div>
//             {/* CARD */}
//             <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
//               <Image
//                 src="/singleBranch.png"
//                 alt=""
//                 width={24}
//                 height={24}
//                 className="w-6 h-6"
//               />
//               <div className="">
//                 <h1 className="text-xl font-semibold">
//                   {teacher._count.subjects}
//                 </h1>
//                 <span className="text-sm text-gray-400">Branches</span>
//               </div>
//             </div>
//             {/* CARD */}
//             <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
//               <Image
//                 src="/singleLesson.png"
//                 alt=""
//                 width={24}
//                 height={24}
//                 className="w-6 h-6"
//               />
//               <div className="">
//                 <h1 className="text-xl font-semibold">
//                   {teacher._count.lessons}
//                 </h1>
//                 <span className="text-sm text-gray-400">Lessons</span>
//               </div>
//             </div>
//             {/* CARD */}
//             <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
//               <Image
//                 src="/singleClass.png"
//                 alt=""
//                 width={24}
//                 height={24}
//                 className="w-6 h-6"
//               />
//               <div className="">
//                 <h1 className="text-xl font-semibold">
//                   {teacher._count.branches}
//                 </h1>
//                 <span className="text-sm text-gray-400">Branches</span>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* BOTTOM */}
//         <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
//           <h1>Teacher&apos;s Schedule</h1>
//           <BigCalendarContainer type="teacherId" id={teacher.id} />
//         </div>
//       </div>
//       {/* RIGHT */}
//       <div className="w-full xl:w-1/3 flex flex-col gap-4">
//         <div className="bg-white p-4 rounded-md">
//           <h1 className="text-xl font-semibold">Shortcuts</h1>
//           <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
//            <Link
//               className="p-3 rounded-md bg-lamaSkyLight"
//               href={`/list/branches?supervisorId=${teacher.id}`}
//             >
//               Teacher&apos;s Branches
//             </Link>
//             <Link
//               className="p-3 rounded-md bg-lamaPurpleLight"
//               href={`/list/students?teacherId=${teacher.id}`}
//             >
//               Teacher&apos;s Students
//             </Link>
//             <Link
//               className="p-3 rounded-md bg-lamaYellowLight"
//               href={`/list/lessons?teacherId=${teacher.id}`}
//             >
//               Teacher&apos;s Lessons
//             </Link>
//             <Link
//               className="p-3 rounded-md bg-pink-50"
//               href={`/list/exams?teacherId=${teacher.id}`}
//             >
//               Teacher&apos;s Exams
//             </Link>
//             <Link
//               className="p-3 rounded-md bg-lamaSkyLight"
//               href={`/list/assignments?teacherId=${teacher.id}`}
//             >
//               Teacher&apos;s Assignments
//             </Link>
//           </div>
//         </div>
//         <Announcements />
//       </div>
//     </div>
//   );
// };

// export default SingleTeacherPage;

import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleTeacherPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const teacher:
    | (Teacher & {
        _count: { subjects: number; lectures: number; branches: number };
      })
    | null = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subjects: true,
          lectures: true,
          branches: true,
        },
      },
    },
  });

  if (!teacher) {
    return notFound();
  }
  
  return (
    <div className="flex-1 p-6 flex flex-col gap-6 xl:flex-row bg-gray-50">
      {/* LEFT SECTION */}
      <div className="w-full xl:w-2/3">
        {/* PROFILE SECTION */}
        <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 font-mono">TEACHER DASHBOARD</h1>
        <div className="h-1 w-24 bg-blue-700"></div>
        <p className="text-sm text-gray-500 mt-1">Detailed information and schedule</p>
      </div>
          
       
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* TEACHER PROFILE CARD */}
          <div className="bg-white p-6 rounded-lg shadow-sm flex-1 flex gap-6 border border-gray-100">
            <div className="w-1/3">
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                <Image
                  src={teacher.img || "/noAvatar.png"}
                  alt={`${teacher.name} `}
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-xl font-semibold text-gray-800">
                    {teacher.name }
                  </h1>
                  {role === "admin" && (
                    <FormContainer table="teacher" type="update" data={teacher} />
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  <span className="font-medium text-gray-600">Username:</span> {teacher.username}<br/>
                  <span className="font-medium text-gray-600">Email:</span> {teacher.email}
                </p>
              </div>
            </div>
          </div>
          
          {/* STATS CARDS */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
           
            
            {/* BRANCHES CARD */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-green-50 rounded-lg">
                <Image
                  src="/singleBranch.png"
                  alt="Branches"
                  width={24}
                  height={24}
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {teacher._count.subjects}
                </h2>
                <span className="text-sm text-gray-500">Subject Count</span>
              </div>
            </div>
            
           
            {/* BRANCH CARD */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-yellow-50 rounded-lg">
                <Image
                  src="/singleClass.png"
                  alt="Classes"
                  width={24}
                  height={24}
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {teacher._count.branches}
                </h2>
                <span className="text-sm text-gray-500">Assigned Branches</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* SCHEDULE CALENDAR
        <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-6 text-white text-center bg-blue-500 p-2 rounded-md"> Teachers Schedule</h2>
          <BigCalendarContainer type="teacherId" id={teacher.id} />
        </div> */}
      </div>
      
      {/* RIGHT SECTION */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        {/* SHORTCUTS PANEL */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-2 text-white text-center bg-blue-500 p-2 rounded-md">Quick navigation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-3">
            <Link
              className="p-3 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-2 text-blue-700 font-medium"
              href={`/list/branches`}
            >
              <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full">
                <Image src="/singleBranch.png" alt="" width={14} height={14} />
              </div>
              Teacher&apos;s Branches
            </Link>
            <Link
              className="p-3 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-2 text-purple-700 font-medium"
              href={`/list/students?teacherId=${teacher.id}`}
            >
              <div className="w-6 h-6 flex items-center justify-center bg-purple-100 rounded-full">
                <Image src="/singleBranch.png" alt="" width={14} height={14} />
              </div>
              Teacher&apos;s Students
            </Link>
            
            <Link
              className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors flex items-center gap-2 text-pink-700 font-medium"
              href={`/list/exams?teacherId=${teacher.id}`}
            >
              <div className="w-6 h-6 flex items-center justify-center bg-pink-100 rounded-full">
                <Image src="/singleClass.png" alt="" width={14} height={14} />
              </div>
              Teacher&apos;s Exams
            </Link>
            
          </div>
        </div>
        
        {/* ANNOUNCEMENTS PANEL */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2 text-white text-center bg-blue-500 p-2 rounded-md">Announcements</h2>
            <Announcements />
          </div>
         
        </div>
      </div>
    </div>
  );
};

export default SingleTeacherPage;