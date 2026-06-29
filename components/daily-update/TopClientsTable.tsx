import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const TopClientsTable = ({
  clients,
}: {
  clients: { clientName: string; totalSMS: string | number }[];
}) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border-r font-semibold">
              Client Name
            </TableHead>
            <TableHead className="font-semibold w-28">Total SMS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client, i) => (
            <TableRow key={i}>
              <TableCell className="font-semibold border-r">
                {client.clientName}
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
