import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { env } from './config/env.js';
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import courseRoutes from './modules/course/course.routes.js';
import enrollmentRoutes from './modules/enrollment/enrollment.routes.js';
import assignmentRoutes from './modules/assignment/assignment.routes.js';
import submissionRoutes from './modules/submission/submission.routes.js';
import { submissionCommentRoutes, commentActionRoutes } from './modules/comment/comment.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import fileRoutes from './modules/files/file.routes.js';
import { globalLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

// ensure mandetory upload directories exist on startup
// if not created here, multer will throw an unhandeled exception later
const assignmentUploads = path.join(process.cwd(), 'uploads/assignments');
const submissionUploads = path.join(process.cwd(), 'uploads/submissions');
if (!fs.existsSync(assignmentUploads)) fs.mkdirSync(assignmentUploads, { recursive: true });
if (!fs.existsSync(submissionUploads)) fs.mkdirSync(submissionUploads, { recursive: true });

// quick util to ensure seeded & demo submission files exist on disk
// this prevents 404s when testing code review on a fresh cloned repo
function ensureSampleFilesExist() {
  try {
    // 1. BST Demo Submission (sample typescript data stucture)
    const bstDir = path.join(process.cwd(), 'uploads/submissions/7f94af1b-9591-4206-987f-6f7408fac8fc/7b0dd327-5f3c-4aa5-99bf-c370d62273fd/v1/extracted');
    if (!fs.existsSync(bstDir)) fs.mkdirSync(bstDir, { recursive: true });
    const bstFile = path.join(bstDir, 'BST.ts');
    if (!fs.existsSync(bstFile)) {
      fs.writeFileSync(bstFile, `/**
 * Binary Search Tree Implementation
 * Student: Dimitris Theodorou
 */

export class TreeNode<T> {
  value: T;
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class BinarySearchTree<T> {
  root: TreeNode<T> | null = null;

  insert(value: T): void {
    const newNode = new TreeNode(value);
    if (!this.root) {
      this.root = newNode;
      return;
    }
    this.insertNode(this.root, newNode);
  }

  private insertNode(node: TreeNode<T>, newNode: TreeNode<T>): void {
    if (newNode.value < node.value) {
      if (!node.left) {
        node.left = newNode;
      } else {
        this.insertNode(node.left, newNode);
      }
    } else {
      if (!node.right) {
        node.right = newNode;
      } else {
        this.insertNode(node.right, newNode);
      }
    }
  }

  search(value: T): boolean {
    return this.searchNode(this.root, value);
  }

  private searchNode(node: TreeNode<T> | null, value: T): boolean {
    if (!node) return false;
    if (value < node.value) return this.searchNode(node.left, value);
    if (value > node.value) return this.searchNode(node.right, value);
    return true;
  }
}
`);
      fs.writeFileSync(path.join(bstDir, 'README.md'), '# BST Project\nΥλοποίηση Δυαδικού Δένδρου Αναζήτησης σε TypeScript.\n');
    }

    // 2. Contacts.c Demo Submission
    const contactsDir = path.join(process.cwd(), 'uploads/submissions/f5067dda-e928-44ee-9a9c-2116aeba82a5/79b15f1c-9288-4e31-814b-1029dd700f38/v1/extracted');
    if (!fs.existsSync(contactsDir)) fs.mkdirSync(contactsDir, { recursive: true });
    const contactsFile = path.join(contactsDir, 'contacts.c');
    if (!fs.existsSync(contactsFile)) {
      fs.writeFileSync(contactsFile, `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_CONTACTS 100
#define NAME_LEN 50
#define PHONE_LEN 20

typedef struct {
    char name[NAME_LEN];
    char phone[PHONE_LEN];
    char email[50];
} Contact;

typedef struct {
    Contact contacts[MAX_CONTACTS];
    int count;
} ContactBook;

void init_contact_book(ContactBook *book) {
    book->count = 0;
}

int add_contact(ContactBook *book, const char *name, const char *phone, const char *email) {
    if (book->count >= MAX_CONTACTS) {
        printf("Error: Contact book is full.\\n");
        return -1;
    }
    strncpy(book->contacts[book->count].name, name, NAME_LEN - 1);
    book->contacts[book->count].name[NAME_LEN - 1] = '\\0';
    strncpy(book->contacts[book->count].phone, phone, PHONE_LEN - 1);
    book->contacts[book->count].phone[PHONE_LEN - 1] = '\\0';
    strncpy(book->contacts[book->count].email, email, 49);
    book->contacts[book->count].email[49] = '\\0';
    book->count++;
    return 0;
}

int find_contact(const ContactBook *book, const char *name) {
    for (int i = 0; i < book->count; i++) {
        if (strcmp(book->contacts[i].name, name) == 0) {
            return i;
        }
    }
    return -1;
}

void print_contact(const Contact *c) {
    printf("Name: %s | Phone: %s | Email: %s\\n", c->name, c->phone, c->email);
}

void list_contacts(const ContactBook *book) {
    printf("\\n--- Contact List (%d contacts) ---\\n", book->count);
    for (int i = 0; i < book->count; i++) {
        printf("[%d] ", i + 1);
        print_contact(&book->contacts[i]);
    }
}

int main() {
    ContactBook book;
    init_contact_book(&book);

    add_contact(&book, "Dimitris Theodorou", "+30 6900000000", "dimitris@example.com");
    add_contact(&book, "Kostas Papadopoulos", "+30 6911111111", "papadopoulos@example.com");
    add_contact(&book, "Eleni Georgiou", "+30 6922222222", "georgiou@example.com");

    list_contacts(&book);

    const char *search_name = "Dimitris Theodorou";
    int idx = find_contact(&book, search_name);
    if (idx >= 0) {
        printf("\\nFound contact:\\n");
        print_contact(&book.contacts[idx]);
    } else {
        printf("\\nContact '%s' not found.\\n", search_name);
    }

    return 0;
}
`);
    }

    // 3. Sample Assignment Attachment PDF
    const pdfDir = path.join(process.cwd(), 'uploads/assignments');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
    const pdfFile = path.join(pdfDir, '1788283410405-744741912.pdf');
    if (!fs.existsSync(pdfFile)) {
      const minimalPdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 55 >>
stream
BT
/F1 18 Tf
50 700 Td
(1st Lab Test Exercise - Instructions) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000340 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
426
%%EOF`;
      fs.writeFileSync(pdfFile, minimalPdf);
    }
  } catch (err) {
    console.warn('Could not initialize sample submission files:', err);
  }
}
ensureSampleFilesExist();

const app = express();

// Trust reverse proxy (Railway, Render, Nginx, Cloudflare) - neccessary for accurate ip rate limiting
app.set('trust proxy', 1);

// disable fingerprinting header so we dont advertise express to scanners
app.disable('x-powered-by');

// security headers with helmet (relaxed CSP so monaco editor workers dont get blocked)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows resource loading when needed
    contentSecurityPolicy: false // Disable strict CSP at API layer to avoid conflict with API tools
  })
);

// cors setup - allow dev vite server and configured client origin
// also permits mobile / curl requests where origin is undefiend
const allowedOrigins = [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy violation: Origin ${origin} not allowed.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // Cache preflight response for 24 hours
  })
);

// parse json payloads - set to 10mb because zip submissions or large asts might get chunky
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For parsing application/x-www-form-urlencoded

// global limiter against brute force / spam
app.use('/api', globalLimiter);

// basic healthcheck endpoint to verify api is up
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Academic Code Review Platform API is running',
    timestamp: new Date().toISOString(),
  });
});

// register domain route handlers
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses/:courseId/assignments', assignmentRoutes);
app.use('/api/assignments/:assignmentId/submissions', submissionRoutes);
app.use('/api/submissions/:submissionId/comments', submissionCommentRoutes);
app.use('/api/comments', commentActionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/files', fileRoutes);

// serve compiled frontend in single-container deployment if dist exists
// fallback any non-api request to index.html for client side routing
const clientDistPath = path.resolve(process.cwd(), 'client/dist');
const altClientDistPath = path.resolve(process.cwd(), '../client/dist');
const finalDistPath = fs.existsSync(clientDistPath) ? clientDistPath : (fs.existsSync(altClientDistPath) ? altClientDistPath : null);

if (finalDistPath) {
  app.use(express.static(finalDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(finalDistPath, 'index.html'));
  });
}

// central error handeler - must stay at the bottom of the middleware stack
app.use(errorHandler);

export default app;
