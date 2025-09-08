import React, { useState, useMemo } from 'react';
import { Teacher, ComplianceStatus } from '../types';
import { TrashIcon, DocumentArrowDownIcon, CheckIcon, XMarkIcon } from './Icons';

interface TeacherCardProps {
  teacher: Teacher;
  courses: string[];
  subjects: string[];
  complianceLogByDay: Set<string>;
  onDelete: (teacherId: string) => void;
  onLog: (teacherId: string, course: string, subject: string, status: ComplianceStatus, dateTime: string) => void;
  onGenerateCsv: (teacherId: string) => void;
}

/**
 * Generates a string for the current local date and time in the format
 * required by the 'datetime-local' input type ('YYYY-MM-DDTHH:mm').
 */
const getLocalISOStringForInput = () => {
  const now = new Date();
  // Adjust date to account for the timezone offset, so toISOString() returns local time components
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};


const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, courses, subjects, complianceLogByDay, onDelete, onLog, onGenerateCsv }) => {
  const [selectedCourse, setSelectedCourse] = useState(courses[0] || '');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || '');
  const [selectedDateTime, setSelectedDateTime] = useState(getLocalISOStringForInput());

  const hasLoggedForSelectedCombination = useMemo(() => {
    if (!selectedDateTime) {
      return false;
    }
    const selectedDate = new Date(selectedDateTime);
    // Format the selected date to 'YYYY-MM-DD' to match the key in complianceLogByDay
    const dateKey = selectedDate.toLocaleDateString('sv-SE');
    const logKey = `${dateKey}-${teacher.id}-${selectedCourse}-${selectedSubject}`;
    return complianceLogByDay.has(logKey);
  }, [complianceLogByDay, teacher.id, selectedCourse, selectedSubject, selectedDateTime]);


  const handleLog = (status: ComplianceStatus) => {
    if (!selectedCourse || !selectedSubject) {
      alert("Por favor, seleccione un curso y una asignatura.");
      return;
    }
    if (!selectedDateTime) {
      alert("Por favor, seleccione una fecha y hora.");
      return;
    }
    onLog(teacher.id, selectedCourse, selectedSubject, status, selectedDateTime);
  };

  return (
    <div
      className={`
        bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-lg 
        p-6 flex flex-col justify-between transition-all duration-300 hover:border-sky-500 hover:shadow-sky-500/10
        ${hasLoggedForSelectedCombination ? 'ring-2 ring-green-500' : ''}
      `}
    >
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-slate-100 mb-4">{teacher.name}</h3>
          <button
            onClick={() => onDelete(teacher.id)}
            className="text-slate-400 hover:text-red-500 transition-colors"
            aria-label="Eliminar docente"
          >
            <TrashIcon />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          {/* DateTime Selector */}
          <div>
            <label htmlFor={`datetime-${teacher.id}`} className="block text-sm font-medium text-slate-400 mb-1">
              Fecha y Hora
            </label>
            <input
              type="datetime-local"
              id={`datetime-${teacher.id}`}
              value={selectedDateTime}
              onChange={(e) => setSelectedDateTime(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          {/* Course Selector */}
          <div>
            <label htmlFor={`course-${teacher.id}`} className="block text-sm font-medium text-slate-400 mb-1">
              Curso
            </label>
            <select
              id={`course-${teacher.id}`}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              {courses.map(course => <option key={course} value={course}>{course}</option>)}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label htmlFor={`subject-${teacher.id}`} className="block text-sm font-medium text-slate-400 mb-1">
              Asignatura
            </label>
            <select
              id={`subject-${teacher.id}`}
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {hasLoggedForSelectedCombination && (
          <div className="text-center text-sm text-green-400 bg-green-900/50 rounded-md py-1">
            Registro ya completado
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleLog(ComplianceStatus.COMPLIED)}
            disabled={hasLoggedForSelectedCombination}
            className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon />
            Cumple
          </button>
          <button
            onClick={() => handleLog(ComplianceStatus.NOT_COMPLIED)}
            disabled={hasLoggedForSelectedCombination}
            className="flex items-center justify-center gap-2 w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XMarkIcon />
            No Cumple
          </button>
        </div>
        <button
            onClick={() => onGenerateCsv(teacher.id)}
            className="flex items-center justify-center gap-2 w-full bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-sky-500"
        >
          <DocumentArrowDownIcon />
          Generar Informe
        </button>
      </div>
    </div>
  );
};

export default TeacherCard;