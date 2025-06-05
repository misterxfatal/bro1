import { v4 as uuidv4 } from 'uuid';

interface QuizData {
  id: string;
  moduleId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  order: number;
}

class QuizStorage {
  private readonly STORE_NAME = 'quizzes';
  private readonly DB_NAME = 'quizQuestionsDB';
  private readonly VERSION = 1;
  private dbInstance: IDBDatabase | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (this.dbInstance) {
      return this.dbInstance;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);

      request.onerror = () => {
        console.error('Error opening database:', request.error);
        reject(request.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('moduleId', 'moduleId', { unique: false });
          store.createIndex('order', 'order', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.dbInstance = request.result;
        resolve(this.dbInstance);
      };
    });
  }

  async saveQuestions(moduleId: string, questions: { question: string; options: string[]; correctAnswer: number; timeLimit: number }[]): Promise<void> {
    console.log('Saving questions for module:', moduleId, questions);
    
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const moduleIndex = store.index('moduleId');

        // First, get all existing questions for this module
        const getRequest = moduleIndex.getAll(moduleId);

        getRequest.onsuccess = async () => {
          try {
            // Delete existing questions
            const existingQuestions = getRequest.result as QuizData[];
            for (const question of existingQuestions) {
              store.delete(question.id);
            }

            // Add new questions
            for (let i = 0; i < questions.length; i++) {
              const question = questions[i];
              const quizData: QuizData = {
                id: uuidv4(),
                moduleId,
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                timeLimit: question.timeLimit,
                order: i + 1
              };
              store.add(quizData);
            }
          } catch (error) {
            console.error('Error processing questions:', error);
            reject(error);
          }
        };

        getRequest.onerror = () => {
          console.error('Error getting existing questions:', getRequest.error);
          reject(getRequest.error);
        };

        transaction.oncomplete = () => {
          console.log('Successfully saved questions for module:', moduleId);
          resolve();
        };

        transaction.onerror = () => {
          console.error('Transaction error:', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Error in saveQuestions:', error);
      throw error;
    }
  }

  async getAllQuestions(moduleId: string): Promise<QuizData[]> {
    console.log('Getting all questions for module:', moduleId);
    
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const moduleIndex = store.index('moduleId');

      return new Promise((resolve, reject) => {
        const request = moduleIndex.getAll(moduleId);
        
        request.onerror = () => {
          console.error('Error getting questions:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          const questions = request.result as QuizData[];
          questions.sort((a, b) => a.order - b.order);
          console.log('Retrieved questions for module:', moduleId, questions);
          resolve(questions);
        };
      });
    } catch (error) {
      console.error('Error in getAllQuestions:', error);
      throw error;
    }
  }

  async deleteQuestions(moduleId: string): Promise<void> {
    console.log('Deleting questions for module:', moduleId);
    
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const moduleIndex = store.index('moduleId');

        const getRequest = moduleIndex.getAll(moduleId);

        getRequest.onsuccess = () => {
          const questions = getRequest.result as QuizData[];
          for (const question of questions) {
            store.delete(question.id);
          }
        };

        transaction.oncomplete = () => {
          console.log('Successfully deleted questions for module:', moduleId);
          resolve();
        };

        transaction.onerror = () => {
          console.error('Error in transaction:', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Error in deleteQuestions:', error);
      throw error;
    }
  }
}

const quizStorage = new QuizStorage();
export default quizStorage;