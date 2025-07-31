import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, User } from "lucide-react";
import type { Presenter, InsertPresenter } from "@shared/schema";

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPresenter, setEditingPresenter] = useState<Presenter | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch presenters
  const { data: presenters = [], isLoading } = useQuery<Presenter[]>({
    queryKey: ['/api/admin/presenters'],
  });

  // Add presenter mutation
  const addPresenterMutation = useMutation({
    mutationFn: async (data: InsertPresenter) => {
      return await apiRequest('/api/admin/presenters', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/presenters'] });
      setShowAddForm(false);
      toast({
        title: "Presenter added",
        description: "New presenter has been added successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add presenter. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update presenter mutation
  const updatePresenterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPresenter> }) => {
      return await apiRequest(`/api/admin/presenters/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/presenters'] });
      setEditingPresenter(null);
      toast({
        title: "Presenter updated",
        description: "Presenter has been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update presenter. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete presenter mutation
  const deletePresenterMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/presenters/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/presenters'] });
      toast({
        title: "Presenter deleted",
        description: "Presenter has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete presenter. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleImageUpload = async (file: File, type: 'profile' | 'banner') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const { url } = await response.json();
      return url;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gorgeous-pink border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg text-white p-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto">
          <h1 className="gordita-black text-3xl text-center mb-2">
            GORGEOUS RADIO ADMIN
          </h1>
          <p className="text-center text-sm opacity-90">
            Presenter Management System
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Add Presenter Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Manage Presenters</h2>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gorgeous-pink hover:bg-gorgeous-pink-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Presenter
          </Button>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingPresenter) && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingPresenter ? 'Edit Presenter' : 'Add New Presenter'}
            </h3>
            <PresenterForm
              presenter={editingPresenter}
              onSubmit={(data) => {
                if (editingPresenter) {
                  updatePresenterMutation.mutate({ id: editingPresenter.id, data });
                } else {
                  addPresenterMutation.mutate(data);
                }
              }}
              onCancel={() => {
                setShowAddForm(false);
                setEditingPresenter(null);
              }}
              onImageUpload={handleImageUpload}
              isLoading={addPresenterMutation.isPending || updatePresenterMutation.isPending}
            />
          </Card>
        )}

        {/* Presenters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presenters.map((presenter) => (
            <PresenterCard
              key={presenter.id}
              presenter={presenter}
              onEdit={setEditingPresenter}
              onDelete={(id) => deletePresenterMutation.mutate(id)}
              onToggleActive={(id, isActive) => 
                updatePresenterMutation.mutate({ id, data: { isActive } })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Presenter Form Component
interface PresenterFormProps {
  presenter?: Presenter | null;
  onSubmit: (data: InsertPresenter) => void;
  onCancel: () => void;
  onImageUpload: (file: File, type: 'profile' | 'banner') => Promise<string>;
  isLoading: boolean;
}

function PresenterForm({ presenter, onSubmit, onCancel, onImageUpload, isLoading }: PresenterFormProps) {
  const [formData, setFormData] = useState<InsertPresenter>({
    name: presenter?.name || '',
    displayName: presenter?.displayName || '',
    profileImageUrl: presenter?.profileImageUrl || '',
    bannerImageUrl: presenter?.bannerImageUrl || '',
    isActive: presenter?.isActive ?? true,
    sortOrder: presenter?.sortOrder || 0,
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await onImageUpload(file, type);
      setFormData(prev => ({
        ...prev,
        [type === 'profile' ? 'profileImageUrl' : 'bannerImageUrl']: url
      }));
    } catch (error) {
      // Error handled in parent component
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Dan Westwood"
            required
          />
        </div>
        <div>
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
            placeholder="e.g. Dan"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="profileImage">Profile Image</Label>
          <Input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'profile')}
          />
          {formData.profileImageUrl && (
            <img src={formData.profileImageUrl} alt="Profile preview" className="mt-2 w-16 h-16 rounded-full object-cover" />
          )}
        </div>
        <div>
          <Label htmlFor="bannerImage">Banner Image</Label>
          <Input
            id="bannerImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'banner')}
          />
          {formData.bannerImageUrl && (
            <img src={formData.bannerImageUrl} alt="Banner preview" className="mt-2 w-24 h-16 object-cover rounded" />
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label htmlFor="isActive">Active Presenter</Label>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-gorgeous-pink hover:bg-gorgeous-pink-dark">
          {isLoading ? 'Saving...' : (presenter ? 'Update' : 'Add')} Presenter
        </Button>
      </div>
    </form>
  );
}

// Presenter Card Component
interface PresenterCardProps {
  presenter: Presenter;
  onEdit: (presenter: Presenter) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

function PresenterCard({ presenter, onEdit, onDelete, onToggleActive }: PresenterCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
          {presenter.profileImageUrl ? (
            <img src={presenter.profileImageUrl} alt={presenter.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{presenter.name}</h3>
          <p className="text-sm text-gray-600">{presenter.displayName}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Switch
              checked={presenter.isActive}
              onCheckedChange={(checked) => onToggleActive(presenter.id, checked)}
            />
            <span className="text-xs text-gray-500">
              {presenter.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onEdit(presenter)}
          className="flex-1"
        >
          <Edit className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          onClick={() => onDelete(presenter.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
}