import React, { useMemo, useRef } from 'react';
import { Teacher, ComplianceRecord, ComplianceStatus } from '../types';
import TeacherCard from './TeacherCard';
import StatsCard from './StatsCard';
import ComplianceHistory from './ComplianceHistory';
import ComplianceTrendChart from './ComplianceTrendChart';
import CourseDistributionChart from './CourseDistributionChart';
import { UserPlusIcon, DocumentArrowDownIcon, ArrowUpTrayIcon, TableCellsIcon } from './Icons';

interface DashboardProps {
  teachers: Teacher[];
  records: ComplianceRecord[];
  courses: string[];
  subjects: string[];
  complianceLogByDay: Set<string>;
  onAddTeacher: () => void;
  onDeleteTeacher: (teacherId: string) => void;
  onLogCompliance: (teacherId: string, course: string, subject: string, status: ComplianceStatus, dateTime: string) => void;
  onGenerateTeacherCsv: (teacherId: string) => void;
  onExportJson: () => void;
  onExportXlsx: () => void;
  onImportJson: (fileContent: string) => void;
}

// Helper to get ISO week number for a date
const getWeekNumber = (d: Date): number => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
};


const Dashboard: React.FC<DashboardProps> = ({
  teachers,
  records,
  courses,
  subjects,
  complianceLogByDay,
  onAddTeacher,
  onDeleteTeacher,
  onLogCompliance,
  onGenerateTeacherCsv,
  onExportJson,
  onExportXlsx,
  onImportJson
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const chartData = useMemo(() => {
    // Trend Data (by week)
    const weeklyData: { [week: number]: { complied: number; total: number } } = {};
    records.forEach(record => {
        const week = getWeekNumber(new Date(record.date));
        if (!weeklyData[week]) {
            weeklyData[week] = { complied: 0, total: 0 };
        }
        weeklyData[week].total++;
        if (record.status === ComplianceStatus.COMPLIED) {
            weeklyData[week].complied++;
        }
    });

    const sortedWeeks = Object.keys(weeklyData).map(Number).sort((a, b) => a - b);
    const trendLabels = sortedWeeks.map(week => `Semana ${week}`);
    const trendValues = sortedWeeks.map(week => {
        const { complied, total } = weeklyData[week];
        return total > 0 ? Math.round((complied / total) * 100) : 0;
    });

    // Distribution Data (by course)
    const courseData: { [course: string]: { complied: number; total: number } } = {};
    courses.forEach(course => {
      courseData[course] = { complied: 0, total: 0 };
    });

    records.forEach(record => {
      if (courseData[record.course]) {
        courseData[record.course].total++;
        if (record.status === ComplianceStatus.COMPLIED) {
          courseData[record.course].complied++;
        }
      }
    });
    
    const distributionLabels = Object.keys(courseData);
    const distributionValues = distributionLabels.map(course => {
      const { complied, total } = courseData[course];
      return total > 0 ? Math.round((complied / total) * 100) : 0;
    });

    return {
      trend: { labels: trendLabels, data: trendValues },
      distribution: { labels: distributionLabels, data: distributionValues }
    };
  }, [records, courses]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        onImportJson(text);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      console.error("Failed to read file");
      alert("No se pudo leer el archivo de respaldo.");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceTrendChart data={chartData.trend.data} labels={chartData.trend.labels} />
        <CourseDistributionChart data={chartData.distribution.data} labels={chartData.distribution.labels} />
      </section>

      {/* Stats and Actions Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Cumplimiento General" value={`${stats.complianceRate}%`} />
        <StatsCard title="Registros Cumplidos" value={stats.compliedCount.toString()} />
        <StatsCard title="Registros No Cumplidos" value={stats.notCompliedCount.toString()} />
        <StatsCard title="Total Docentes" value={teachers.length.toString()} />
      </section>

      <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-slate-200">Panel de Docentes</h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" aria-hidden="true" />
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 bg-sky-500/20 border border-sky-500/30 hover:bg-sky-500/30 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            title="Importar un respaldo desde un archivo .json. Esto reemplazará todos los datos actuales."
          >
            <ArrowUpTrayIcon />
            Importar Respaldo
          </button>
          <button
            onClick={onAddTeacher}
            className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            <UserPlusIcon />
            Añadir Docente
          </button>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onExportJson}
              disabled={teachers.length === 0 && records.length === 0}
              className="flex items-center justify-center gap-2 bg-sky-500/20 border border-sky-500/30 hover:bg-sky-500/30 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-slate-500/20 disabled:border-slate-500/30 disabled:cursor-not-allowed"
              title={records.length === 0 ? "No hay datos para exportar" : "Exportar un respaldo completo a un archivo .json"}
            >
              <DocumentArrowDownIcon />
              Exportar Respaldo
            </button>
            <button
              onClick={onExportXlsx}
              disabled={teachers.length === 0 && records.length === 0}
              className="flex items-center justify-center gap-2 bg-teal-500/20 border border-teal-500/30 hover:bg-teal-500/30 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-slate-500/20 disabled:border-slate-500/30 disabled:cursor-not-allowed"
              title={records.length === 0 ? "No hay datos para exportar" : "Exportar informe completo a XLSX"}
            >
              <TableCellsIcon />
              Informe (XLSX)
            </button>
          </div>
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
                complianceLogByDay={complianceLogByDay}
                onDelete={onDeleteTeacher}
                onLog={onLogCompliance}
                onGenerateCsv={onGenerateTeacherCsv}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
            <p className="text-slate-400 text-xl">No hay docentes registrados.</p>
            <p className="text-slate-500 mt-2">Haga clic en "Añadir Docente" o "Importar Respaldo" para comenzar.</p>
          </div>
        )}
      </section>

      {/* History Section */}
      <ComplianceHistory records={records} />

    </div>
  );
};

export default Dashboard;