import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, testConnection } from '../lib/firebase';
import { TakwimEntry, HolidayRecord, PanitiaConfig, SchoolSettings } from '../types/takwim';

export class FirebaseSyncService {
  private static instance: FirebaseSyncService;
  private isInitialized = false;

  public static getInstance(): FirebaseSyncService {
    if (!FirebaseSyncService.instance) {
      FirebaseSyncService.instance = new FirebaseSyncService();
    }
    return FirebaseSyncService.instance;
  }

  public async initConnection(): Promise<boolean> {
    if (this.isInitialized) return true;
    try {
      const ok = await testConnection();
      this.isInitialized = true;
      return ok;
    } catch {
      return false;
    }
  }

  // --- Real-time Takwim Subscriptions ---
  public subscribeToTakwim(
    onData: (entries: TakwimEntry[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    const colRef = collection(db, 'takwim');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: TakwimEntry[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as TakwimEntry);
        });
        onData(items);
      },
      (error) => {
        console.warn('Firestore Takwim listener encountered issue:', error);
        if (onError) onError(error);
        try {
          handleFirestoreError(error, OperationType.LIST, 'takwim');
        } catch {
          // Handled and logged to standard FirestoreErrorInfo
        }
      }
    );
  }

  // Sync a single Takwim entry to Firestore
  public async saveTakwimEntry(entry: TakwimEntry): Promise<void> {
    const docPath = `takwim/${entry.id}`;
    try {
      const docRef = doc(db, 'takwim', entry.id);
      await setDoc(docRef, {
        ...entry,
        syncedToFirebaseAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }

  // Delete a Takwim entry from Firestore
  public async deleteTakwimEntry(id: string): Promise<void> {
    const docPath = `takwim/${id}`;
    try {
      const docRef = doc(db, 'takwim', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  }

  // Sync bulk entries
  public async syncAllEntriesToFirebase(entries: TakwimEntry[]): Promise<number> {
    let count = 0;
    for (const entry of entries) {
      try {
        await this.saveTakwimEntry(entry);
        count++;
      } catch (e) {
        console.warn(`Could not sync entry ${entry.id} to Firestore:`, e);
      }
    }
    return count;
  }

  // Sync School Settings
  public async saveSchoolSettings(settings: SchoolSettings): Promise<void> {
    const docPath = 'settings/school';
    try {
      const docRef = doc(db, 'settings', 'school');
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }

  // Subscribe to School Settings
  public subscribeToSettings(
    onData: (settings: SchoolSettings) => void
  ): Unsubscribe {
    const docRef = doc(db, 'settings', 'school');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData(snapshot.data() as SchoolSettings);
        }
      },
      (error) => {
        console.warn('Firestore Settings listener issue:', error);
      }
    );
  }

  // Sync user profile upon Google Sign-In
  public async recordUserLogin(user: { uid: string; email: string | null; displayName: string | null }): Promise<void> {
    if (!user.uid) return;
    const docPath = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || 'Guru SK Tudan',
        role: 'Guru',
        lastLogin: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.warn('User profile sync skipped:', error);
    }
  }
}

export const firebaseSync = FirebaseSyncService.getInstance();
