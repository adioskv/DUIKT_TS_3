// =======================================
// 1. БАЗОВІ UNION ТИПИ
// =======================================

export type DayOfWeek =
  "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export type TimeSlot =
  "8:30-10:00" |
  "10:15-11:45" |
  "12:15-13:45" |
  "14:00-15:30" |
  "15:45-17:15";

export type CourseType =
  "Lecture" | "Seminar" | "Lab" | "Practice";


// =======================================
// 2. STRUCTURE TYPE ALIASES
// =======================================

export type Professor = {
  id: number;
  name: string;
  department: string;
};

export type Classroom = {
  number: string;
  capacity: number;
  hasProjector: boolean;
};

export type Course = {
  id: number;
  name: string;
  type: CourseType;
};

export type Lesson = {
  id: number;
  courseId: number;
  professorId: number;
  classroomNumber: string;
  dayOfWeek: DayOfWeek;
  timeSlot: TimeSlot;
};


// =======================================
// 3. МАСИВИ ДАНИХ
// =======================================

export const professors: Professor[] = [];
export const classrooms: Classroom[] = [];
export const courses: Course[] = [];
export const schedule: Lesson[] = [];


// =======================================
// 4. CRUD ФУНКЦІЇ
// =======================================

// Додати професора
export function addProfessor(professor: Professor): void {
  professors.push(professor);
}

// Додати заняття без конфліктів
export function addLesson(lesson: Lesson): boolean {
  const conflict = validateLesson(lesson);

  if (conflict !== null) {
    console.warn("CONFLICT:", conflict);
    return false;
  }

  schedule.push(lesson);
  return true;
}


// =======================================
// 5. Пошук/фільтрація
// =======================================

// Знайти вільні аудиторії
export function findAvailableClassrooms(
  timeSlot: TimeSlot,
  dayOfWeek: DayOfWeek
): string[] {
  const busy = schedule
    .filter(l => l.dayOfWeek === dayOfWeek && l.timeSlot === timeSlot)
    .map(l => l.classroomNumber);

  return classrooms
    .filter(c => !busy.includes(c.number))
    .map(c => c.number);
}

// Розклад професора
export function getProfessorSchedule(professorId: number): Lesson[] {
  return schedule.filter(l => l.professorId === professorId);
}


// =======================================
// 6. Валідація та конфлікти
// =======================================

export type ScheduleConflict = {
  type: "ProfessorConflict" | "ClassroomConflict";
  lessonDetails: Lesson;
};

// Перевірити, чи немає конфліктів
export function validateLesson(lesson: Lesson): ScheduleConflict | null {
  // Конфлікт викладача
  const profConflict = schedule.find(l =>
    l.professorId === lesson.professorId &&
    l.dayOfWeek === lesson.dayOfWeek &&
    l.timeSlot === lesson.timeSlot
  );

  if (profConflict) {
    return {
      type: "ProfessorConflict",
      lessonDetails: profConflict
    };
  }

  // Конфлікт аудиторії
  const roomConflict = schedule.find(l =>
    l.classroomNumber === lesson.classroomNumber &&
    l.dayOfWeek === lesson.dayOfWeek &&
    l.timeSlot === lesson.timeSlot
  );

  if (roomConflict) {
    return {
      type: "ClassroomConflict",
      lessonDetails: roomConflict
    };
  }

  return null;
}


// =======================================
// 7. Аналітика
// =======================================

// Відсоток використання аудиторії
export function getClassroomUtilization(classroomNumber: string): number {
  const totalSlots = 5 * 5; // 5 днів × 5 слотів = 25 можливих занять
  const used = schedule.filter(l => l.classroomNumber === classroomNumber).length;

  return (used / totalSlots) * 100;
}

// Найпопулярніший тип занять
export function getMostPopularCourseType(): CourseType {
  const count: Record<CourseType, number> = {
    Lecture: 0,
    Seminar: 0,
    Lab: 0,
    Practice: 0
  };

  schedule.forEach(lesson => {
    const course = courses.find(c => c.id === lesson.courseId);
    if (course) count[course.type] += 1;
  });

  return (Object.entries(count).sort((a, b) => b[1] - a[1])[0][0] as CourseType);
}


// =======================================
// 8. Модифікація розкладу
// =======================================

// Переназначити аудиторію
export function reassignClassroom(lessonId: number, newClassroomNumber: string): boolean {
  const lesson = schedule.find(l => l.id === lessonId);
  if (!lesson) return false;

  const testLesson: Lesson = {
    ...lesson,
    classroomNumber: newClassroomNumber
  };

  const conflict = validateLesson(testLesson);

  if (conflict !== null) return false;

  lesson.classroomNumber = newClassroomNumber;
  return true;
}

// Скасувати заняття
export function cancelLesson(lessonId: number): void {
  const index = schedule.findIndex(l => l.id === lessonId);
  if (index !== -1) {
    schedule.splice(index, 1);
  }
}
