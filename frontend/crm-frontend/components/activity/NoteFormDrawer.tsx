'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { Drawer } from '@/components/ui/Drawer';

export function NoteFormDrawer({
  isOpen,
  onClose,
  candidateId,
  editingNoteId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  editingNoteId: string | null;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await api.tags.list();
      return res.data?.data ?? [];
    },
    enabled: isOpen,
  });

  const { data: notes } = useQuery({
    queryKey: ['notes', candidateId],
    queryFn: async () => {
      const res = await api.notes.list(candidateId);
      return res.data?.data ?? [];
    },
    enabled: isOpen && !!editingNoteId,
  });

  useEffect(() => {
    if (editingNoteId && notes?.length) {
      const note = notes.find((n) => n.id === editingNoteId);
      if (note) {
        setTitle(note.title);
        setDescription(note.description ?? '');
        setTagIds(note.tags ?? []);
        setIsPinned(note.isPinned ?? false);
      }
    } else {
      setTitle('');
      setDescription('');
      setTagIds([]);
      setIsPinned(false);
    }
  }, [editingNoteId, notes]);

  const createMutation = useMutation({
    mutationFn: () =>
      api.notes.create({
        candidateId,
        title,
        description: description || undefined,
        tags: tagIds.length ? tagIds : undefined,
        isPinned,
      }),
    onSuccess: () => {
      onSuccess();
      toast.success('Note added successfully');
    },
    onError: () => toast.error('Failed to add note'),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api.notes.update(editingNoteId!, {
        title,
        description: description || undefined,
        tags: tagIds,
        isPinned,
      }),
    onSuccess: () => {
      onSuccess();
      toast.success('Note updated successfully');
    },
    onError: () => toast.error('Failed to update note'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNoteId) updateMutation.mutate();
    else createMutation.mutate();
  };

  const toggleTag = (id: string) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={editingNoteId ? 'Edit note' : 'Add note'} className="sm:max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-[var(--foreground)]">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[var(--border)] dark:bg-[var(--background)] dark:text-[var(--foreground)]"
            placeholder="Note title"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-[var(--foreground)]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[var(--border)] dark:bg-[var(--background)] dark:text-[var(--foreground)]"
            placeholder="Optional details"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-[var(--foreground)]">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${tagIds.includes(t.id) ? 'ring-2 ring-offset-1' : 'opacity-80 hover:opacity-100'}`}
                style={{ backgroundColor: t.color || '#6b7280' }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded border-gray-300" />
          <span className="text-sm text-gray-700 dark:text-[var(--foreground)]">Pin this note</span>
        </label>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-[var(--border)]">Cancel</button>
          <button type="submit" disabled={pending} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {pending ? 'Saving…' : editingNoteId ? 'Update' : 'Add note'}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
