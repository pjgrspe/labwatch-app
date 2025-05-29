// labwatch-app/modules/auth/services/AuthService.ts
import { app, auth, db } from '@/FirebaseConfig';
import {
  User as FirebaseUser, // Import this if you plan to allow users to delete their OWN account from client
  onAuthStateChanged
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'; // Removed collection for now as it's unused here

const firestore = getFirestore(app);

export interface UserProfile {
  uid: string;
  email: string | null;
  fullName: string;
  role: 'user' | 'superadmin';
  status: 'pending' | 'approved' | 'denied';
  createdAt: Date;
  approvedAt?: Date;
  deniedAt?: Date;
}

const SUPERADMIN_UID = "HwmCopyPS4eEUgjTpmFkRjhDedO2";

export const AuthService = {
  onAuthStateChanged: (callback: (user: FirebaseUser | null, userProfile: UserProfile | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await AuthService.getUserProfile(firebaseUser.uid);
        callback(firebaseUser, userProfile);
      } else {
        callback(null, null);
      }
    });
  },

  // SIMPLIFIED: Get pending users with better error handling
  getPendingUsers: async (): Promise<UserProfile[]> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      
      const pendingUsers: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        pendingUsers.push({
          uid: doc.id,
          email: userData.email || '',
          fullName: userData.fullName || '',
          role: userData.role || 'user',
          status: userData.status || 'pending',
          createdAt: userData.createdAt || new Date(),
          approvedAt: userData.approvedAt,
          deniedAt: userData.deniedAt,
        });
      });
      
      return pendingUsers;
    } catch (error) {
      console.error('Error fetching pending users:', error);
      throw error;
    }
  },

  // SIMPLIFIED: Get user profile with better error handling
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        console.log(`No user profile found for UID: ${uid}`);
        return null;
      }
      
      const userData = userDoc.data();
      return {
        uid: userDoc.id,
        email: userData.email || '',
        fullName: userData.fullName || '',
        role: userData.role || 'user',
        status: userData.status || 'pending',
        createdAt: userData.createdAt || new Date(),
        approvedAt: userData.approvedAt,
        deniedAt: userData.deniedAt,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null; // Return null instead of throwing
    }
  },

  // SIMPLIFIED: Check if user is superadmin
  isSuperAdmin: async (uid: string): Promise<boolean> => {
    try {
      // First check hardcoded superadmin UID
      if (uid === "HwmCopyPS4eEUgjTpmFkRjhDedO2") {
        return true;
      }
      
      // Then check user profile
      const userProfile = await AuthService.getUserProfile(uid);
      return userProfile?.role === 'superadmin';
    } catch (error) {
      console.error('Error checking superadmin status:', error);
      return false; // Return false instead of throwing
    }
  },

  // SIMPLIFIED: Approve user with minimal validation
  approveUser: async (userId: string): Promise<void> => {
    try {
      const userDocRef = doc(db, 'users', userId);
      
      // Simple update - let Firestore handle the rest
      await updateDoc(userDocRef, {
        status: 'approved',
        approvedAt: new Date(), // Use regular Date for simplicity
      });
      
      console.log(`User ${userId} approved successfully`);
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  },

  // SIMPLIFIED: Deny user with minimal validation
  denyUser: async (userId: string): Promise<void> => {
    try {
      const userDocRef = doc(db, 'users', userId);
      
      // Simple update - let Firestore handle the rest
      await updateDoc(userDocRef, {
        status: 'denied',
        deniedAt: new Date(), // Use regular Date for simplicity
      });
      
      console.log(`User ${userId} denied successfully`);
    } catch (error) {
      console.error('Error denying user:', error);
      throw error;
    }
  },

  deleteUser: async (uid: string): Promise<void> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        status: 'deleted',
        deletedAt: serverTimestamp(), // Use serverTimestamp for consistency
      });
      console.log(`User ${uid} deleted successfully`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

};