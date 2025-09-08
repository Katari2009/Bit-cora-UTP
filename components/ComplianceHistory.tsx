import React from 'react';
import { ComplianceRecord, ComplianceStatus } from '../types';

interface ComplianceHistoryProps {
  records: ComplianceRecord[];
}

const ComplianceHistory: React.FC<ComplianceHistoryProps> = ({ records }) => {
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="bg-slate-900/30 backdrop-blur-lg border border-slate-700 rounded-xl p-4 sm:p-6">
      <h2 className="text-2xl font-semibold text-slate-200 mb-4">Historial de Registros</h2>
      {sortedRecords.length > 0 ? (
        <div className="overflow-x-auto relative rounded-lg border border-slate-700">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
              <tr>
                <th scope="col" className="px-6 py-3">Docente</th>
                <th scope="col" className="px-6 py-3">Fecha y Hora</th>
                <th scope="col" className="px-6 py-3">Curso</th>
                <th scope="col" className="px-6 py-3">Asignatura</th>
                <th scope="col" className="px-6 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map(record => (
                <tr key={record.id} className="bg-slate-900/20 border-b border-slate-700 hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{record.teacherName}</td>
                  <td className="px-6 py-4">{new Date(record.date).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="px-6 py-4">{record.course}</td>
                  <td className="px-6 py-4">{record.subject}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      record.status === ComplianceStatus.COMPLIED
                        ? 'bg-green-500/10 text-green-300 ring-1 ring-inset ring-green-500/20'
                        : 'bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/20'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400">No hay registros históricos para mostrar.</p>
        </div>
      )}
    </section>
  );
};

export default ComplianceHistory;
