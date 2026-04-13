import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { sign, verify } from 'hono/jwt';
import bcrypt from 'bcryptjs';

// Bindings type for Cloudflare env
type Bindings = {
  DB: any; // Using any for D1Database to avoid ts error without @cloudflare/workers-types fully configured
  JWT_SECRET?: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

const getJwtSecret = (env: Bindings) => env.JWT_SECRET || 'your-secret-key-123456';

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return c.json({ error: 'Unauthorized' }, 401 as any);

  try {
    const payload = await verify(token, getJwtSecret(c.env), 'HS256' as any);
    c.set('user', payload);
    await next();
  } catch (err) {
    return c.json({ error: 'Forbidden' }, 403 as any);
  }
};

// Login route
app.post('/login', async (c) => {
  const { username, password } = await c.req.json();
  
  try {
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
    
    if (user && bcrypt.compareSync(password, user.password as string)) {
      const token = await sign({ username, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, getJwtSecret(c.env));
      return c.json({ token });
    } else {
      return c.json({ error: 'Invalid credentials' }, 401 as any);
    }
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500 as any);
  }
});

// Get all companies
app.get('/companies', async (c) => {
  try {
    const { results: companies } = await c.env.DB.prepare('SELECT * FROM companies').all();
    
    const result = [];
    for (const company of companies) {
      const { results: facts } = await c.env.DB.prepare('SELECT * FROM facts WHERE companyId = ?').bind(company.id).all();
      const { results: timeline } = await c.env.DB.prepare('SELECT * FROM timeline_events WHERE companyId = ?').bind(company.id).all();
      const { results: contractTerms } = await c.env.DB.prepare('SELECT * FROM contract_terms WHERE companyId = ?').bind(company.id).all();
      
      result.push({
        ...company,
        tags: JSON.parse((company.tags as string) || '[]'),
        facts,
        timeline,
        contractTerms
      });
    }
    
    return c.json(result);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500 as any);
  }
});

// Submit company (Public, defaults to draft)
app.post('/companies/submit', async (c) => {
  const company = await c.req.json();
  const status = 'draft';
  const isEdit = !!company.id;
  const id = isEdit ? company.id : Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const updatedAt = new Date().toISOString();

  try {
    const stmts = [];

    if (isEdit) {
      stmts.push(
        c.env.DB.prepare(`
          UPDATE companies 
          SET name = ?, city = ?, industry = ?, summary = ?, logoUrl = ?, tags = ?, status = ?, updatedAt = ?
          WHERE id = ?
        `).bind(
          company.name, company.city, company.industry, 
          company.summary, company.logoUrl || null, JSON.stringify(company.tags || []), 
          status, updatedAt, id
        )
      );
      stmts.push(c.env.DB.prepare('DELETE FROM facts WHERE companyId = ?').bind(id));
      stmts.push(c.env.DB.prepare('DELETE FROM timeline_events WHERE companyId = ?').bind(id));
      stmts.push(c.env.DB.prepare('DELETE FROM contract_terms WHERE companyId = ?').bind(id));
    } else {
      stmts.push(
        c.env.DB.prepare(`
          INSERT INTO companies (id, name, city, industry, summary, logoUrl, tags, status, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id, company.name, company.city, company.industry, 
          company.summary, company.logoUrl || null, JSON.stringify(company.tags || []), 
          status, updatedAt
        )
      );
    }

    for (const fact of company.facts || []) {
      const factId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      stmts.push(
        c.env.DB.prepare(`
          INSERT INTO facts (id, companyId, content, evidenceUrl, remark)
          VALUES (?, ?, ?, ?, ?)
        `).bind(factId, id, fact.content, fact.evidenceUrl || null, fact.remark || null)
      );
    }

    for (const event of company.timeline || []) {
      const eventId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      stmts.push(
        c.env.DB.prepare(`
          INSERT INTO timeline_events (id, companyId, date, description, evidenceUrl, impact)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(eventId, id, event.date, event.description, event.evidenceUrl || null, event.impact || null)
      );
    }

    for (const term of company.contractTerms || []) {
      const termId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      stmts.push(
        c.env.DB.prepare(`
          INSERT INTO contract_terms (id, companyId, originalText, problem, risk, suggestion, evidenceUrl)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(termId, id, term.originalText, term.problem, term.risk, term.suggestion, term.evidenceUrl || null)
      );
    }

    await c.env.DB.batch(stmts);
    return c.json({ id, message: isEdit ? 'Feedback submitted successfully' : 'Submitted successfully' }, 201 as any);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to submit company' }, 500 as any);
  }
});

// Add company (Protected)
app.post('/companies', authMiddleware, async (c) => {
  const company = await c.req.json();
  
  try {
    const stmts = [];
    
    stmts.push(
      c.env.DB.prepare(`
        INSERT INTO companies (id, name, city, industry, summary, logoUrl, tags, status, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        company.id, company.name, company.city, company.industry, 
        company.summary, company.logoUrl || null, JSON.stringify(company.tags), 
        company.status, company.updatedAt
      )
    );

    for (const fact of company.facts || []) {
      stmts.push(
        c.env.DB.prepare(`
          INSERT INTO facts (id, companyId, content, evidenceUrl, remark)
          VALUES (?, ?, ?, ?, ?)
        `).bind(fact.id, company.id, fact.content, fact.evidenceUrl || null, fact.remark || null)
      );
    }

    for (const event of company.timeline || []) {
      stmts.push(
        c.env.DB.prepare(`
          INSERT INTO timeline_events (id, companyId, date, description, evidenceUrl, impact)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(event.id, company.id, event.date, event.description, event.evidenceUrl || null, event.impact || null)
      );
    }

    for (const term of company.contractTerms || []) {
      stmts.push(
        c.env.DB.prepare(`
          INSERT INTO contract_terms (id, companyId, originalText, problem, risk, suggestion, evidenceUrl)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(term.id, company.id, term.originalText, term.problem, term.risk, term.suggestion, term.evidenceUrl || null)
      );
    }

    await c.env.DB.batch(stmts);
    return c.json(company, 201 as any);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to insert company' }, 500 as any);
  }
});

// Update company (Protected)
app.put('/companies/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const company = await c.req.json();
  
  try {
    const stmts = [];
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
      stmts.push(
        c.env.DB.prepare(`UPDATE companies SET ${updateFields.join(', ')} WHERE id = ?`).bind(...updateValues)
      );
    }

    if (company.facts) {
      stmts.push(c.env.DB.prepare('DELETE FROM facts WHERE companyId = ?').bind(id));
      for (const fact of company.facts) {
        stmts.push(
          c.env.DB.prepare(`
            INSERT INTO facts (id, companyId, content, evidenceUrl, remark)
            VALUES (?, ?, ?, ?, ?)
          `).bind(fact.id, id, fact.content, fact.evidenceUrl || null, fact.remark || null)
        );
      }
    }

    if (company.timeline) {
      stmts.push(c.env.DB.prepare('DELETE FROM timeline_events WHERE companyId = ?').bind(id));
      for (const event of company.timeline) {
        stmts.push(
          c.env.DB.prepare(`
            INSERT INTO timeline_events (id, companyId, date, description, evidenceUrl, impact)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(event.id, id, event.date, event.description, event.evidenceUrl || null, event.impact || null)
        );
      }
    }

    if (company.contractTerms) {
      stmts.push(c.env.DB.prepare('DELETE FROM contract_terms WHERE companyId = ?').bind(id));
      for (const term of company.contractTerms) {
        stmts.push(
          c.env.DB.prepare(`
            INSERT INTO contract_terms (id, companyId, originalText, problem, risk, suggestion, evidenceUrl)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(term.id, id, term.originalText, term.problem, term.risk, term.suggestion, term.evidenceUrl || null)
        );
      }
    }

    await c.env.DB.batch(stmts);
    return c.json({ message: 'Updated successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to update company' }, 500 as any);
  }
});

// Delete company (Protected)
app.delete('/companies/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  try {
    await c.env.DB.prepare('DELETE FROM companies WHERE id = ?').bind(id).run();
    return c.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to delete company' }, 500 as any);
  }
});

// Settings routes
app.get('/settings', async (c) => {
  try {
    const { results: settings } = await c.env.DB.prepare('SELECT * FROM settings').all();
    const result = settings.reduce((acc: Record<string, string>, cur: any) => {
      acc[cur.key] = cur.value;
      return acc;
    }, {});
    return c.json(result);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500 as any);
  }
});

app.put('/settings', authMiddleware, async (c) => {
  try {
    const updates = await c.req.json();
    const stmts = [];
    
    for (const [key, value] of Object.entries(updates)) {
      stmts.push(
        c.env.DB.prepare(`
          INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `).bind(key, value)
      );
    }
    
    await c.env.DB.batch(stmts);
    return c.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to update settings' }, 500 as any);
  }
});

export const onRequest = handle(app);
