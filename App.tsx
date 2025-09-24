import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Teacher, ComplianceRecord, ComplianceStatus } from './types';
import { INITIAL_TEACHERS, COURSES, SUBJECTS } from './constants';
import {
  getAuth,
  getFirestore,
  isFirebaseConfigured,
  getGoogleAuthProvider,
  firebase
} from './firebaseConfig';
import Dashboard from './components/Dashboard';
import AddTeacherModal from './components/AddTeacherModal';
import Login from './components/Login';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import FirebaseNotConfigured from './components/FirebaseNotConfigured';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const auth = useMemo(() => getAuth(), []);
  const db = useMemo(() => getFirestore(), []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([]);
  const [isAddTeacherModalOpen, setAddTeacherModalOpen] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        // Using 'session' persistence. The user will be signed out when the browser is closed.
        await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

        // Set up the state change listener to handle user sign-in/sign-out
        unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
          if (firebaseUser) {
            const userData: User = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              email: firebaseUser.email,
            };
            setUser(userData);
            setAuthError(null);
          } else {
            setUser(null);
            setTeachers([]);
            setComplianceRecords([]);
            setLoading(false);
          }
        });
      } catch (error: any) {
        console.error("Authentication setup failed:", error);
        setAuthError("No se pudo inicializar la sesión de autenticación.");
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [auth]);

  const seedInitialData = useCallback(async (uid: string) => {
      if (!db) return;
      const teachersRef = db.collection('users').doc(uid).collection('teachers');
      const batch = db.batch();
      INITIAL_TEACHERS.forEach(teacher => {
          const docRef = teachersRef.doc();
          batch.set(docRef, { name: teacher.name });
      });
      await batch.commit();
  }, [db]);

  useEffect(() => {
    if (!user || !db) return;

    setLoading(true);
    const teachersRef = db.collection('users').doc(user.uid).collection('teachers');
    
    teachersRef.limit(1).get().then(snapshot => {
        if (snapshot.empty) {
            seedInitialData(user.uid);
        }
    });

    const unsubscribeTeachers = teachersRef.onSnapshot(snapshot => {
      const teachersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Teacher[];
      setTeachers(teachersData);
      setLoading(false);
    }, () => setLoading(false));

    const unsubscribeRecords = db.collection('users').doc(user.uid).collection('records').onSnapshot(snapshot => {
      const recordsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ComplianceRecord[];
      setComplianceRecords(recordsData);
    });

    return () => {
      unsubscribeTeachers();
      unsubscribeRecords();
    };
  }, [user, db, seedInitialData]);

  const handleSignIn = async (): Promise<void> => {
    if (!auth) {
      throw new Error("Firebase auth not initialized");
    }
    setAuthError(null);
    const provider = getGoogleAuthProvider();
    if (!provider) {
      const errorMsg = "No se pudo crear el proveedor de autenticación de Google.";
      console.error(errorMsg);
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
    try {
      // Use signInWithPopup as it is more compatible with different environments
      await auth.signInWithPopup(provider);
    } catch (error: any) {
      console.error("Error initiating sign-in:", error);
      // Don't show an error message if the user simply closes the popup.
      if (error.code === 'auth/popup-closed-by-user') {
          throw error; // still throw so UI can reset
      }
      setAuthError(`No se pudo iniciar el proceso de autenticación. Error: ${error.message}`);
      throw error;
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  const handleAddTeacher = useCallback(async (name: string) => {
    if (name.trim() === '' || !user || !db) return;
    try {
      await db.collection('users').doc(user.uid).collection('teachers').add({ name });
      setAddTeacherModalOpen(false);
    } catch (error) {
      console.error("Error adding teacher:", error);
    }
  }, [user, db]);

  const handleDeleteTeacher = useCallback(async (teacherId: string) => {
    if (!user || !db || !window.confirm("¿Estás seguro de que quieres eliminar a este docente y todos sus registros? Esta acción no se puede deshacer.")) return;
    
    try {
      const batch = db.batch();
      const teacherRef = db.collection('users').doc(user.uid).collection('teachers').doc(teacherId);
      
      const recordsQuery = db.collection('users').doc(user.uid).collection('records').where('teacherId', '==', teacherId);
      const recordsSnapshot = await recordsQuery.get();
      recordsSnapshot.forEach(doc => batch.delete(doc.ref));
      
      batch.delete(teacherRef);
      await batch.commit();

    } catch (error) {
      console.error("Error deleting teacher and records:", error);
    }
  }, [user, db]);

  const handleLogCompliance = useCallback(async (teacherId: string, course: string, subject: string, status: ComplianceStatus, dateTime: string) => {
    if (!user || !db) return;
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    const newRecord = {
      teacherId,
      teacherName: teacher.name,
      date: new Date(dateTime).toISOString(),
      course,
      subject,
      status,
    };

    try {
      await db.collection('users').doc(user.uid).collection('records').add(newRecord);
    } catch (error) {
      console.error("Error logging compliance:", error);
    }
  }, [user, db, teachers]);

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
      ['Período del Informe:', `${firstRecordDate.toLocaleDateString("es-CL")} - ${lastRecordDate.toLocaleDateString('es-CL')}`],
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
    const csvContent = [ metadata, headers.join(','), ...dataRows ].join('\n');
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
  
  const handleExportJson = useCallback(() => {
    if (teachers.length === 0 && complianceRecords.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    const dataToExport = {
      teachers: teachers,
      complianceRecords: complianceRecords,
      exportDate: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const reportDate = new Date().toISOString().split('T')[0];
      link.setAttribute("href", url);
      link.setAttribute("download", `bitacora_utp_backup_${reportDate}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [teachers, complianceRecords]);

  const handleExportXlsx = useCallback(() => {
    if (complianceRecords.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const STATUS_COMPLIED = "Cumple con la planificación";
    const STATUS_NOT_COMPLIED = "Incumplimiento detectado";
    const statusMap = {
      [ComplianceStatus.COMPLIED]: STATUS_COMPLIED,
      [ComplianceStatus.NOT_COMPLIED]: STATUS_NOT_COMPLIED,
    };

    // --- 1. Calculations for Summaries ---
    const totalRecords = complianceRecords.length;
    const compliedCount = complianceRecords.filter(r => r.status === ComplianceStatus.COMPLIED).length;
    const complianceRate = totalRecords > 0 ? (compliedCount / totalRecords) : 0;
    
    const teacherRecordCounts = teachers.map(teacher => ({
        name: teacher.name,
        count: complianceRecords.filter(r => r.teacherId === teacher.id).length,
    })).sort((a, b) => b.count - a.count);

    const top3Teachers = teacherRecordCounts.slice(0, 3);
    
    // --- 2. Create "Resumen" Sheet ---
    const summaryData = [
      { Métrica: "Número total de registros", Valor: totalRecords },
      { Métrica: "Porcentaje de cumplimiento general", Valor: `${(complianceRate * 100).toFixed(1)}%` },
      { Métrica: "Total Docentes", Valor: teachers.length },
      {},
      { Métrica: "Top 3 Docentes con más registros" },
      ...top3Teachers.map((t, i) => ({ Métrica: `${i + 1}. ${t.name}`, Valor: t.count })),
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData, { skipHeader: true });
    summarySheet['!cols'] = [{ wch: 40 }, { wch: 20 }];


    // --- 3. Create "Docentes" & "Registros" Sheets ---
    const teachersSheet = XLSX.utils.json_to_sheet(teachers.map(t => ({ 'Id Docente': t.id, 'Nombre Completo': t.name })));
    teachersSheet['!cols'] = [{ wch: 25 }, { wch: 40 }];
    
    const sortedRecords = [...complianceRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const recordsSheet = XLSX.utils.json_to_sheet(sortedRecords.map(r => ({
      'Id Registro': r.id,
      'Nombre del Docente': r.teacherName,
      'Fecha': new Date(r.date).toLocaleDateString('sv-SE'),
      'Hora': new Date(r.date).toLocaleTimeString('es-CL'),
      'Curso': r.course,
      'Asignatura': r.subject,
      'Estado': statusMap[r.status],
    })));
    recordsSheet['!cols'] = [{ wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 25 }];

    // --- 4. Create Pivot Data Sheets ---
    // By Course
    const courseCompliance = COURSES.map(course => {
      const courseRecords = complianceRecords.filter(r => r.course === course);
      const total = courseRecords.length;
      if (total === 0) return null;
      const complied = courseRecords.filter(r => r.status === ComplianceStatus.COMPLIED).length;
      return {
        'Curso': course,
        'Cumplimiento (%)': total > 0 ? (complied / total * 100).toFixed(1) : 0,
        [STATUS_COMPLIED]: complied,
        [STATUS_NOT_COMPLIED]: total - complied,
        'Total Registros': total,
      };
    }).filter(Boolean);
    const courseSheet = XLSX.utils.json_to_sheet(courseCompliance);
    courseSheet['!cols'] = [{ wch: 15 }, { wch: 18 }, { wch: 28 }, { wch: 28 }, { wch: 15 }];

    // By Subject
    const subjectCompliance = SUBJECTS.map(subject => {
      const subjectRecords = complianceRecords.filter(r => r.subject === subject);
      const total = subjectRecords.length;
      if (total === 0) return null;
      const complied = subjectRecords.filter(r => r.status === ComplianceStatus.COMPLIED).length;
      return {
        'Asignatura': subject,
        'Cumplimiento (%)': total > 0 ? (complied / total * 100).toFixed(1) : 0,
        [STATUS_COMPLIED]: complied,
        [STATUS_NOT_COMPLIED]: total - complied,
        'Total Registros': total,
      };
    }).filter(Boolean);
    const subjectSheet = XLSX.utils.json_to_sheet(subjectCompliance);
    subjectSheet['!cols'] = [{ wch: 40 }, { wch: 18 }, { wch: 28 }, { wch: 28 }, { wch: 15 }];

    // By Teacher
    const teacherCompliance = teachers.map(teacher => {
      const teacherRecords = complianceRecords.filter(r => r.teacherId === teacher.id);
      const total = teacherRecords.length;
      if (total === 0) return null;
      const complied = teacherRecords.filter(r => r.status === ComplianceStatus.COMPLIED).length;
      return {
        'Docente': teacher.name,
        'Cumplimiento (%)': total > 0 ? parseFloat((complied / total * 100).toFixed(1)) : 0,
        [STATUS_COMPLIED]: complied,
        [STATUS_NOT_COMPLIED]: total - complied,
        'Total Registros': total,
      };
    }).filter(Boolean).sort((a, b) => b['Cumplimiento (%)'] - a['Cumplimiento (%)']);
    const teacherSheet = XLSX.utils.json_to_sheet(teacherCompliance);
    teacherSheet['!cols'] = [{ wch: 40 }, { wch: 18 }, { wch: 28 }, { wch: 28 }, { wch: 15 }];

    // --- 5. Create Analysis Sheet ---
    const analysisText = `
Resumen de Hallazgos:
El presente informe analiza un total de ${totalRecords} registros de cumplimiento docente, con una tasa de cumplimiento general del ${(complianceRate * 100).toFixed(1)}%. Este indicador central provee una visión panorámica de la adherencia a la planificación en la institución.

Análisis por Docente:
Se observa una variación en el desempeño individual. El personal docente con mayor tasa de cumplimiento demuestra una gestión consistente del libro de clases, mientras que aquellos con tasas más bajas podrían requerir apoyo o clarificación de procesos. Es crucial analizar las causas de los incumplimientos, que podrían variar desde la carga de trabajo hasta la necesidad de capacitación.

Análisis por Curso y Asignatura:
El desglose por curso y asignatura permite identificar patrones específicos. Ciertas áreas pueden presentar mayores desafíos, lo que podría indicar la necesidad de revisar la complejidad de la planificación, la disponibilidad de recursos o las metodologías de enseñanza aplicadas.

Recomendaciones Sugeridas:
1.  Focalizar el Apoyo: Brindar acompañamiento y mentoría a los docentes con las tasas de incumplimiento más altas para identificar barreras y desarrollar planes de mejora individualizados.
2.  Revisión Curricular: Analizar los cursos y asignaturas con bajo cumplimiento para determinar si se requieren ajustes en la planificación o en la distribución de contenidos.
3.  Reconocimiento y Buenas Prácticas: Reconocer a los docentes con alto desempeño y facilitar instancias para que compartan sus estrategias de organización y gestión con sus pares.
4.  Diálogo Continuo: Establecer reuniones periódicas con los equipos de asignatura y de nivel para revisar estos datos, discutir los desafíos y tomar decisiones pedagógicas informadas que fortalezcan la gestión de la UTP.

Este informe es una herramienta de diagnóstico que busca impulsar la mejora continua. Su valor reside en la interpretación colaborativa de los datos y en la implementación de acciones concretas y contextualizadas.
    `.trim().replace(/^    /gm, '');
    const analysisSheet = XLSX.utils.json_to_sheet([{ 'Análisis y Recomendaciones': analysisText }]);
    analysisSheet['!cols'] = [{ wch: 120 }];


    // --- 6. Assemble and Download Workbook ---
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");
    XLSX.utils.book_append_sheet(workbook, teacherSheet, "Cumplimiento por Docente");
    XLSX.utils.book_append_sheet(workbook, courseSheet, "Cumplimiento por Curso");
    XLSX.utils.book_append_sheet(workbook, subjectSheet, "Cumplimiento por Asignatura");
    XLSX.utils.book_append_sheet(workbook, recordsSheet, "Registros");
    XLSX.utils.book_append_sheet(workbook, teachersSheet, "Docentes");
    XLSX.utils.book_append_sheet(workbook, analysisSheet, "Análisis y Recomendaciones");

    const reportDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Informe_Profesional_Bitacora_UTP_${reportDate}.xlsx`);

  }, [teachers, complianceRecords]);

  const handleImportJson = useCallback(async (fileContent: string) => {
    if (!user || !db) return;

    let data;
    let recordsToImport: ComplianceRecord[];
    try {
        data = JSON.parse(fileContent);
        if (!Array.isArray(data.teachers)) {
            throw new Error("El archivo JSON debe contener un array 'teachers'.");
        }

        if (Array.isArray(data.complianceRecords)) {
            recordsToImport = data.complianceRecords;
        } else if (Array.isArray(data.records)) {
            recordsToImport = data.records;
        } else {
            throw new Error("El archivo JSON debe contener un array llamado 'records' o 'complianceRecords'.");
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
        alert(`El archivo de respaldo es inválido o está corrupto. Error: ${error instanceof Error ? error.message : String(error)}`);
        return;
    }

    const confirmation = window.confirm(
      "ADVERTENCIA: Importar este respaldo reemplazará TODOS los datos actuales (docentes y registros). Esta acción no se puede deshacer. ¿Desea continuar?"
    );

    if (!confirmation) return;
    
    setLoading(true);

    try {
        const deleteBatch = db.batch();
        const existingTeachers = await db.collection('users').doc(user.uid).collection('teachers').get();
        existingTeachers.forEach(doc => deleteBatch.delete(doc.ref));
        
        const existingRecords = await db.collection('users').doc(user.uid).collection('records').get();
        existingRecords.forEach(doc => deleteBatch.delete(doc.ref));
        
        await deleteBatch.commit();

        const importBatch = db.batch();
        const oldIdToNewIdMap: { [key: string]: string } = {};
        const teachersRef = db.collection('users').doc(user.uid).collection('teachers');
        
        data.teachers.forEach((teacher: Teacher) => {
            const newTeacherRef = teachersRef.doc();
            oldIdToNewIdMap[teacher.id] = newTeacherRef.id;
            importBatch.set(newTeacherRef, { name: teacher.name });
        });

        const recordsRef = db.collection('users').doc(user.uid).collection('records');
        recordsToImport.forEach((record: ComplianceRecord) => {
            const newTeacherId = oldIdToNewIdMap[record.teacherId];
            if (newTeacherId) {
                const newRecordRef = recordsRef.doc();
                const { id, ...recordData } = record;
                const newRecordData = {
                    ...recordData,
                    teacherId: newTeacherId,
                };
                importBatch.set(newRecordRef, newRecordData);
            }
        });

        await importBatch.commit();
        alert("Respaldo importado exitosamente.");

    } catch (error) {
        console.error("Error during import process:", error);
        alert("Ocurrió un error durante la importación. Es posible que los datos estén en un estado inconsistente. Se recomienda recargar la página.");
    } finally {
        setLoading(false);
    }
  }, [user, db]);

  const complianceLogByDay = useMemo(() => {
    const log = new Set<string>();
    complianceRecords.forEach(r => {
        const recordDate = new Date(r.date);
        const dateKey = recordDate.toLocaleDateString('sv-SE');
        log.add(`${dateKey}-${r.teacherId}-${r.course}-${r.subject}`);
    });
    return log;
  }, [complianceRecords]);

  if (!isFirebaseConfigured) {
    return <FirebaseNotConfigured />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Login onSignIn={handleSignIn} authError={authError} />;
  }

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8">
      <Header user={user} onSignOut={handleSignOut} />
      <main>
        <Dashboard
          teachers={teachers}
          records={complianceRecords}
          courses={COURSES}
          subjects={SUBJECTS}
          complianceLogByDay={complianceLogByDay}
          onAddTeacher={() => setAddTeacherModalOpen(true)}
          onDeleteTeacher={handleDeleteTeacher}
          onLogCompliance={handleLogCompliance}
          onGenerateTeacherCsv={generateTeacherCsvReport}
          onExportJson={handleExportJson}
          onExportXlsx={handleExportXlsx}
          onImportJson={handleImportJson}
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