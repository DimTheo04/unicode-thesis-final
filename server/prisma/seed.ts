import { PrismaClient, Role, EnrollmentStatus, SubmissionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive database seed for thesis demo...\n');

  const defaultPassword = 'password123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  const adminHashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Users
  console.log('Creating users (Admin, Teachers, Students)...');
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { isApproved: true, role: Role.ADMIN },
    create: {
      username: 'admin',
      fullName: 'System Administrator',
      email: 'admin@platform.ac.gr',
      dateOfBirth: new Date('1990-01-01'),
      passwordHash: adminHashedPassword,
      role: Role.ADMIN,
      isApproved: true,
    },
  });

  const teacher1 = await prisma.user.upsert({
    where: { username: 'prof.papadopoulos' },
    update: { isApproved: true, role: Role.TEACHER },
    create: {
      username: 'prof.papadopoulos',
      fullName: 'Δρ. Κωνσταντίνος Παπαδόπουλος',
      email: 'papadopoulos@cs.ac.gr',
      dateOfBirth: new Date('1980-05-15'),
      passwordHash: hashedPassword,
      role: Role.TEACHER,
      isApproved: true,
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { username: 'prof.georgiou' },
    update: { isApproved: true, role: Role.TEACHER },
    create: {
      username: 'prof.georgiou',
      fullName: 'Δρ. Ελένη Γεωργίου',
      email: 'georgiou@cs.ac.gr',
      dateOfBirth: new Date('1985-11-20'),
      passwordHash: hashedPassword,
      role: Role.TEACHER,
      isApproved: true,
    },
  });

  const student1 = await prisma.user.upsert({
    where: { username: 'student.theodorou' },
    update: { isApproved: true, role: Role.STUDENT },
    create: {
      username: 'student.theodorou',
      fullName: 'Παναγιώτης Θεοδώρου',
      email: 'ptheodorou@student.ac.gr',
      dateOfBirth: new Date('2002-04-10'),
      passwordHash: hashedPassword,
      role: Role.STUDENT,
      isApproved: true,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { username: 'student.nikolaou' },
    update: { isApproved: true, role: Role.STUDENT },
    create: {
      username: 'student.nikolaou',
      fullName: 'Νικόλαος Νικολάου',
      email: 'nikolaou@student.ac.gr',
      dateOfBirth: new Date('2003-08-25'),
      passwordHash: hashedPassword,
      role: Role.STUDENT,
      isApproved: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'student.pending' },
    update: { isApproved: false, role: Role.STUDENT },
    create: {
      username: 'student.pending',
      fullName: 'Μαρία Δημητρίου',
      email: 'mdimitriou@student.ac.gr',
      dateOfBirth: new Date('2003-02-14'),
      passwordHash: hashedPassword,
      role: Role.STUDENT,
      isApproved: false,
    },
  });

  // 2. Create Courses
  console.log('Creating courses...');
  const course1 = await prisma.course.upsert({
    where: { code: 'CS-101' },
    update: { teachers: { connect: [{ id: teacher1.id }] } },
    create: {
      code: 'CS-101',
      title: 'Εισαγωγή στον Αντικειμενοστραφή Προγραμματισμό',
      description: 'Βασικές αρχές OOP, κλάσεις, αντικείμενα, κληρονομικότητα και πολυμορφισμός σε Java & TypeScript.',
      teachers: { connect: [{ id: teacher1.id }] },
    },
  });

  await prisma.course.upsert({
    where: { code: 'CS-302' },
    update: { teachers: { connect: [{ id: teacher2.id }] } },
    create: {
      code: 'CS-302',
      title: 'Τεχνολογία Λογισμικού & Αρχιτεκτονική',
      description: 'Σχεδιαστικά πρότυπα (Design Patterns), REST APIs, Unit Testing, CI/CD και Code Reviews.',
      teachers: { connect: [{ id: teacher2.id }] },
    },
  });

  // 3. Enrollments
  console.log('Creating enrollments...');
  await prisma.enrollment.upsert({
    where: { courseId_studentId: { courseId: course1.id, studentId: student1.id } },
    update: { status: EnrollmentStatus.ACCEPTED },
    create: { courseId: course1.id, studentId: student1.id, status: EnrollmentStatus.ACCEPTED }
  });

  await prisma.enrollment.upsert({
    where: { courseId_studentId: { courseId: course1.id, studentId: student2.id } },
    update: { status: EnrollmentStatus.ACCEPTED },
    create: { courseId: course1.id, studentId: student2.id, status: EnrollmentStatus.ACCEPTED }
  });

  // 4. Assignments
  console.log('Creating assignments...');
  let assignment1 = await prisma.assignment.findFirst({
    where: { courseId: course1.id, title: 'Εργασία 1: Υλοποίηση Δομής Δεδομένων Binary Search Tree (BST)' }
  });

  if (!assignment1) {
    assignment1 = await prisma.assignment.create({
      data: {
        title: 'Εργασία 1: Υλοποίηση Δομής Δεδομένων Binary Search Tree (BST)',
        description: 'Υλοποιήστε μια πλήρη δομή BST με μεθόδους insert, search, delete και in-order traversal. Φροντίστε για clean code και σχόλια.',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
        courseId: course1.id,
      }
    });
  }

  // 5. Submission & Demo Extracted Files
  console.log('Creating demo student submission & code tree...');
  const subBaseDir = path.join(process.cwd(), 'uploads/submissions', assignment1.id, student1.id, 'v1');
  const subExtractedDir = path.join(subBaseDir, 'extracted');
  fs.mkdirSync(subExtractedDir, { recursive: true });

  // Create sample code files on disk for Monaco Editor
  const bstCode = `/**
 * Binary Search Tree Implementation
 * Student: Panagiotis Theodorou
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
`;

  const readmeCode = `# BST Project
Υλοποίηση Δυαδικού Δένδρου Αναζήτησης σε TypeScript.
Για εκτέλεση: \`npm test\`
`;

  fs.writeFileSync(path.join(subExtractedDir, 'BST.ts'), bstCode);
  fs.writeFileSync(path.join(subExtractedDir, 'README.md'), readmeCode);

  const fileTree = [
    { name: 'BST.ts', isDirectory: false, path: 'BST.ts' },
    { name: 'README.md', isDirectory: false, path: 'README.md' }
  ];

  let submission1 = await prisma.submission.findFirst({
    where: { assignmentId: assignment1.id, studentId: student1.id }
  });

  if (!submission1) {
    submission1 = await prisma.submission.create({
      data: {
        assignmentId: assignment1.id,
        studentId: student1.id,
        version: 1,
        fileTreeJson: JSON.stringify(fileTree),
        zipFilePath: `/uploads/submissions/${assignment1.id}/${student1.id}/v1/submission.zip`,
        status: SubmissionStatus.REVIEWED,
        grade: 95,
        feedback: 'Εξαιρετική υλοποίηση και καθαρή χρήση Generics σε TypeScript. Δες τις σημειώσεις inline.',
        hasSeenGrade: false,
      }
    });
  }

  // 6. Inline Comments
  console.log('Creating inline comments and thread replies...');
  let comment1 = await prisma.inlineComment.findFirst({
    where: { submissionId: submission1.id, filePath: 'BST.ts' }
  });

  if (!comment1) {
    comment1 = await prisma.inlineComment.create({
      data: {
        submissionId: submission1.id,
        version: 1,
        filePath: 'BST.ts',
        startLine: 26,
        endLine: 35,
        content: "Πολύ καλή η αναδρομική υλοποίηση της `insertNode`. Θα μπορούσες εναλλακτικά να την κάνεις iterative για αποφυγή call stack overflow σε μεγάλα δένδρα;",
        authorId: teacher1.id,
        isResolved: false,
      }
    });

    await prisma.threadMessage.create({
      data: {
        commentId: comment1.id,
        authorId: student1.id,
        content: 'Ευχαριστώ για το feedback! Σωστή παρατήρηση, στην επόμενη έκδοση θα προσθέσω και iterative εκδοχή.'
      }
    });
  }

  console.log('\nDatabase Seeding completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Credentials for Demo:');
  console.log('   Admin:    admin / admin123');
  console.log('   Teacher:  prof.papadopoulos / password123');
  console.log('   Student:  student.theodorou / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
