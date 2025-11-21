import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Module from '../models/Module.js';

dotenv.config({ path: './server/.env' });

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log('✅ Connected for seeding...');

  // 🟡 Check if courses already exist
  const existingCourses = await Course.countDocuments();
  if (existingCourses > 0) {
    console.log(`⚠️ ${existingCourses} courses already exist — skipping seeding.`);
    process.exit(0);
  }

  const courseList = [
    // Year 1 First Semester
    { code: 'Y1S1-01', title: 'Sociology in Nursing', year: 1, semester: 1 },
    { code: 'Y1S1-02', title: 'Psychology in Nursing', year: 1, semester: 1 },
    { code: 'Y1S1-03', title: 'Professional Practice', year: 1, semester: 1 },
    { code: 'Y1S1-04', title: 'Nutrition', year: 1, semester: 1 },
    { code: 'Y1S1-05', title: 'Microbiology', year: 1, semester: 1 },
    { code: 'Y1S1-06', title: 'Health Communication', year: 1, semester: 1 },
    { code: 'Y1S1-07', title: 'Fundamentals of Nursing I', year: 1, semester: 1 },
    { code: 'Y1S1-08', title: 'Anatomy and Physiology I', year: 1, semester: 1 },
    { code: 'Y1S1-09', title: 'Public Health Nursing I', year: 1, semester: 1 },

    // Year 1 Second Semester
    { code: 'Y1S2-01', title: 'Fundamentals of Nursing II', year: 1, semester: 2 },
    { code: 'Y1S2-02', title: 'Anatomy and Physiology II', year: 1, semester: 2 },
    { code: 'Y1S2-03', title: 'Public Health Nursing II', year: 1, semester: 2 },
    { code: 'Y1S2-04', title: 'Medical - Surgical Nursing I', year: 1, semester: 2 },
    { code: 'Y1S2-05', title: 'Pharmacology I', year: 1, semester: 2 },

    // Year 2 First Semester
    { code: 'Y2S1-01', title: 'Medical – Surgical Nursing II', year: 2, semester: 1 },
    { code: 'Y2S1-02', title: 'Integrated Reproductive Health I', year: 2, semester: 1 },
    { code: 'Y2S1-03', title: 'Pharmacology II', year: 2, semester: 1 },
    { code: 'Y2S1-04', title: 'Psychiatry and Mental Health Nursing I', year: 2, semester: 1 },
    { code: 'Y2S1-05', title: 'Paediatric and Child Health Nursing I', year: 2, semester: 1 },
    { code: 'Y2S1-06', title: 'Introduction to Research Nursing', year: 2, semester: 1 },

    // Year 2 Second Semester
    { code: 'Y2S2-01', title: 'Medical – Surgical Nursing III', year: 2, semester: 2 },
    { code: 'Y2S2-02', title: 'Integrated Reproductive Health II', year: 2, semester: 2 },
    { code: 'Y2S2-03', title: 'Psychiatry and Mental Health Nursing II', year: 2, semester: 2 },
    { code: 'Y2S2-04', title: 'Paediatric and Child Health Nursing II', year: 2, semester: 2 },
    { code: 'Y2S2-05', title: 'Leadership, Management and Governance I', year: 2, semester: 2 },

    // Year 3 First Semester
    { code: 'Y3S1-01', title: 'Medical-Surgical Nursing IV', year: 3, semester: 1 },
    { code: 'Y3S1-02', title: 'Integrated Reproductive Health III', year: 3, semester: 1 },
    { code: 'Y3S1-03', title: 'Psychiatry and Mental Health Nursing III', year: 3, semester: 1 },
    { code: 'Y3S1-04', title: 'Paediatric and Child Health Nursing', year: 3, semester: 1 },
    { code: 'Y3S1-05', title: 'Leadership, Management and Governance II', year: 3, semester: 1 },

    // Year 3 Second Semester
    { code: 'Y3S2-01', title: 'Medical – Surgical Nursing V', year: 3, semester: 2 },
    { code: 'Y3S2-02', title: 'Integrated Reproductive Health IV', year: 3, semester: 2 },
    { code: 'Y3S2-03', title: 'Psychiatry and Mental Health Nursing IV', year: 3, semester: 2 },
    { code: 'Y3S2-04', title: 'Paediatric and Child Health Nursing IV', year: 3, semester: 2 },
    { code: 'Y3S2-05', title: 'Leadership, Management and Governance III', year: 3, semester: 2 }
  ];

  // create one placeholder module per course
  for (const c of courseList) {
    const course = await Course.create(c);
    await Module.create({
      course: course._id,
      title: `${c.title} — Introduction`,
      content: `Placeholder introduction for ${c.title}.`
    });
  }

  console.log('✅ Seeding complete (added new courses).');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
