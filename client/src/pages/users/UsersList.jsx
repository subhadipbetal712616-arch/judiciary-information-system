/**
 * UsersList — admin-only page. Lists users, lets the admin toggle active
 * and change roles inline.
 */
import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { UserCog, Trash2, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Select from '../../components/Select';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { ROLES, ROLE_BADGE_CLASS } from '../../utils/constants';

export default function UsersList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);

  function load() {
    setLoading(true);
    api
      .get('/users')
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users.'))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function updateRole(u, role) {
    try {
      await api.put(`/users/${u._id}`, { role });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.');
    }
  }

  async function toggleActive(u) {
    try {
      await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await api.delete(`/users/${toDelete._id}`);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (u) => (
        <div>
          <p className="font-medium text-gray-900 flex items-center gap-1">
            {u.name}
            {u.role === 'admin' && <ShieldCheck size={12} className="text-gray-500" />}
          </p>
          <p className="text-xs text-gray-500">{u.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            ROLE_BADGE_CLASS[u.role]
          }`}
        >
          {u.role}
        </span>
      ),
    },
    {
      key: 'specialization',
      header: 'Specialization',
      render: (u) => u.specialization || '—',
    },
    {
      key: 'court',
      header: 'Court',
      render: (u) => u.court || '—',
    },
    {
      key: 'isActive',
      header: 'Active',
      render: (u) => <StatusBadge value={u.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (u) => (u.createdAt ? format(parseISO(u.createdAt), 'dd MMM yyyy') : '—'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center gap-2">
          <Select
            value={u.role}
            onChange={(e) => updateRole(u, e.target.value)}
            options={ROLES}
            className="w-36"
          />
          <Button type="button" variant="secondary" onClick={() => toggleActive(u)} className="px-2 py-1">
            {u.isActive ? 'Disable' : 'Enable'}
          </Button>
          {u._id !== currentUser?._id && (
            <Button type="button" variant="danger" onClick={() => setToDelete(u)} className="px-2 py-1">
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyState={<EmptyState icon={UserCog} title="No users" message="Register the first account." />}
      />

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete user?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              <Trash2 size={14} /> Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-700">
          Are you sure you want to permanently delete <strong>{toDelete?.name}</strong> (
          {toDelete?.email})? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
