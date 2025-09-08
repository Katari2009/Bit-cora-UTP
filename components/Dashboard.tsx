import React, { useMemo } from 'react';
import { Teacher, ComplianceRecord, ComplianceStatus } from '../types';
import TeacherCard from './TeacherCard';
import StatsCard from './StatsCard';
import ComplianceHistory from './ComplianceHistory';
import { UserPlusIcon, DocumentArrowDownIcon } from './Icons';

interface DashboardProps {
  teachers: Teacher[];
  records: ComplianceRecord[];
  courses: string[];
  subjects: string[];
  dailyLog: Set<string>;
  onAddTeacher: () => void;
  onDeleteTeacher: (teacherId: string) => void;
  onLogCompliance: (teacherId: string, course: string, subject: string, status: ComplianceStatus) => void;
  onGenerateTeacherCsv: (teacherId: string) => void; 
  onGenerateCsv: () => void; 
}

const Dashboard: React.FC<DashboardProps> = ({
  teachers,
  records,
  courses,
  subjects,
  dailyLog,
  onAddTeacher,
  onDeleteTeacher,
  onLogCompliance,
  onGenerateTeacherCsv,
  onGenerateCsv,
}) => {
  const stats = useMemo(() => {
    const totalRecords = records.length;
    if (totalRecords === 0) {
      return { complianceRate: 0, compliedCount: 0, notCompliedCount: 0 };
    }
    const compliedCount = records.filter(r => r.status === ComplianceStatus.COMPLIED).length;
    const complianceRate = Math.round((compliedCount / totalRecords) * 100);
    const notCompliedCount = totalRecords - compliedCount;
    return { complianceRate, compliedCount, notCompliedCount };
  }, [records]);

  return (
    <div className="space-y-8">
      {/* Stats and Actions Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Cumplimiento General" value={`${stats.complianceRate}%`} />
        <StatsCard title="Registros Cumplidos" value={stats.compliedCount.toString()} />
        <StatsCard title="Registros No Cumplidos" value={stats.notCompliedCount.toString()} />
        <StatsCard title="Total Docentes" value={teachers.length.toString()} />
      </section>

      <section className="bg-slate-900/30 backdrop-blur-lg border border-slate-700 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-slate-200">Panel de Docentes</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={onAddTeacher}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            <UserPlusIcon />
            Añadir Docente
          </button>
          <button
            onClick={onGenerateCsv}
            disabled={records.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:opacity-70"
            title={records.length === 0 ? "No hay registros para exportar" : "Exportar todos los registros a CSV"}
          >
            <DocumentArrowDownIcon />
            Exportar Informe (CSV)
          </button>
        </div>
      </section>
      
      {/* Teacher Cards Grid */}
      <section>
        {teachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {teachers.map(teacher => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                courses={courses}
                subjects={subjects}
                dailyLog={dailyLog}
                onDelete={onDeleteTeacher}
                onLog={onLogCompliance}
                onGenerateCsv={onGenerateTeacherCsv}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/30 backdrop-blur-lg border border-slate-700 rounded-xl">
            <p className="text-slate-400 text-xl">No hay docentes registrados.</p>
            <p className="text-slate-500 mt-2">Haga clic en "Añadir Docente" para comenzar.</p>
          </div>
        )}
      </section>

      {/* History Section */}
      <ComplianceHistory records={records} />

    </div>
  );
};

export default Dashboard;