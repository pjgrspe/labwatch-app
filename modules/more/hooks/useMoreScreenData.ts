// modules/more/hooks/useMoreScreenData.ts
import { auth } from '@/FirebaseConfig';
import { AuthService } from '@/modules/auth/services/AuthService';
import { useEffect, useState } from 'react';

export interface UserRole {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  displayRole: string;
}

export const useMoreScreenData = () => {
  const [userRole, setUserRole] = useState<UserRole>({
    isSuperAdmin: false,
    isAdmin: false,
    displayRole: 'User',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        checkUserRole(user.uid);
      } else {
        setUserRole({
          isSuperAdmin: false,
          isAdmin: false,
          displayRole: 'User',
        });
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const checkUserRole = async (uid: string) => {
    setIsLoading(true);
    try {
      const isSuperAdmin = await AuthService.isSuperAdmin(uid);
      // You can add more role checks here if needed
      // const isAdmin = await AuthService.isAdmin(uid);
      
      setUserRole({
        isSuperAdmin,
        isAdmin: false, // Set this based on your role system
        displayRole: isSuperAdmin ? 'Super Admin' : 'User',
      });
    } catch (error) {
      console.error('useMoreScreenData: Error checking user role:', error);
      setUserRole({
        isSuperAdmin: false,
        isAdmin: false,
        displayRole: 'User',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentUser,
    userRole,
    isLoading,
    refreshUserRole: () => currentUser && checkUserRole(currentUser.uid),
  };
};
