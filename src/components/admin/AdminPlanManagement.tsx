import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  memory: number;
  disk: number;
  cpu: number;
  price: number;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export const AdminPlanManagement = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    memory: '',
    disk: '',
    cpu: '',
    price: '',
    description: '',
    image_url: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to load plans",
        variant: "destructive"
      });
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      memory: '',
      disk: '',
      cpu: '',
      price: '',
      description: '',
      image_url: '',
      is_active: true
    });
    setEditingPlan(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      memory: plan.memory.toString(),
      disk: plan.disk.toString(),
      cpu: plan.cpu.toString(),
      price: plan.price.toString(),
      description: plan.description || '',
      image_url: plan.image_url || '',
      is_active: plan.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.memory || !formData.disk || !formData.cpu || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const planData = {
      name: formData.name,
      memory: parseInt(formData.memory),
      disk: parseInt(formData.disk),
      cpu: parseInt(formData.cpu),
      price: parseFloat(formData.price),
      description: formData.description || null,
      image_url: formData.image_url || null,
      is_active: formData.is_active
    };

    try {
      if (editingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Plan updated successfully"
        });
      } else {
        // Create new plan
        const { error } = await supabase
          .from('plans')
          .insert(planData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Plan created successfully"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPlans();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save plan",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Are you sure you want to delete the "${plan.name}" plan?`)) return;

    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', plan.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Plan deleted successfully"
      });
      fetchPlans();
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan",
        variant: "destructive"
      });
    }
  };

  const togglePlanStatus = async (plan: Plan) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Plan ${!plan.is_active ? 'activated' : 'deactivated'} successfully`
      });
      fetchPlans();
    } catch (error: any) {
      console.error('Error updating plan status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update plan status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Plan Management</h2>
          <p className="text-muted-foreground">Create and manage server hosting plans</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
              <DialogDescription>
                {editingPlan ? 'Update plan details' : 'Add a new server hosting plan'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Starter, Pro, Enterprise"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="memory">RAM (MB) *</Label>
                  <Input
                    id="memory"
                    type="number"
                    value={formData.memory}
                    onChange={(e) => setFormData({ ...formData, memory: e.target.value })}
                    placeholder="1024"
                  />
                </div>
                <div>
                  <Label htmlFor="disk">Disk (GB) *</Label>
                  <Input
                    id="disk"
                    type="number"
                    value={formData.disk}
                    onChange={(e) => setFormData({ ...formData, disk: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="cpu">CPU (%) *</Label>
                  <Input
                    id="cpu"
                    type="number"
                    value={formData.cpu}
                    onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="price">Monthly Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="9.99"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Perfect for small projects..."
                />
              </div>

              <div>
                <Label htmlFor="image_url">Plan Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active Plan</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSave} className="flex-1">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plans</CardTitle>
          <CardDescription>Manage your server hosting plans</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Specs</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {plan.image_url ? (
                        <img src={plan.image_url} alt={plan.name} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-muted-foreground">{plan.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {plan.memory}MB RAM • {plan.disk}GB • {plan.cpu}% CPU
                    </div>
                  </TableCell>
                  <TableCell>${plan.price}/mo</TableCell>
                  <TableCell>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(plan)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => togglePlanStatus(plan)}>
                        {plan.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(plan)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};