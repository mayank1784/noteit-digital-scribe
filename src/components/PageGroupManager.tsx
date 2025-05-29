
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useNotebooks } from '@/hooks/useNotebooks';
import { PageGroup } from '@/types';
import { Plus, Edit2, Trash2, Users, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface PageGroupManagerProps {
  notebookId: string;
  totalPages: number;
}

const PageGroupManager: React.FC<PageGroupManagerProps> = ({ notebookId, totalPages }) => {
  const { getNotebookGroups, createPageGroup, updatePageGroup, deletePageGroup, addPagesToGroup, removePagesFromGroup } = useNotebooks();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PageGroup | null>(null);
  const [manageGroup, setManageGroup] = useState<PageGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  const groups = getNotebookGroups(notebookId);
  const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    const group = await createPageGroup(notebookId, newGroupName.trim(), newGroupDescription.trim() || undefined);
    if (group) {
      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateDialog(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup || !newGroupName.trim()) return;

    await updatePageGroup(editingGroup.id, newGroupName.trim(), newGroupDescription.trim() || undefined);
    setEditingGroup(null);
    setNewGroupName('');
    setNewGroupDescription('');
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (confirm('Are you sure you want to delete this group? This will not delete the pages themselves.')) {
      await deletePageGroup(groupId);
    }
  };

  const handleManagePages = (group: PageGroup) => {
    setManageGroup(group);
    setSelectedPages([...group.pages]);
  };

  const handleSavePageSelection = async () => {
    if (!manageGroup) return;

    const currentPages = manageGroup.pages;
    const pagesToAdd = selectedPages.filter(page => !currentPages.includes(page));
    const pagesToRemove = currentPages.filter(page => !selectedPages.includes(page));

    if (pagesToAdd.length > 0) {
      await addPagesToGroup(manageGroup.id, pagesToAdd);
    }
    if (pagesToRemove.length > 0) {
      await removePagesFromGroup(manageGroup.id, pagesToRemove);
    }

    setManageGroup(null);
    setSelectedPages([]);
  };

  const startEdit = (group: PageGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description || '');
  };

  const getPageGroups = (pageNumber: number) => {
    return groups.filter(group => group.pages.includes(pageNumber));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Page Groups</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Page Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Enter group description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
                  Create Group
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Page Groups</h3>
            <p className="text-gray-600 mb-4">Create groups to organize your notebook pages by topic or category.</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleManagePages(group)}
                      className="h-6 w-6 p-0"
                    >
                      <Users className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(group)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGroup(group.id)}
                      className="h-6 w-6 p-0 text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {group.description && (
                  <p className="text-sm text-gray-600">{group.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {group.pages.length} page{group.pages.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {group.pages.slice(0, 5).map((pageNum) => (
                      <Badge key={pageNum} variant="secondary" className="text-xs">
                        {pageNum}
                      </Badge>
                    ))}
                    {group.pages.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{group.pages.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Group Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Page Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter group description"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingGroup(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateGroup} disabled={!newGroupName.trim()}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Pages Dialog */}
      <Dialog open={!!manageGroup} onOpenChange={() => setManageGroup(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Pages - {manageGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select which pages should be included in this group:
            </p>
            <div className="grid grid-cols-8 gap-2">
              {allPages.map((pageNum) => {
                const isSelected = selectedPages.includes(pageNum);
                const otherGroups = getPageGroups(pageNum).filter(g => g.id !== manageGroup?.id);
                
                return (
                  <div key={pageNum} className="relative">
                    <div
                      className={`flex items-center justify-center h-12 w-12 border-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedPages(prev =>
                          isSelected
                            ? prev.filter(p => p !== pageNum)
                            : [...prev, pageNum]
                        );
                      }}
                    >
                      <span className="text-sm font-medium">{pageNum}</span>
                    </div>
                    {otherGroups.length > 0 && (
                      <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {otherGroups.length}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setManageGroup(null)}>
                Cancel
              </Button>
              <Button onClick={handleSavePageSelection}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageGroupManager;
