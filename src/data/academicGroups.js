// Local demo adapter. IDs and filter names follow AcademicGroupsListDto.
export const CURRENT_YEAR_TERM = { studyYear: '2026-2027', term: '1' };
export const ACADEMIC_DEFAULTS = { ...CURRENT_YEAR_TERM, schoolId: null, groupStatus: null, degreeId: null, eduProgramId: null, groupId: null, studentId: null, subjectTypeId: null, lessonTypeId: null, componentTypeId: null, languageLevelId: null, sportSectionId: null, online: false, isMain: false, groupName: '', subjectName: '', teacherFullName: '', studyLanguageId: null, studentCount: '' };
export const PROGRAMS = [
  { value: 'mt', label: 'Media Technologies', degreeId: 'bachelor' },
  { value: 'se', label: 'Software Engineering', degreeId: 'bachelor' },
  { value: 'bda', label: 'Big Data Analysis', degreeId: 'bachelor' },
  { value: 'cs', label: 'Computer Science', degreeId: 'master' },
];
export const STUDENT_GROUPS = [
  { value: 'MT-2005', eduProgramId: 'mt' }, { value: 'SE-3002', eduProgramId: 'se' },
  { value: 'BDA-2121', eduProgramId: 'bda' }, { value: 'BA-2121', eduProgramId: 'bda' },
  { value: 'CS-2601', eduProgramId: 'cs' },
];
export const STUDENTS = STUDENT_GROUPS.flatMap((g, k) => Array.from({ length: 44 }, (_, i) => ({
  value: `${g.value}-${i + 1}`, label: `${['Алиев', 'Серикова', 'Омаров', 'Ким', 'Ахметова'][i % 5]} ${['Айдар', 'Алина', 'Данияр', 'Александр', 'Аружан'][i % 5]} ${k + 1}.${i + 1}`, groupId: g.value,
})));
const examples = [
  ['3DT3303-EN-L1', 'Production processes and production of audiovisual media content (PPAP7M)', 'Аубакиров Исхан Бауржанович', 24, 12, 44, ['MT-2005', 'SE-3002', 'BDA-2121', 'BA-2121']],
  ['5UK3303-EN-P2', 'Physical Education (PHED13)', 'Абраменков Сергей Сергеевич', 24, 24, 24, ['MT-2005', 'SE-3002', 'BDA-2121']],
  ['44PP303-EN-L2', 'IT Management (ITM123)', 'Шарипова Амира Ердалетовна', 0, 12, 44, ['MT-2005', 'SE-3002', 'BDA-2121']],
  ['3DT3303-EN-P1', 'Philosophy (PHLSP2)', 'Мухамедиахимов Диас Ренатулы', 24, 8, 20, ['SE-3002', 'BDA-2121']],
  ['5UK3303-EN-L2', 'Cybersecurity (CBRSC7)', 'Кабденова Мадина Санжаркызы', 28, 8, 44, ['MT-2005', 'SE-3002', 'BDA-2121']],
];
export const ACADEMIC_GROUPS = Array.from({ length: 240 }, (_, i) => {
  const [code, subjectName, teacherFullName, count, min, max, groups] = examples[i % 5];
  const first = i < 5;
  const groupIds = i % 11 === 10 ? ['CS-2601'] : groups;
  const studentCount = first ? count : (i % 17 === 0 ? 0 : 8 + i % 38);
  const students = Array.from({ length: studentCount }, (_, n) => `${groupIds[n % groupIds.length]}-${Math.floor(n / groupIds.length) + 1}`);
  return {
    id: `academic-${i + 1}`, groupName: first ? code : `${code.split('-')[0]}-${['EN', 'RU', 'KZ'][i % 3]}-${i % 2 ? 'P' : 'L'}${i + 1}`,
    subjectName, teacherFullName, studentCount, min, max, groupIds, students,
    studyYear: i < 120 ? CURRENT_YEAR_TERM.studyYear : '2025-2026', term: i < 120 ? CURRENT_YEAR_TERM.term : '3',
    schoolId: i % 2 ? 'computing' : 'creative', degreeId: groupIds.includes('CS-2601') ? 'master' : 'bachelor',
    eduProgramIds: STUDENT_GROUPS.filter(g => groupIds.includes(g.value)).map(g => g.eduProgramId),
    studyLanguageId: first ? 'en' : ['en', 'ru', 'kz'][i % 3],
    subjectTypeId: i % 2 ? 'general' : 'professional', lessonTypeId: code.includes('-P') ? 'practice' : 'lecture',
    componentTypeId: i % 2 ? 'elective' : 'required', languageLevelId: i % 7 === 0 ? 'b2' : null,
    sportSectionId: i % 5 === 1 ? (i % 2 ? 'football' : 'volleyball') : null,
    online: i % 4 === 0, isMain: i % 2 === 0,
    isUnprofitable: studentCount < min, isOvercrowded: studentCount > max,
  };
});

export function filterAcademicGroups(rows, f, sort = null, lang = 'ru') {
  const contains = (value, query) => value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  const result = rows.filter(r =>
    ['studyYear', 'term', 'schoolId', 'degreeId', 'subjectTypeId', 'lessonTypeId', 'componentTypeId', 'languageLevelId', 'sportSectionId', 'studyLanguageId'].every(k => !f[k] || r[k] === f[k]) &&
    ['groupName', 'subjectName', 'teacherFullName'].every(k => !f[k] || contains(r[k], f[k])) &&
    (!f.eduProgramId || r.eduProgramIds.includes(f.eduProgramId)) &&
    (!f.groupId || r.groupIds.includes(f.groupId)) && (!f.studentId || r.students.includes(f.studentId)) &&
    (f.studentCount === '' || r.studentCount === Number(f.studentCount)) &&
    (!f.online || r.online) && (!f.isMain || r.isMain) &&
    (!f.groupStatus || (f.groupStatus === 'unprofitable' ? r.isUnprofitable : r.isOvercrowded))
  );
  if (sort) result.sort((a, b) => {
    const value = r => sort.key === 'groupId' ? r.groupIds.join(', ') : sort.labels?.[r[sort.key]] ?? r[sort.key];
    return value(a).localeCompare(value(b), lang === 'kz' ? 'kk' : lang, { numeric: true }) * (sort.direction === 'asc' ? 1 : -1);
  });
  return result;
}
