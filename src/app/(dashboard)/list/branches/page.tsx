import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Branch, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type BranchList = Branch & { teachers: Teacher[] };

const BranchListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

const { sessionClaims } = auth();
const role = (sessionClaims?.metadata as { role?: string })?.role;


const columns = [
  {
    header: "Branch Name",
    accessor: "name",
  },
  {
    header: "Capacity",
    accessor: "capacity",
    className: "hidden md:table-cell",
  },
  
  ...(role === "registrar"|| role === "theoryIncharge"
    ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
    : []),
];

const renderRow = (item: BranchList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">{item.name}</td>
    <td className="hidden md:table-cell">{item.capacity}</td>
    <td>
      <div className="flex items-center gap-2">
        {role === "registrar" || role === "theoryIncharge" && (
          <>
            <FormContainer table="branch" type="update" data={item} />
            <FormContainer table="branch" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.BranchWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.name = { contains: value.toLowerCase() };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.branch.findMany({
      where: query,
      include: { 
        teachers: true,
        semesters: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.branch.count({ where: query }),
  ]);

  return (
    <div className="bg-teal-50 p-6 rounded-lg shadow-md flex-1 m-4 mt-0 border border-blue-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="bg-red-500 w-2 h-6 rounded mr-2 hidden md:block"></span>
            All Branches
          </h1>
          <p className="text-sm text-red-500 mt-1 hidden md:block">
            View and manage branch information
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full bg-white md:w-auto mb-3 md:mb-0">
            <TableSearch />
          </div>
          
          <div className="flex items-center gap-3 self-end">
            <button className="flex items-center justify-center p-2 rounded-md bg-purple-100 hover:bg-purple-200 transition-colors">
              <Image src="/filter.png" alt="Filter" width={16} height={16} />
              <span className="ml-2 text-sm font-medium text-blue-700 hidden md:inline">Filter</span>
            </button>
            
            <button className="flex items-center justify-center p-2 rounded-md bg-purple-100 hover:bg-purple-200 transition-colors">
              <Image src="/sort.png" alt="Sort" width={16} height={16} />
              <span className="ml-2 text-sm font-medium text-blue-700 hidden md:inline">Sort</span>
            </button>
            
            {role === "registrar" || role === "theoryIncharge" && (
              <FormContainer table="branch" type="create" />
            )}
          </div>
        </div>
      </div>
      
      {/* Table Section with Card Styling */}
      <div className="bg-white p-4 rounded-md border border-blue-300">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>
      
      {/* Pagination with Better Styling */}
      <div className="mt-6 flex justify-center md:justify-end">
        <Pagination page={p} count={count} itemsPerPage={10} />
      </div>
    </div>
  );
};

export default BranchListPage;