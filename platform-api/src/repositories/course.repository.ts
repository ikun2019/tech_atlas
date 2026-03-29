import { prisma } from '../lib/prisma.js';
import type { Course, Chapter, Lesson } from '@prisma/client';

export interface CourseListItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string };
  instructor: { id: string; name: string; avatarUrl: string | null };
  _count: { lessons: number };
}

export interface CourseDetail extends Course {
  instructor: { id: string; name: string; avatarUrl: string | null };
  category: { id: string; name: string; slug: string };
  chapters: Array<
    Chapter & {
      lessons: Lesson[];
    }
  >;
}

export interface ChapterWithLessons extends Chapter {
  lessons: Lesson[];
}

export interface LessonWithCourseInstructor extends Lesson {
  chapter: {
    id: string;
    courseId: string;
    course: {
      id: string;
      instructorId: string;
      instructor: {
        id: string;
        instructorToken: { encryptedToken: string; workspaceName: string } | null;
      };
    };
  };
}

export async function findAllCategories(): Promise<
  { id: string; name: string; slug: string }[]
> {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function findMany(query: {
  page: number;
  limit: number;
  categoryId?: string;
  search?: string;
}): Promise<{ items: CourseListItem[]; total: number }> {
  const { page, limit, categoryId, search } = query;
  const skip = (page - 1) * limit;

  const where = {
    isPublished: true,
    ...(categoryId ? { categoryId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        _count: {
          select: {
            chapters: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.course.count({ where }),
  ]);

  // Map _count.chapters to _count.lessons approximation
  // We query lesson count separately for accuracy
  const itemsWithLessonCount = await Promise.all(
    items.map(async (course) => {
      const lessonCount = await prisma.lesson.count({
        where: {
          chapter: { courseId: course.id },
        },
      });
      return {
        ...course,
        _count: { lessons: lessonCount },
      };
    }),
  );

  return { items: itemsWithLessonCount as CourseListItem[], total };
}

export async function findById(courseId: string): Promise<CourseDetail | null> {
  const course = await prisma.course.findFirst({
    where: { id: courseId, isPublished: true },
    include: {
      instructor: { select: { id: true, name: true, avatarUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
  return course as CourseDetail | null;
}

export async function findChapters(courseId: string): Promise<ChapterWithLessons[]> {
  const chapters = await prisma.chapter.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
    include: {
      lessons: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
      },
    },
  });
  return chapters as ChapterWithLessons[];
}

export async function findLessonById(lessonId: string): Promise<LessonWithCourseInstructor | null> {
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId },
    include: {
      chapter: {
        select: {
          id: true,
          courseId: true,
          course: {
            select: {
              id: true,
              instructorId: true,
              instructor: {
                select: {
                  id: true,
                  instructorToken: {
                    select: { encryptedToken: true, workspaceName: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  return lesson as LessonWithCourseInstructor | null;
}
