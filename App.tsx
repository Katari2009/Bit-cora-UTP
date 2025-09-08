import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Teacher, ComplianceRecord, ComplianceStatus } from './types';
import { INITIAL_TEACHERS, COURSES, SUBJECTS } from './constants';
import Dashboard from './components/Dashboard';
import AddTeacherModal from './components/AddTeacherModal';
import { AppLogoIcon } from './components/Logo';

const App: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const storedTeachers = localStorage.getItem('utp_teachers');
      return storedTeachers ? JSON.parse(storedTeachers) : INITIAL_TEACHERS;
    } catch (error) {
      console.error("Failed to parse teachers from localStorage", error);
      return INITIAL_TEACHERS;
    }
  });

  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>(() => {
    try {
      const storedRecords = localStorage.getItem('utp_compliance_records');
      return storedRecords ? JSON.parse(storedRecords) : [];
    } catch (error) {
      console.error("Failed to parse records from localStorage", error);
      return [];
    }
  });

  const [isAddTeacherModalOpen, setAddTeacherModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('utp_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('utp_compliance_records', JSON.stringify(complianceRecords));
  }, [complianceRecords]);

  const handleAddTeacher = useCallback((name: string) => {
    if (name.trim() === '') {
        alert("El nombre del docente no puede estar vacío.");
        return;
    }
    const newTeacher: Teacher = {
      id: new Date().toISOString(),
      name,
    };
    setTeachers(prev => [...prev, newTeacher]);
    setAddTeacherModalOpen(false);
  }, []);

  const handleDeleteTeacher = useCallback((teacherId: string) => {
    if(window.confirm("¿Estás seguro de que quieres eliminar a este docente y todos sus registros? Esta acción no se puede deshacer.")) {
        setTeachers(prev => prev.filter(t => t.id !== teacherId));
        setComplianceRecords(prev => prev.filter(r => r.teacherId !== teacherId));
    }
  }, []);

  const handleLogCompliance = useCallback((teacherId: string, course: string, subject: string, status: ComplianceStatus) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    const newRecord: ComplianceRecord = {
      id: new Date().toISOString() + Math.random(),
      teacherId,
      teacherName: teacher.name,
      date: new Date().toISOString(), // Store full ISO string with time
      course,
      subject,
      status,
    };

    setComplianceRecords(prev => [...prev, newRecord]);
    
  }, [teachers]);
  
  const generateTeacherCsvReport = useCallback((teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) {
        console.error("No se encontró al docente para generar el informe.");
        return;
    }

    const recordsToReport = complianceRecords.filter(r => r.teacherId === teacherId);

    if (recordsToReport.length === 0) {
        alert(`No hay registros para el docente ${teacher.name}.`);
        return;
    }

    const escapeCsvCell = (cellData: any): string => {
        let cell = String(cellData ?? '');
        cell = cell.replace(/"/g, '""');
        return `"${cell}"`;
    };

    const sortedRecords = [...recordsToReport].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const generationDate = new Date();
    const firstRecordDate = new Date(sortedRecords[0].date);
    const lastRecordDate = new Date(sortedRecords[sortedRecords.length - 1].date);
    
    const metadata = [
      ['Informe de Cumplimiento Individual'],
      ['Docente:', teacher.name],
      ['Generado el:', generationDate.toLocaleString('es-CL')],
      ['Período del Informe:', `${firstRecordDate.toLocaleDateString('es-CL')} - ${lastRecordDate.toLocaleDateString('es-CL')}`],
      ['Total de Registros:', sortedRecords.length],
      []
    ].map(row => row.join(',')).join('\n');

    const headers = ['ID de Registro', 'Fecha', 'Hora', 'Curso', 'Asignatura', 'Estado'];

    const dataRows = sortedRecords.map(r => {
        const recordDate = new Date(r.date);
        return [
            escapeCsvCell(r.id),
            escapeCsvCell(recordDate.toLocaleDateString('sv-SE')),
            escapeCsvCell(recordDate.toLocaleTimeString('es-CL')),
            escapeCsvCell(r.course),
            escapeCsvCell(r.subject),
            escapeCsvCell(r.status)
        ].join(',');
    });

    const csvContent = [
        metadata,
        headers.join(','),
        ...dataRows
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const reportDate = new Date().toISOString().split('T')[0];
      const safeTeacherName = teacher.name.replace(/\s/g, '_');
      link.setAttribute("href", url);
      link.setAttribute("download", `informe_${safeTeacherName}_${reportDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [complianceRecords, teachers]);


  const generateCsvReport = useCallback(() => {
    if (complianceRecords.length === 0) {
      return; // The button is disabled, so this is a safeguard.
    }

    const escapeCsvCell = (cellData: any): string => {
        let cell = String(cellData ?? '');
        cell = cell.replace(/"/g, '""'); // Escape double quotes
        return `"${cell}"`;
    };

    const sortedRecords = [...complianceRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const generationDate = new Date();
    const firstRecordDate = new Date(sortedRecords[0].date);
    const lastRecordDate = new Date(sortedRecords[sortedRecords.length - 1].date);
    
    const metadata = [
      ['Informe General de Cumplimiento'],
      ['Generado el:', generationDate.toLocaleString('es-CL')],
      ['Período del Informe:', `${firstRecordDate.toLocaleDateString('es-CL')} - ${lastRecordDate.toLocaleDateString('es-CL')}`],
      ['Total de Registros:', sortedRecords.length],
      [] // Blank line for separation
    ].map(row => row.join(',')).join('\n');

    const headers = ['ID de Registro', 'Docente', 'Fecha', 'Hora', 'Curso', 'Asignatura', 'Estado'];

    const dataRows = sortedRecords.map(r => {
        const recordDate = new Date(r.date);
        return [
            escapeCsvCell(r.id),
            escapeCsvCell(r.teacherName),
            escapeCsvCell(recordDate.toLocaleDateString('sv-SE')), // YYYY-MM-DD format
            escapeCsvCell(recordDate.toLocaleTimeString('es-CL')), // HH:MM:SS format
            escapeCsvCell(r.course),
            escapeCsvCell(r.subject),
            escapeCsvCell(r.status)
        ].join(',');
    });

    const csvContent = [
        metadata,
        headers.join(','),
        ...dataRows
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const reportDate = new Date().toISOString().split('T')[0];
      link.setAttribute("href", url);
      link.setAttribute("download", `informe_general_cumplimiento_${reportDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [complianceRecords]);


  const todayString = new Date().toISOString().split('T')[0];
  const dailyComplianceLog = useMemo(() => {
    const log = new Set<string>();
    complianceRecords
      .filter(r => r.date.startsWith(todayString)) // Check if record date starts with today's date string
      .forEach(r => {
          log.add(`${r.teacherId}-${r.course}-${r.subject}`);
      });
    return log;
  }, [complianceRecords, todayString]);

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <div className="flex flex-col items-center justify-center gap-4">
            <AppLogoIcon className="w-16 h-16" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400">
              Bitácora UTP
            </h1>
        </div>
        <p className="text-slate-400 mt-4 text-lg">
          Seguimiento y Gestión de Libros de Clases.
        </p>
      </header>

      <main>
        <Dashboard
          teachers={teachers}
          records={complianceRecords}
          courses={COURSES}
          subjects={SUBJECTS}
          dailyLog={dailyComplianceLog}
          onAddTeacher={() => setAddTeacherModalOpen(true)}
          onDeleteTeacher={handleDeleteTeacher}
          onLogCompliance={handleLogCompliance}
          onGenerateTeacherCsv={generateTeacherCsvReport}
          onGenerateCsv={generateCsvReport}
        />
      </main>

      {isAddTeacherModalOpen && (
        <AddTeacherModal
          onClose={() => setAddTeacherModalOpen(false)}
          onAdd={handleAddTeacher}
        />
      )}
    </div>
  );
};

export default App;