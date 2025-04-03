// components/admin/UserManagement.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function UserManagement() {
  const { promoteToInstructor } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersQuery = query(collection(db, 'users'));
        const snapshot = await getDocs(usersQuery);
        
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);
  
  const handlePromoteToInstructor = async (userId: string) => {
    try {
      await promoteToInstructor(userId);
      // Update local state to reflect change
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: 'instructor' } : user
      ));
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Failed to promote user to instructor. Please try again.');
    }
  };
  
  if (loading) {
    return <div>Loading users...</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Email</th>
            <th className="py-3 px-6 text-left">Role</th>
            <th className="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {users.map(user => (
            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-6 text-left">
                {user.firstName} {user.lastName}
              </td>
              <td className="py-3 px-6 text-left">{user.email}</td>
              <td className="py-3 px-6 text-left">
                <span className={`py-1 px-3 rounded-full text-xs ${
                  user.role === 'admin' ? 'bg-red-200 text-red-700' : 
                  user.role === 'instructor' ? 'bg-blue-200 text-blue-700' : 
                  'bg-green-200 text-green-700'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="py-3 px-6 text-center">
                <div className="flex item-center justify-center">
                  {user.role === 'student' && (
                    <button 
                      onClick={() => handlePromoteToInstructor(user.id)}
                      className="text-blue-600 hover:text-blue-900 mx-2"
                    >
                      Promote to Instructor
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}