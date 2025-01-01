import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import type { Todo } from './types';

console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0, 5) + '...',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Verificar que tenemos todas las variables de entorno
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing Firebase config: ${key}`);
  }
});

console.log('Initializing Firebase with project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const todosRef = collection(db, 'todos');

export const subscribeTodos = (callback: (todos: Todo[]) => void) => {
  console.log('Setting up todos subscription...');
  const q = query(todosRef, orderBy('createdAt', 'desc'));
  
  // Verificar si la colección existe
  getDocs(todosRef).then(snapshot => {
    console.log('Initial collection check:', {
      empty: snapshot.empty,
      size: snapshot.size
    });
  });
  
  return onSnapshot(q, 
    (snapshot) => {
      console.log('Snapshot metadata:', {
        fromCache: snapshot.metadata.fromCache,
        hasPendingWrites: snapshot.metadata.hasPendingWrites
      });
      
      const todos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Todo));
      console.log('Received todos update:', {
        count: todos.length,
        todos: todos
      });
      callback(todos);
    },
    (error) => {
      console.error('Error in todos subscription:', error);
    }
  );
};

export const addTodo = async (text: string) => {
  console.log('Adding new todo:', text);
  try {
    const docRef = await addDoc(todosRef, {
      text,
      createdAt: Date.now()
    });
    console.log('Todo added successfully with ID:', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
};

export const updateTodo = async (id: string, text: string) => {
  console.log('Updating todo:', id, 'with text:', text);
  try {
    const todoRef = doc(db, 'todos', id);
    await updateDoc(todoRef, { 
      text,
      updatedAt: Date.now() 
    });
    console.log('Todo updated successfully');
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const deleteTodo = async (id: string) => {
  console.log('Deleting todo:', id);
  try {
    const todoRef = doc(db, 'todos', id);
    await deleteDoc(todoRef);
    console.log('Todo deleted successfully');
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
}; 