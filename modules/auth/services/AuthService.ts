// labwatch-app/modules/auth/services/AuthService.ts
import { app, auth } from '@/FirebaseConfig';
import {
  User as FirebaseUser, // Import this if you plan to allow users to delete their OWN account from client
  onAuthStateChanged
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where } from 'firebase/firestore'; // Removed collection for now as it's unused here
import { Alert } from 'react-native';

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

  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(firestore, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },

  isSuperAdmin: async (uid: string | undefined): Promise<boolean> => {
    if (!uid) return false;
    if (uid === SUPERADMIN_UID) return true;

    const userProfile = await AuthService.getUserProfile(uid);
    return userProfile?.role === 'superadmin';
  },

  getPendingUsers: async (): Promise<UserProfile[]> => {
    try {
      const usersRef = collection(firestore, "users"); // Ensure collection is imported from firebase/firestore
      const q = query(usersRef, where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      const pendingUsers: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        pendingUsers.push(doc.data() as UserProfile);
      });
      return pendingUsers;
    } catch (error) {
      console.error("Error fetching pending users:", error);
      // It's better to throw the error or return a result indicating failure
      // For now, returning empty array and logging is kept from original.
      return [];
    }
  },

  approveUser: async (uid: string): Promise<void> => {
    try {
      const userDocRef = doc(firestore, "users", uid);
      await updateDoc(userDocRef, {
        status: "approved",
        approvedAt: new Date(),
      });
    } catch (error) {
      console.error("Error approving user:", error);
      throw error;
    }
  },

  // Renamed from deleteUserAccountCompletely to reflect new behavior
  denyUserRegistration: async (uid: string): Promise<void> => {
    console.warn(
      `Marking user ${uid} as 'denied' in Firestore. For the user to re-signup with the same email, their Firebase Auth account must be deleted. This typically requires a backend Firebase Function with admin privileges.`
    );
    try {
        // Step 1: Update Firestore document status to "denied"
        const userDocRef = doc(firestore, "users", uid);
        await updateDoc(userDocRef, {
            status: "denied",
            deniedAt: new Date(),
        });
        console.log(`User ${uid} status updated to "denied" in Firestore.`);
        Alert.alert("User Denied", `User account for UID ${uid} has been marked as denied. To allow re-signup with the same email, their Firebase Auth account needs to be deleted via a backend function.`);

    } catch (error) {
        console.error("Error in denyUserRegistration for UID:", uid, error);
        Alert.alert("Denial Error", `Failed to mark user ${uid} as denied. Check console.`);
        throw error;
    }
  },
};