import React from "react";

interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AdminTableProps {
  admins: Admin[];
  loading: boolean;
}

const AdminTable: React.FC<AdminTableProps> = ({ admins, loading }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-xl shadow-md">
        <thead>
          <tr className="bg-gradient-to-r from-teal-100 to-emerald-100">
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Name</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Created At</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={3} className="py-6 text-center text-gray-500">Loading...</td>
            </tr>
          ) : admins.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-6 text-center text-gray-500">No admins found.</td>
            </tr>
          ) : (
            admins.map((admin) => (
              <tr key={admin.id} className="border-b">
                <td className="py-3 px-4">{admin.name}</td>
                <td className="py-3 px-4">{admin.email}</td>
                <td className="py-3 px-4">{new Date(admin.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
