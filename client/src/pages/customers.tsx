import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CustomersPage() {
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-96 mb-8"></div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Customer Management</h1>
          <p className="text-slate-600">Manage customer data and view detailed profiles</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-blue-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {customers.length.toLocaleString()}
                  </h3>
                  <p className="text-slate-600 text-sm">Total Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-emerald-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {customers.filter((c: any) => {
                      if (!c.lastOrderDate) return false;
                      const daysSince = (Date.now() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
                      return daysSince <= 30;
                    }).length}
                  </h3>
                  <p className="text-slate-600 text-sm">Active (30 days)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-star text-amber-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {customers.filter((c: any) => parseFloat(c.totalSpend) > 10000).length}
                  </h3>
                  <p className="text-slate-600 text-sm">High Value (>₹10K)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customer Directory</CardTitle>
              <Button>
                <i className="fas fa-plus mr-2"></i>Add Customer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-users text-4xl text-slate-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No customers yet</h3>
                <p className="text-slate-500 mb-6">Import customer data or add customers manually</p>
                <Button>
                  <i className="fas fa-upload mr-2"></i>Import Data
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Total Spend</TableHead>
                      <TableHead>Visits</TableHead>
                      <TableHead>Last Order</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer: any) => (
                      <TableRow key={customer.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-slate-600">
                                {customer.name?.charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{customer.name}</p>
                              {customer.phone && (
                                <p className="text-sm text-slate-500">{customer.phone}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{customer.email}</TableCell>
                        <TableCell className="text-slate-900 font-medium">
                          ₹{parseFloat(customer.totalSpend).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-slate-900">{customer.visitCount}</TableCell>
                        <TableCell className="text-slate-500">
                          {customer.lastOrderDate
                            ? new Date(customer.lastOrderDate).toLocaleDateString()
                            : "Never"
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            customer.segment === "vip" ? "border-amber-200 text-amber-800" :
                            customer.segment === "regular" ? "border-blue-200 text-blue-800" :
                            "border-slate-200 text-slate-800"
                          }>
                            {customer.segment.charAt(0).toUpperCase() + customer.segment.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-1">
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-700 p-1">
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 p-1">
                              <i className="fas fa-envelope"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
