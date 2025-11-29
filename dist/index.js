"use strict";
// =======================================
// 1. БАЗОВІ UNION ТИПИ
// =======================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedule = exports.courses = exports.classrooms = exports.professors = void 0;
exports.addProfessor = addProfessor;
exports.addLesson = addLesson;
exports.findAvailableClassrooms = findAvailableClassrooms;
exports.getProfessorSchedule = getProfessorSchedule;
exports.validateLesson = validateLesson;
exports.getClassroomUtilization = getClassroomUtilization;
exports.getMostPopularCourseType = getMostPopularCourseType;
exports.reassignClassroom = reassignClassroom;
exports.cancelLesson = cancelLesson;
// =======================================
// 3. МАСИВИ ДАНИХ
// =======================================
exports.professors = [];
exports.classrooms = [];
exports.courses = [];
exports.schedule = [];
// =======================================
// 4. CRUD ФУНКЦІЇ
// =======================================
// Додати професора
function addProfessor(professor) {
    exports.professors.push(professor);
}
// Додати заняття без конфліктів
function addLesson(lesson) {
    const conflict = validateLesson(lesson);
    if (conflict !== null) {
        console.warn("CONFLICT:", conflict);
        return false;
    }
    exports.schedule.push(lesson);
    return true;
}
// =======================================
// 5. Пошук/фільтрація
// =======================================
// Знайти вільні аудиторії
function findAvailableClassrooms(timeSlot, dayOfWeek) {
    const busy = exports.schedule
        .filter(l => l.dayOfWeek === dayOfWeek && l.timeSlot === timeSlot)
        .map(l => l.classroomNumber);
    return exports.classrooms
        .filter(c => !busy.includes(c.number))
        .map(c => c.number);
}
// Розклад професора
function getProfessorSchedule(professorId) {
    return exports.schedule.filter(l => l.professorId === professorId);
}
// Перевірити, чи немає конфліктів
function validateLesson(lesson) {
    // Конфлікт викладача
    const profConflict = exports.schedule.find(l => l.professorId === lesson.professorId &&
        l.dayOfWeek === lesson.dayOfWeek &&
        l.timeSlot === lesson.timeSlot);
    if (profConflict) {
        return {
            type: "ProfessorConflict",
            lessonDetails: profConflict
        };
    }
    // Конфлікт аудиторії
    const roomConflict = exports.schedule.find(l => l.classroomNumber === lesson.classroomNumber &&
        l.dayOfWeek === lesson.dayOfWeek &&
        l.timeSlot === lesson.timeSlot);
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
function getClassroomUtilization(classroomNumber) {
    const totalSlots = 5 * 5; // 5 днів × 5 слотів = 25 можливих занять
    const used = exports.schedule.filter(l => l.classroomNumber === classroomNumber).length;
    return (used / totalSlots) * 100;
}
// Найпопулярніший тип занять
function getMostPopularCourseType() {
    const count = {
        Lecture: 0,
        Seminar: 0,
        Lab: 0,
        Practice: 0
    };
    exports.schedule.forEach(lesson => {
        const course = exports.courses.find(c => c.id === lesson.courseId);
        if (course)
            count[course.type] += 1;
    });
    return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
}
// =======================================
// 8. Модифікація розкладу
// =======================================
// Переназначити аудиторію
function reassignClassroom(lessonId, newClassroomNumber) {
    const lesson = exports.schedule.find(l => l.id === lessonId);
    if (!lesson)
        return false;
    const testLesson = Object.assign(Object.assign({}, lesson), { classroomNumber: newClassroomNumber });
    const conflict = validateLesson(testLesson);
    if (conflict !== null)
        return false;
    lesson.classroomNumber = newClassroomNumber;
    return true;
}
// Скасувати заняття
function cancelLesson(lessonId) {
    const index = exports.schedule.findIndex(l => l.id === lessonId);
    if (index !== -1) {
        exports.schedule.splice(index, 1);
    }
}
