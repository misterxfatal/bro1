import { v4 as uuidv4 } from 'uuid';
import initSqlJs, { SqlJsStatic, Database as SQLDatabase } from 'sql.js';
import { Module, Badge, Progress, LeaderboardEntry, Question, User } from '../types';
import { saveToIndexedDB, loadFromIndexedDB } from './storage';
import quizStorage from './quizStorage';

class Database {
  private db: SQLDatabase | null = null;
  private initialized: boolean = false;

  private getDb(): SQLDatabase {
    if (!this.db || !this.initialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  private async saveDb(): Promise<void> {
    if (!this.db) return;
    console.log('Saving database state to IndexedDB...');
    const data = this.db.export();
    await saveToIndexedDB(data);
    console.log('Database state saved successfully');
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('Initializing database...');
      const SQL = await initSqlJs({
        locateFile: file => `/${file}`
      });

      // Try to load existing database from IndexedDB
      const savedData = await loadFromIndexedDB();
      if (savedData) {
        console.log('Loading database from IndexedDB');
        this.db = new SQL.Database(savedData);
      } else {
        console.log('Creating new database');
        this.db = new SQL.Database();
        
        // Create necessary tables with proper constraints and indices
        this.db.exec(`
          CREATE TABLE IF NOT EXISTS modules (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            difficulty TEXT,
            time_limit INTEGER DEFAULT 1800,
            passing_score INTEGER DEFAULT 70,
            randomize INTEGER DEFAULT 0,
            instant_feedback INTEGER DEFAULT 1,
            created_by TEXT,
            deleted_at TEXT,
            xp_reward INTEGER DEFAULT 100,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);
          CREATE INDEX IF NOT EXISTS idx_modules_difficulty ON modules(difficulty);

          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            xp INTEGER DEFAULT 0,
            role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
            last_login TEXT
          );

          CREATE TABLE IF NOT EXISTS user_progress (
            user_id TEXT NOT NULL,
            module_id TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            score INTEGER DEFAULT 0,
            last_attempt TEXT DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, module_id),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(module_id) REFERENCES modules(id) ON DELETE CASCADE
          );

          CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
          CREATE INDEX IF NOT EXISTS idx_user_progress_module ON user_progress(module_id);
        `);

        // Create admin user
        const adminStmt = this.db.prepare(`
          INSERT INTO users (id, username, password, role, last_login)
          VALUES (?, ?, ?, 'admin', CURRENT_TIMESTAMP)
        `);
        
        adminStmt.run([uuidv4(), 'admin', 'SpaccoTutto2005']);
        adminStmt.free();

        await this.initializeSampleData();
        await this.saveDb();
      }

      this.initialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  public async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const stmt = this.getDb().prepare(`
        SELECT 
          u.id,
          u.username,
          u.xp,
          COUNT(CASE WHEN up.completed = 1 THEN 1 END) as modules_completed
        FROM users u
        LEFT JOIN user_progress up ON u.id = up.user_id
        GROUP BY u.id, u.username, u.xp
        ORDER BY u.xp DESC, modules_completed DESC
        LIMIT 100
      `);

      const results: LeaderboardEntry[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push({
          id: row.id as string,
          username: row.username as string,
          xp: row.xp as number,
          modules_completed: row.modules_completed as number
        });
      }
      stmt.free();

      return results;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  private async initializeSampleData(): Promise<void> {
    try {
      // Create Linux Fundamentals module
      const linuxModuleId = uuidv4();
      const moduleStmt = this.db!.prepare(`
        INSERT INTO modules (
          id, title, description, category, difficulty,
          time_limit, passing_score, randomize, instant_feedback,
          xp_reward, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      moduleStmt.run([
        linuxModuleId,
        'Linux Fundamentals',
        'Master the essential concepts and commands in Linux operating system. Learn file management, directory navigation, permissions, and basic system administration.',
        'Linux',
        'Beginner',
        1800,
        70,
        1,
        1,
        100
      ]);

      // Create Cyber Security Fundamentals module
      const cyberModuleId = uuidv4();
      moduleStmt.run([
        cyberModuleId,
        'Cyber Security Fundamentals',
        'Master the core concepts of cybersecurity including CIA triad, security roles, operating systems, and networking fundamentals.',
        'Security',
        'Beginner',
        2400,
        70,
        1,
        1,
        150
      ]);

      moduleStmt.free();

      // Initialize Linux module questions
      await this.initializeSampleQuestions(linuxModuleId);

      // Initialize Cyber Security module questions
      const cyberQuestions = [
        {
          question: 'What are the three main components of the CIA triad?',
          options: [
            'Confidentiality, Integrity, Availability',
            'Control, Implementation, Authentication',
            'Cryptography, Infrastructure, Access',
            'Communication, Information, Assurance'
          ],
          correctAnswer: 0,
          timeLimit: 60,
          order: 1
        },
        {
          question: 'Which team is responsible for defending against cyber attacks?',
          options: [
            'Blue Team',
            'Red Team',
            'Green Team',
            'Yellow Team'
          ],
          correctAnswer: 0,
          timeLimit: 60,
          order: 2
        },
        {
          question: 'What is the primary responsibility of a CISO?',
          options: [
            'Managing the organization\'s information security program',
            'Writing code for security applications',
            'Performing penetration tests',
            'Monitoring network traffic'
          ],
          correctAnswer: 0,
          timeLimit: 60,
          order: 3
        },
        {
          question: 'Which layer of the OSI model deals with routing and IP addressing?',
          options: [
            'Network Layer',
            'Transport Layer',
            'Data Link Layer',
            'Physical Layer'
          ],
          correctAnswer: 0,
          timeLimit: 60,
          order: 4
        },
        {
          question: 'What is the purpose of the DHCP protocol?',
          options: [
            'Automatically assign IP addresses to network devices',
            'Secure network communications',
            'Transfer files between computers',
            'Manage email communications'
          ],
          correctAnswer: 0,
          timeLimit: 60,
          order: 5
        }
      ];

      await quizStorage.saveQuestions(cyberModuleId, cyberQuestions);

      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }

  private async initializeSampleQuestions(moduleId: string): Promise<void> {
    const questions = [
      {
        question: 'What command is used to list files and directories in Linux?',
        options: ['ls', 'dir', 'show', 'list'],
        correctAnswer: 0,
        timeLimit: 60,
        order: 1
      },
      {
        question: 'Which command is used to change directories?',
        options: ['cd', 'chdir', 'move', 'goto'],
        correctAnswer: 0,
        timeLimit: 60,
        order: 2
      },
      {
        question: 'What command displays the current working directory?',
        options: ['pwd', 'cwd', 'dir', 'present'],
        correctAnswer: 0,
        timeLimit: 60,
        order: 3
      },
      {
        question: 'Which command is used to create a new directory?',
        options: ['mkdir', 'newdir', 'createdir', 'md'],
        correctAnswer: 0,
        timeLimit: 60,
        order: 4
      },
      {
        question: 'What command is used to remove a file?',
        options: ['rm', 'del', 'delete', 'remove'],
        correctAnswer: 0,
        timeLimit: 60,
        order: 5
      }
    ];

    await quizStorage.saveQuestions(moduleId, questions);
    console.log('Sample questions initialized for module:', moduleId);
  }

  public async getUser(userId: string): Promise<User | null> {
    try {
      const stmt = this.getDb().prepare(`
        SELECT id, username, xp, role, last_login as lastLogin
        FROM users 
        WHERE id = ?
      `);
      
      const result = stmt.getAsObject([userId]) as User;
      stmt.free();
      
      return result.id ? result : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  public async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      // Get user's XP and completed modules
      const user = await this.getUser(userId);
      if (!user) return [];

      const progressStmt = this.getDb().prepare(`
        SELECT COUNT(*) as completed_modules
        FROM user_progress
        WHERE user_id = ? AND completed = 1
      `);
      
      const progress = progressStmt.getAsObject([userId]);
      progressStmt.free();

      const completedModules = (progress as any).completed_modules || 0;
      const userXP = user.xp || 0;

      // Define badge criteria
      const badges: Badge[] = [
        {
          id: 'beginner',
          name: 'Beginner',
          description: 'Earned your first XP points',
          requirement: 'XP',
          requirement_value: 100,
          earned_at: userXP >= 100 ? new Date().toISOString() : undefined
        },
        {
          id: 'intermediate',
          name: 'Intermediate',
          description: 'Reached 500 XP',
          requirement: 'XP',
          requirement_value: 500,
          earned_at: userXP >= 500 ? new Date().toISOString() : undefined
        },
        {
          id: 'advanced',
          name: 'Advanced',
          description: 'Reached 1000 XP',
          requirement: 'XP',
          requirement_value: 1000,
          earned_at: userXP >= 1000 ? new Date().toISOString() : undefined
        },
        {
          id: 'module_master',
          name: 'Module Master',
          description: 'Completed 5 modules',
          requirement: 'Modules',
          requirement_value: 5,
          earned_at: completedModules >= 5 ? new Date().toISOString() : undefined
        }
      ];

      // Return only earned badges
      return badges.filter(badge => badge.earned_at !== undefined);
    } catch (error) {
      console.error('Error getting user badges:', error);
      return [];
    }
  }

  public async getAllBadges(): Promise<Badge[]> {
    return [
      {
        id: 'beginner',
        name: 'Beginner',
        description: 'Earned your first XP points',
        requirement: 'XP',
        requirement_value: 100
      },
      {
        id: 'intermediate',
        name: 'Intermediate',
        description: 'Reached 500 XP',
        requirement: 'XP',
        requirement_value: 500
      },
      {
        id: 'advanced',
        name: 'Advanced',
        description: 'Reached 1000 XP',
        requirement: 'XP',
        requirement_value: 1000
      },
      {
        id: 'module_master',
        name: 'Module Master',
        description: 'Completed 5 modules',
        requirement: 'Modules',
        requirement_value: 5
      }
    ];
  }

  public async getModuleQuestions(moduleId: string): Promise<Question[]> {
    try {
      return await quizStorage.getQuestions(moduleId);
    } catch (error) {
      console.error('Error getting module questions:', error);
      return [];
    }
  }

  public async deleteQuestionsByModuleId(moduleId: string): Promise<void> {
    try {
      await quizStorage.deleteQuestions(moduleId);
    } catch (error) {
      console.error('Error deleting questions:', error);
      throw error;
    }
  }

  public async saveQuestions(moduleId: string, questions: { question: string; options: string[]; correctAnswer: number; timeLimit: number }[]): Promise<void> {
    try {
      await quizStorage.saveQuestions(moduleId, questions);
    } catch (error) {
      console.error('Error saving questions:', error);
      throw error;
    }
  }

  public async getModuleById(id: string): Promise<Module | null> {
    try {
      console.log('Fetching module:', id);
      const stmt = this.getDb().prepare('SELECT * FROM modules WHERE id = ?');
      const result = stmt.getAsObject([id]) as Module;
      stmt.free();
      
      console.log('Retrieved module:', result);
      return result;
    } catch (error) {
      console.error('Error getting module by id:', error);
      return null;
    }
  }

  public async getModules(): Promise<Module[]> {
    try {
      const stmt = this.getDb().prepare(`
        SELECT * FROM modules 
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
      `);
      
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject() as Module);
      }
      stmt.free();
      
      return results;
    } catch (error) {
      console.error('Error getting modules:', error);
      return [];
    }
  }

  public async createModule(moduleData: Omit<Module, 'id' | 'created_at'>): Promise<Module | null> {
    try {
      const moduleId = uuidv4();
      const stmt = this.getDb().prepare(`
        INSERT INTO modules (
          id, title, description, category, difficulty, 
          time_limit, passing_score, randomize, instant_feedback, created_by,
          xp_reward, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      stmt.run([
        moduleId,
        moduleData.title,
        moduleData.description,
        moduleData.category,
        moduleData.difficulty,
        moduleData.time_limit,
        moduleData.passing_score,
        moduleData.randomize ? 1 : 0,
        moduleData.instant_feedback ? 1 : 0,
        moduleData.created_by,
        moduleData.xp_reward
      ]);
      stmt.free();
      
      await this.saveDb();
      return this.getModuleById(moduleId);
    } catch (error) {
      console.error('Error creating module:', error);
      return null;
    }
  }

  public async updateModule(moduleId: string, moduleData: Partial<Module>): Promise<Module | null> {
    try {
      const updateFields = [];
      const values = [];
      
      Object.entries(moduleData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          values.push(value);
        }
      });
      
      if (updateFields.length === 0) return null;
      
      values.push(moduleId);
      
      const stmt = this.getDb().prepare(`
        UPDATE modules 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `);
      
      stmt.run(values);
      stmt.free();
      
      await this.saveDb();
      return this.getModuleById(moduleId);
    } catch (error) {
      console.error('Error updating module:', error);
      return null;
    }
  }

  public async deleteModule(moduleId: string): Promise<boolean> {
    try {
      const stmt = this.getDb().prepare(`
        UPDATE modules 
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      stmt.run([moduleId]);
      stmt.free();
      
      await this.saveDb();
      return true;
    } catch (error) {
      console.error('Error deleting module:', error);
      return false;
    }
  }

  public async updateProgress(userId: string, moduleId: string, completed: boolean, score: number): Promise<boolean> {
    try {
      console.log('Updating progress:', { userId, moduleId, completed, score });

      // First check if this module was already completed
      const checkStmt = this.getDb().prepare(`
        SELECT completed, score FROM user_progress 
        WHERE user_id = ? AND module_id = ?
      `);
      const existing = checkStmt.getAsObject([userId, moduleId]);
      checkStmt.free();

      console.log('Existing progress:', existing);

      // Get module XP reward
      const moduleStmt = this.getDb().prepare('SELECT xp_reward, passing_score FROM modules WHERE id = ?');
      const module = moduleStmt.getAsObject([moduleId]);
      moduleStmt.free();
      
      const xpReward = (module as any).xp_reward || 0;
      const passingScore = (module as any).passing_score || 70;

      console.log('Module info:', { xpReward, passingScore });

      // Insert or update progress
      const stmt = this.getDb().prepare(`
        INSERT OR REPLACE INTO user_progress (
          user_id, module_id, completed, score, last_attempt
        )
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      stmt.run([userId, moduleId, completed ? 1 : 0, score]);
      stmt.free();

      console.log('Progress updated in database');
      
      // Only award XP if:
      // 1. The module is being completed (completed = true)
      // 2. The score is passing (>= passing_score)
      // 3. The module wasn't previously completed
      if (completed && score >= passingScore && (!existing.completed || existing.completed === 0)) {
        console.log('Awarding XP:', xpReward);
        const xpStmt = this.getDb().prepare(`
          UPDATE users 
          SET xp = xp + ?
          WHERE id = ?
        `);
        xpStmt.run([xpReward, userId]);
        xpStmt.free();
        console.log('XP awarded successfully');
      }
      
      await this.saveDb();
      console.log('Progress update completed successfully');
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  }

  public async getUserProgress(userId: string): Promise<Progress[]> {
    try {
      console.log('Getting user progress for:', userId);
      const stmt = this.getDb().prepare(`
        SELECT up.*, m.title as module_title
        FROM user_progress up
        JOIN modules m ON up.module_id = m.id
        WHERE up.user_id = ?
        ORDER BY up.last_attempt DESC
      `);
      
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject() as Progress);
      }
      stmt.free();
      
      console.log('Retrieved user progress:', results);
      return results;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return [];
    }
  }

  public async loginUser(username: string, password: string): Promise<User | null> {
    try {
      const stmt = this.getDb().prepare(`
        SELECT id, username, xp, role, last_login 
        FROM users 
        WHERE username = ? AND password = ?
      `);
      
      const result = stmt.getAsObject([username, password]);
      stmt.free();

      if (result.id) {
        // Update last login time
        const updateStmt = this.getDb().prepare(`
          UPDATE users 
          SET last_login = CURRENT_TIMESTAMP 
          WHERE id = ?
        `);
        updateStmt.run([result.id]);
        updateStmt.free();
        
        await this.saveDb();
        return {
          id: result.id as string,
          username: result.username as string,
          xp: result.xp as number,
          role: result.role as 'admin' | 'user',
          lastLogin: result.last_login as string
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error logging in user:', error);
      return null;
    }
  }

  public async registerUser(username: string, password: string): Promise<User | null> {
    try {
      // Check if username already exists
      const checkStmt = this.getDb().prepare('SELECT id FROM users WHERE username = ?');
      const existing = checkStmt.getAsObject([username]);
      checkStmt.free();
      
      if (existing.id) {
        return null; // Username already taken
      }

      const userId = uuidv4();
      const stmt = this.getDb().prepare(`
        INSERT INTO users (id, username, password, role, last_login)
        VALUES (?, ?, ?, 'user', CURRENT_TIMESTAMP)
      `);
      
      stmt.run([userId, username, password]);
      stmt.free();

      await this.saveDb();
      return {
        id: userId,
        username,
        xp: 0,
        role: 'user',
        lastLogin: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return null;
    }
  }
}

const database = new Database();
export { database };
export default database;