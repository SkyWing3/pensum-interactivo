export interface Course {
  id: string;
  name: string;
  semester: number;
  prerequisites: string[];
}

export const courses: Course[] = [
  { id: "MAT101", name: "Álgebra I", semester: 1, prerequisites: [] },
  { id: "MAT102", name: "Cálculo I", semester: 1, prerequisites: [] },
  { id: "INF101", name: "Programación I", semester: 1, prerequisites: [] },
  { id: "INF102", name: "Programación II", semester: 2, prerequisites: ["INF101"] },
  { id: "MAT201", name: "Álgebra II", semester: 2, prerequisites: ["MAT101"] },
  { id: "MAT202", name: "Cálculo II", semester: 2, prerequisites: ["MAT102"] },
  { id: "INF201", name: "Estructuras de Datos", semester: 3, prerequisites: ["INF102"] },
  { id: "INF202", name: "Bases de Datos", semester: 3, prerequisites: ["INF102"] },
  { id: "MAT301", name: "Probabilidad", semester: 3, prerequisites: ["MAT202"] },
  { id: "INF301", name: "Sistemas Operativos", semester: 4, prerequisites: ["INF201"] },
];

export const semesters = Array.from(new Set(courses.map(c => c.semester))).sort();
