import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Result, Exam, Student, Prisma, Subject, Branch } from "@prisma/client";
import Image from "next/image";
import StudentResultDownload from "@/components/StudentResultDownload";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

type ResultList = Result & { student: Student; exam: Exam, subject: Subject, branch: Branch };

const ResultListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const teacherId = (sessionClaims?.metadata as { teacherId?: string })?.teacherId;

  const columns = [
    { header: "Student Name", accessor: "student.name", className: "hidden md:table-cell" },
    { header: "Exam", accessor: "exam.id", className: "hidden md:table-cell" },
    { header: "Marks", accessor: "overallMark", className: "hidden md:table-cell" },
    { header: "Subject", accessor: "subject.name", className: "hidden md:table-cell" },
    { header: "Actions", accessor: "action" },
  ];

  const renderRow = (item: ResultList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="hidden md:table-cell">{item.student.name}</td>
      <td className="hidden md:table-cell">{item.examId}</td>
      <td className="hidden md:table-cell">{item.overallMark}</td>
      <td className="hidden md:table-cell">{item.subject.name}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/result/${item.id}`} className="text-blue-600 hover:underline">
            View Details
          </Link>
          {(role === "registrar" || role === "teacher") && (
            <>
              <FormContainer table="result" type="update" data={item} />
              <FormContainer table="result" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, sortBy, sortOrder, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        if (key === "studentName") query.student = { name: { contains: value, mode: 'insensitive' } };
        if (key === "examId") query.examId = parseInt(value);
        if (key === "subjectId") query.subjectId = parseInt(value);
        if (key === "branchId") query.student.branchId = parseInt(value);
        if (key === "semester") query.student.semester = { level: parseInt(value) };
      }
    }
  }

  switch (role) {
    case "teacher":
      if (teacherId) {
        query.subject = {
          teachers: {
            some: {
              id: teacherId,
            },
          },
        };
      }
      break;
  }

  let orderBy: Prisma.ResultOrderByWithRelationInput = {};
  if (sortBy) {
    if (sortBy === 'subject') {
      orderBy = { subject: { name: sortOrder === 'desc' ? 'desc' : 'asc' } };
    } else if (sortBy === 'branch') {
      orderBy = { student: { branch: { name: sortOrder === 'desc' ? 'desc' : 'asc' } } };
    } else if (sortBy === 'semester') {
      orderBy = { student: { semester: { level: sortOrder === 'desc' ? 'desc' : 'asc' } } };
    } else if (sortBy === 'marks') {
      orderBy = { overallMark: sortOrder === 'desc' ? 'desc' : 'asc' };
    }
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true } },
        exam: { select: { id: true } },
        subject: { select: { name: true, teachers: { select: { id: true } } } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy,
    }),
    prisma.result.count({ where: query }),
  ]);

  const data = dataRes.map((item) => ({
    ...item,
    student: item.student,
    exam: item.exam,
    subject: item.subject,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <StudentResultDownload role={role} />
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
      </div>
      <TableSearch />
      <Table columns={columns} data={data} renderRow={renderRow} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ResultListPage;
