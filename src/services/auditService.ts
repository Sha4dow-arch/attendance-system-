import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function createAuditLog(userId: string, action: string, details: string) {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
