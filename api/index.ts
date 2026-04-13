import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './db.js';

import { Request, Response, NextFunction } from 'express';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key-123456';

app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req: Request & { user?: Record<string, unknown> }, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: Error | null, user: string | jwt.JwtPayload | undefined) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user as Record<string, unknown>;
    next();
  });
};

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as { username: string, password: string } | undefined;
    
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all companies (public ones or all for admin)
app.get('/api/companies', (req, res) => {
  try {
    const companies = db.prepare('SELECT * FROM companies').all() as Record<string, string | number>[];
    
    const result = companies.map(c => {
      const facts = db.prepare('SELECT * FROM facts WHERE companyId = ?').all(c.id);
      const timeline = db.prepare('SELECT * FROM timeline_events WHERE companyId = ?').all(c.id);
      const contractTerms = db.prepare('SELECT * FROM contract_terms WHERE companyId = ?').all(c.id);
      
      return {
        ...c,
        tags: JSON.parse(c.tags),
        facts,
        timeline,
        contractTerms
      };
    });
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit company (Public, defaults to draft)
app.post('/api/companies/submit', (req, res) => {
  const company = req.body;
  // Ensure status is forced to 'draft' regardless of what client sends
  const status = 'draft';
  // Use provided ID if it's an edit/feedback, otherwise generate a new one
  const isEdit = !!company.id;
  const id = isEdit ? company.id : Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const updatedAt = new Date().toISOString();

  try {
    db.transaction(() => {
      if (isEdit) {
        // Update existing company and set status to draft
        db.prepare(`
          UPDATE companies 
          SET name = ?, city = ?, industry = ?, summary = ?, logoUrl = ?, tags = ?, status = ?, updatedAt = ?
          WHERE id = ?
        `).run(
          company.name, company.city, company.industry, 
          company.summary, company.logoUrl || null, JSON.stringify(company.tags || []), 
          status, updatedAt, id
        );

        // Delete existing relations before inserting new ones
        db.prepare('DELETE FROM facts WHERE companyId = ?').run(id);
        db.prepare('DELETE FROM timeline_events WHERE companyId = ?').run(id);
        db.prepare('DELETE FROM contract_terms WHERE companyId = ?').run(id);
      } else {
        // Insert new company
        db.prepare(`
          INSERT INTO companies (id, name, city, industry, summary, logoUrl, tags, status, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id, company.name, company.city, company.industry, 
          company.summary, company.logoUrl || null, JSON.stringify(company.tags || []), 
          status, updatedAt
        );
      }

      // Insert relations (works for both new and edit cases)
      for (const fact of company.facts || []) {
        const factId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        db.prepare(`
          INSERT INTO facts (id, companyId, content, evidenceUrl, remark)
          VALUES (?, ?, ?, ?, ?)
        `).run(factId, id, fact.content, fact.evidenceUrl || null, fact.remark || null);
      }

      for (const event of company.timeline || []) {
        const eventId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        db.prepare(`
          INSERT INTO timeline_events (id, companyId, date, description, evidenceUrl, impact)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(eventId, id, event.date, event.description, event.evidenceUrl || null, event.impact || null);
      }

      for (const term of company.contractTerms || []) {
        const termId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        db.prepare(`
          INSERT INTO contract_terms (id, companyId, originalText, problem, risk, suggestion, evidenceUrl)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(termId, id, term.originalText, term.problem, term.risk, term.suggestion, term.evidenceUrl || null);
      }
    })();
    
    res.status(201).json({ id, message: isEdit ? 'Feedback submitted successfully' : 'Submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit company' });
  }
});

// Add company (Protected)
app.post('/api/companies', authenticateToken, (req, res) => {
  const company = req.body;
  
  try {
    db.transaction(() => {
      db.prepare(`
        INSERT INTO companies (id, name, city, industry, summary, logoUrl, tags, status, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        company.id, company.name, company.city, company.industry, 
        company.summary, company.logoUrl || null, JSON.stringify(company.tags), 
        company.status, company.updatedAt
      );

      for (const fact of company.facts || []) {
        db.prepare(`
          INSERT INTO facts (id, companyId, content, evidenceUrl, remark)
          VALUES (?, ?, ?, ?, ?)
        `).run(fact.id, company.id, fact.content, fact.evidenceUrl || null, fact.remark || null);
      }

      for (const event of company.timeline || []) {
        db.prepare(`
          INSERT INTO timeline_events (id, companyId, date, description, evidenceUrl, impact)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(event.id, company.id, event.date, event.description, event.evidenceUrl || null, event.impact || null);
      }

      for (const term of company.contractTerms || []) {
        db.prepare(`
          INSERT INTO contract_terms (id, companyId, originalText, problem, risk, suggestion, evidenceUrl)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(term.id, company.id, term.originalText, term.problem, term.risk, term.suggestion, term.evidenceUrl || null);
      }
    })();
    
    res.status(201).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to insert company' });
  }
});

// Update company (Protected)
app.put('/api/companies/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const company = req.body;
  
  try {
    db.transaction(() => {
      // Update main company details
      const updateFields: string[] = [];
      const updateValues: (string | number)[] = [];
      
      const updatableKeys = ['name', 'city', 'industry', 'summary', 'logoUrl', 'status', 'updatedAt'];
      
      for (const key of updatableKeys) {
        if (company[key] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(company[key]);
        }
      }
      
      if (company.tags) {
        updateFields.push('tags = ?');
        updateValues.push(JSON.stringify(company.tags));
      }
      
      if (updateFields.length > 0) {
        updateValues.push(id);
        db.prepare(`UPDATE companies SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
      }

      // We completely replace the nested relationships for simplicity
      if (company.facts) {
        db.prepare('DELETE FROM facts WHERE companyId = ?').run(id);
        for (const fact of company.facts) {
          db.prepare(`
            INSERT INTO facts (id, companyId, content, evidenceUrl, remark)
            VALUES (?, ?, ?, ?, ?)
          `).run(fact.id, id, fact.content, fact.evidenceUrl || null, fact.remark || null);
        }
      }

      if (company.timeline) {
        db.prepare('DELETE FROM timeline_events WHERE companyId = ?').run(id);
        for (const event of company.timeline) {
          db.prepare(`
            INSERT INTO timeline_events (id, companyId, date, description, evidenceUrl, impact)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(event.id, id, event.date, event.description, event.evidenceUrl || null, event.impact || null);
        }
      }

      if (company.contractTerms) {
        db.prepare('DELETE FROM contract_terms WHERE companyId = ?').run(id);
        for (const term of company.contractTerms) {
          db.prepare(`
            INSERT INTO contract_terms (id, companyId, originalText, problem, risk, suggestion, evidenceUrl)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(term.id, id, term.originalText, term.problem, term.risk, term.suggestion, term.evidenceUrl || null);
        }
      }
    })();
    
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete company (Protected)
app.delete('/api/companies/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM companies WHERE id = ?').run(id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// Settings routes
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all() as { key: string; value: string }[];
    const result = settings.reduce((acc: Record<string, string>, cur) => {
      acc[cur.key] = cur.value;
      return acc;
    }, {});
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/settings', authenticateToken, (req, res) => {
  try {
    const updates = req.body;
    db.transaction(() => {
      for (const [key, value] of Object.entries(updates)) {
        db.prepare(`
          INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `).run(key, value);
      }
    })();
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});