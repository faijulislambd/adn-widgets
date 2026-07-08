import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { GroupedCompany } from "@/types";

const TopClientsTable = ({ clients }: { clients: GroupedCompany[] }) => {
  console.log(clients);
  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border-r font-semibold">Company</TableHead>
            <TableHead className="border-r font-semibold">Clients</TableHead>
            <TableHead className="font-semibold w-28 ">Total SMS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client, i) => (
            <TableRow key={i}>
              <TableCell className="font-semibold border-r">
                {client.company}
              </TableCell>
              <TableCell className="border-r">
                {client.users.map((u) => `${u.user}`).join(" , ")}
              </TableCell>
              <TableCell>{client.totalSMS}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TopClientsTable;
