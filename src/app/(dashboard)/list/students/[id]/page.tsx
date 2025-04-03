import Announcements from "@/components/Announcements";
import FormContainer from "@/components/FormContainer";
import StudentResultCard from "@/components/StudentResultCard";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Branch, Student, Result, Subject } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CharacterCertificate from "@/components/charactercertificate";
import MigrationCertificate from "@/components/migrationcertificate"
import MarksSheetCertificate from "@/components/Marksheet";
import DiplomaGenerator from "@/components/diplomait";
import DMC from "@/components/MarksSheetCertificate";
import TranscriptCertificate from "@/components/transcript";

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;


  type StudentWithRelations = Student & {
    branch: Branch & { _count: { lectures: number } };
    semester: { id: number; level: number };
    results: (Result & { subject: Subject | null })[];
  };

  const student :
    StudentWithRelations 
    | null = await prisma.student.findUnique({
    where: { id },
    include: {
      branch: { include: { _count: { select: { lectures: true } } } },
      semester: true,
      results: {
        include: { subject: true },
        where: { subject: { isNot: null } }
      }
    },
  });

  if (!student) {
    return notFound();
  }


  const isGraduatingSemester = student.semesterId === 8;
 const isdiploma = student.semesterId>=6;

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 xl:flex-row bg-gray-50">
      {/* LEFT SECTION */}
      <div className="w-full xl:w-2/3">
        {/* PROFILE SECTION */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-mono">STUDENT DASHBOARD</h1>
          <div className="h-1 w-24 bg-blue-700"></div>
          <p className="text-sm text-gray-500 mt-1">Detailed information and academic records</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* STUDENT PROFILE CARD */}
          <div className="bg-white p-6 rounded-lg shadow-sm flex-1 flex gap-6 border border-gray-100">
            <div className="w-1/3">
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                <Image
                  src={student.img || "/noAvatar.png"}
                  alt={`${student.name} `}
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
                    {student.name}
                  </h1>
                  {(role === "admin" || role === "registrar" || role === "theoryIncharge") && (
                    <FormContainer table="student" type="update" data={student} />
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  <span className="font-medium text-gray-600">Username:</span> {student.username}<br/>
                  <span className="font-medium text-gray-600">Email:</span> {student.email}<br/>
                  <span className="font-medium text-gray-600">Phone:</span> {student.phone}<br/>
                  <span className="font-medium text-gray-600">Father&apos;s Name:</span> {student.fatherName}<br/>
                  <span className="font-medium text-gray-600">Mother&apos;s Name:</span> {student.motherName}
                </p>
              </div>
            </div>
          </div>
          
          {/* STATS CARDS */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* SEMESTER CARD */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-green-50 rounded-lg">
                <Image
                  src="/singleBranch.png"
                  alt="Semester"
                  width={24}
                  height={24}
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {student.semesterId}
                </h2>
                <span className="text-sm text-gray-500">Current Semester</span>
              </div>
            </div>
            
            {/* BRANCH CARD */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-purple-50 rounded-lg">
                <Image
                  src="/singleClass.png"
                  alt="Branch"
                  width={24}
                  height={24}
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {student.branch.name}
                </h2>
                <span className="text-sm text-gray-500">Branch</span>
              </div>
            </div>
           
          </div>
        </div>
        
        {/* RESULTS SECTION */}
        <div className="bg-white p-4 rounded-lg shadow-md mt-6">
          <h2 className="text-lg font-semibold mb-6 text-white text-center bg-blue-500 p-2 rounded-md">Academic Results</h2>
          <div className="max-h-[600px] overflow-y-auto">
            <StudentResultCard student={student} results={student.results} />
          </div>
        </div>
      </div>
      
      {/* RIGHT SECTION */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        {/* SHORTCUTS PANEL */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-2 text-white text-center bg-blue-500 p-2 rounded-md">Quick navigation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-3">
            <Link
              className="p-3 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-2 text-purple-700 font-medium"
              href={`/list/teachers?branchId=${student.branch.id}`}
            >
              <div className="w-6 h-6 flex items-center justify-center bg-purple-100 rounded-full">
                <Image src="/singleBranch.png" alt="" width={14} height={14} />
              </div>
              Student&apos;s Teachers
            </Link>
            <Link
              className="p-3 rounded-md bg-yellow-50 hover:bg-yellow-100 transition-colors flex items-center gap-2 text-yellow-700 font-medium"
              href={`/list/results?studentId=${student.id}`}
            >
              <div className="w-6 h-6 flex items-center justify-center bg-yellow-100 rounded-full">
                <Image src="/singleLesson.png" alt="" width={14} height={14} />
              </div>
              Student&apos;s Results
            </Link>
            
            {/* Certificates section - only show when semester = 8 */}
            
              <>
                <div className="col-span-1 md:col-span-2 xl:col-span-1 mt-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-700">Certificates & Documents</h3>
                  <div className="h-0.5 w-full bg-gray-100 my-2"></div>
                </div>
                {isGraduatingSemester && (
                <div className="p-3 rounded-md bg-green-50 hover:bg-green-100 transition-colors flex items-center gap-2 text-green-700 font-medium">
                  <div className="w-6 h-6 flex items-center justify-center bg-green-100 rounded-full">
                    <Image src="/singleBranch.png" alt="" width={14} height={14} />
                  </div>
                  <CharacterCertificate student={student} />
                </div>
                )}
                {isGraduatingSemester && (
                <div className="p-3 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-2 text-blue-700 font-medium">
                  <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full">
                    <Image src="/singleBranch.png" alt="" width={14} height={14} />
                  </div>
                  <MigrationCertificate student={student} />
                </div>
                )}
                <div className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors flex items-center gap-2 text-pink-700 font-medium">
                  <div className="w-6 h-6 flex items-center justify-center bg-pink-100 rounded-full">
                    <Image src="/singleClass.png" alt="" width={14} height={14} />
                  </div>
                  <MarksSheetCertificate student={student} />
                </div>
                <div className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors flex items-center gap-2 text-pink-700 font-medium">
                  <div className="w-6 h-6 flex items-center justify-center bg-pink-100 rounded-full">
                    <Image src="/singleClass.png" alt="" width={14} height={14} />
                  </div>
                  <DMC student={student} />
                </div>
                {isdiploma && (
                <div className="p-3 rounded-md bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-2 text-indigo-700 font-medium">
                  <div className="w-6 h-6 flex items-center justify-center bg-indigo-100 rounded-full">
                    <Image src="/singleClass.png" alt="" width={14} height={14} />
                  </div>
                  <DiplomaGenerator student={student} />
                </div>
                )}
                {isGraduatingSemester && (
                <div className="p-3 rounded-md bg-amber-50 hover:bg-amber-100 transition-colors flex items-center gap-2 text-amber-700 font-medium">
                  <div className="w-6 h-6 flex items-center justify-center bg-amber-100 rounded-full">
                    <Image src="/singleClass.png" alt="" width={14} height={14} />
                  </div>
                  <TranscriptCertificate student={student} />
                </div>
                )}
              </>
            
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

export default SingleStudentPage;