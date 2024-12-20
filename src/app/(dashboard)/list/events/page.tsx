import EmptyComponent from "@/components/emptyComponent";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { eventsData, role } from "@/lib/data";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Event, EventClass, Prisma } from "@prisma/client";
import Image from "next/image";

type EventList = Event & { eventClass:(EventClass & {class:Class})[]  };


const columns = [
  {
    header: "Title",
    accessor: "title",
  },
  {
    header: "Classes",
    accessor: "classes",
  },
  {
    header: "Description",
    accessor: "description",
    className: "hidden md:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Start Time",
    accessor: "startTime",
    className: "hidden md:table-cell",
  },
  {
    header: "End Time",
    accessor: "endTime",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const EventListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const renderRow = (item: EventList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.eventClass.map((item)=><span className="flex items-center gap-1">{item.class.name}</span>)}</td>
      <td className="hidden md:table-cell">{item.description}</td>
      <td className="hidden md:table-cell">
         {item.startTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}</td>
      <td className="hidden md:table-cell">
      {new Intl.DateTimeFormat("en-US").format(item.startTime)}

      </td>
      <td className="hidden md:table-cell">
      {item.endTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td>
        <div className="flex items-center gap-2">
           {role === "admin" && (
            <>
              <FormModal table="event" type="update" data={item} />
              <FormModal table="event" type="delete" id={item.id} />
            </>
          )} 
        </div>
      </td>
    </tr>
  );
  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.EventWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.title = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS

  // const roleConditions = {
  //   teacher: { lessons: { some: { teacherId: currentUserId! } } },
  //   student: { students: { some: { id: currentUserId! } } },
  //   parent: { students: { some: { parentId: currentUserId! } } },
  // };

  // query.OR = [
  //   // { classId: null },
  //   // {
  //   //   class: roleConditions[role as keyof typeof roleConditions] || {},
  //   // },
  // ];

  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: {
        eventClass: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.event.count({ }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {/* {role === "admin" && <FormModal table="event" type="create" />} */}
          </div>
        </div>
      </div>
      {data.length !== 0 && <><Table columns={columns} renderRow={renderRow} data={data} /> 
      {/* PAGINATION */}
       <Pagination page={p} count={count} /> </>}
       {
        data.length === 0 &&  
            <EmptyComponent msg = {'No Data'} />
       }
    </div>
  );
};

export default EventListPage;
