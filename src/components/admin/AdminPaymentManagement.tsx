import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, Clock, DollarSign } from 'lucide-react';

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  payment_gateway: string;
  payment_id: string;
  created_at: string;
  completed_at: string | null;
  gateway_response: any;
}

interface ServerOrder {
  id: string;
  server_name: string | null;
  payment_status: 'pending' | 'approved' | 'rejected';
  status: 'pending' | 'active' | 'failed' | 'cancelled';
  created_at: string;
  profiles: {
    email: string;
    full_name: string;
  };
  plans: {
    name: string;
    price: number;
  };
}

export const AdminPaymentManagement = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingOrders, setPendingOrders] = useState<ServerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ServerOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch pending orders (orders waiting for payment approval)
      const { data: ordersData, error: ordersError } = await supabase
        .from('server_orders')
        .select(`
          *,
          profiles!inner(email, full_name),
          plans!inner(name, price)
        `)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setPayments((paymentsData as any) || []);
      setPendingOrders((ordersData as any) || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load payment data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (order: ServerOrder) => {
    try {
      // Update order payment status to approved
      const { error: orderError } = await supabase
        .from('server_orders')
        .update({ payment_status: 'approved' })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // Call the process-order function to create the server
      const { error: processError } = await supabase.functions.invoke('process-order', {
        body: {
          order_id: order.id,
          approve_payment: true
        }
      });

      if (processError) throw processError;

      toast({
        title: "Payment Approved",
        description: "Server creation has been initiated",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error approving payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve payment",
        variant: "destructive"
      });
    }
  };

  const rejectPayment = async (order: ServerOrder) => {
    if (!confirm(`Are you sure you want to reject payment for order ${order.server_name}?`)) return;

    try {
      const { error } = await supabase
        .from('server_orders')
        .update({ 
          payment_status: 'rejected',
          status: 'cancelled'
        })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Payment Rejected",
        description: "Order has been cancelled",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject payment",
        variant: "destructive"
      });
    }
  };

  const viewOrderDetails = (order: ServerOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading payment data...</div>;
  }

  const pendingCount = pendingOrders.length;
  const totalRevenue = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payment Management</h2>
        <p className="text-muted-foreground">Approve or reject customer payments</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders */}
      {pendingCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-yellow-600">⚠️ Pending Payment Approvals</CardTitle>
            <CardDescription>Orders waiting for payment verification</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Server Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Ordered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.map((order) => (
                  <TableRow key={order.id} className="bg-yellow-50 dark:bg-yellow-900/20">
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.profiles?.full_name}</div>
                        <div className="text-sm text-muted-foreground">{order.profiles?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{order.server_name}</TableCell>
                    <TableCell>{order.plans?.name}</TableCell>
                    <TableCell>${order.plans?.price}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => viewOrderDetails(order)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" onClick={() => approvePayment(order)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => rejectPayment(order)}>
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All payment transactions and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payments recorded yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">{payment.payment_id}</TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell className="capitalize">{payment.payment_gateway}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Complete order information</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Customer:</strong> {selectedOrder.profiles?.full_name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedOrder.profiles?.email}
                </div>
                <div>
                  <strong>Server Name:</strong> {selectedOrder.server_name}
                </div>
                <div>
                  <strong>Plan:</strong> {selectedOrder.plans?.name}
                </div>
                <div>
                  <strong>Amount:</strong> ${selectedOrder.plans?.price}
                </div>
                <div>
                  <strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button onClick={() => approvePayment(selectedOrder)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Payment
                </Button>
                <Button variant="destructive" onClick={() => rejectPayment(selectedOrder)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};