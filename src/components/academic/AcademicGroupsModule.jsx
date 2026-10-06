import { useMemo, useState } from 'react';
import { ActionIcon, Anchor, Badge, Box, Button, Checkbox, Collapse, Group, Modal, Pagination, Select, SimpleGrid, Stack, Table, Text, TextInput, Tooltip, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, FilterX, Trash2, ArrowLeft } from 'lucide-react';
import { useI18n } from '../../i18n';
import PageHeader from '../PageHeader';
import { ACADEMIC_DEFAULTS, ACADEMIC_GROUPS, CURRENT_YEAR_TERM, PROGRAMS, STUDENT_GROUPS, STUDENTS, filterAcademicGroups } from '../../data/academicGroups';

const STORAGE_KEY = 'du-academic-deleted-v1';
function readDeleted() {
  try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; }
}
export default function AcademicGroupsModule() {
  const { t, lang } = useI18n();
  const [filters, setFilters] = useState({ ...ACADEMIC_DEFAULTS });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(30);
  const [advanced, setAdvanced] = useState(false);
  const [sort, setSort] = useState(null);
  const [opened, setOpened] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleted, setDeleted] = useState(readDeleted);
  const [deleteError, setDeleteError] = useState(false);
  const set = patch => { setFilters(f => ({ ...f, ...patch })); setPage(1); };
  const reset = () => { setFilters({ ...ACADEMIC_DEFAULTS }); setPage(1); setSort(null); };
  const allRows = useMemo(() => ACADEMIC_GROUPS.filter(r => !deleted.includes(r.id)), [deleted]);
  const filtered = useMemo(() => filterAcademicGroups(allRows, filters, sort?.key === 'studyLanguageId' ? { ...sort, labels: { en: t('lang_en'), ru: t('lang_ru'), kz: t('lang_kz') } } : sort, lang), [allRows, filters, sort, lang, t]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pages);
  const rows = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const programs = PROGRAMS.filter(p => !filters.degreeId || p.degreeId === filters.degreeId);
  const groups = STUDENT_GROUPS.filter(g => programs.some(p => p.value === g.eduProgramId) && (!filters.eduProgramId || filters.eduProgramId === g.eduProgramId)).map(g => g.value);
  const students = STUDENTS.filter(s => s.groupId === filters.groupId);
  const selectGroup = groupId => set({ groupId, studentId: null });
  const options = pairs => pairs.map(([value, labelKey]) => ({ value, label: t(labelKey) }));
  const languages = options([['en', 'lang_en'], ['ru', 'lang_ru'], ['kz', 'lang_kz']]);
  const lessonTypes = options([['lecture', 'lesson_lecture'], ['practice', 'lesson_practice'], ['lab', 'lesson_lab']]);
  const active = Object.keys(ACADEMIC_DEFAULTS).some(k => filters[k] !== ACADEMIC_DEFAULTS[k]);
  const choose = (key, label, data, extra = {}) => <Select key={key} label={t(label)} placeholder={t('all')} data={data} value={filters[key]} onChange={v => set({ [key]: v })} clearable searchable {...extra} />;
  const sortColumn = (key, label) => {
    const selected = sort?.key === key;
    const Icon = selected ? sort.direction === 'asc' ? ArrowUp : ArrowDown : ArrowUpDown;
    return <UnstyledButton className="du-academic-sort" onClick={() => { setSort(selected && sort.direction === 'desc' ? null : { key, direction: selected ? 'desc' : 'asc' }); setPage(1); }} aria-label={`${t(label)}: ${t(selected && sort.direction === 'asc' ? 'sortDesc' : 'sortAsc')}`}>
      {t(label)}<Icon size={13} aria-hidden="true" />
    </UnstyledButton>;
  };
  const badges = r => <Group gap={4} mb={r.isUnprofitable || r.isOvercrowded ? 4 : 0}>
    {r.isUnprofitable && <Badge color="red" variant="light" radius="xl" size="sm" tt="none" fw={400}>{t('unprofitable')}</Badge>}
    {r.isOvercrowded && <Badge color="yellow" variant="light" radius="xl" size="sm" tt="none" fw={400}>{t('overcrowded')}</Badge>}
  </Group>;
  const remove = () => {
    if (!deleting || deleting.studentCount !== 0) return;
    const next = [...deleted, deleting.id];
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { setDeleteError(true); return; }
    setDeleted(next); setDeleting(null); setDeleteError(false);
    notifications.show({ message: t('streamDeleted'), color: 'teal' });
  };

  if (opened) {
    const r = opened;
    const enrolled = STUDENTS.filter(s => r.students.includes(s.value));
    return <>
      <PageHeader eyebrow={t('eduProcess')} title={r.groupName} crumbs={[{ label: t('academicGroups'), onClick: () => setOpened(null) }, { label: r.groupName }]} />
      <Box className="du-academic-card" p={16}>
        <Group justify="space-between" mb={16}><Text fw={600}>{t('streamDetails')}</Text><Button variant="subtle" leftSection={<ArrowLeft size={16} />} onClick={() => setOpened(null)}>{t('backToStreams')}</Button></Group>
        {badges(r)}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
          {[[t('colDiscipline'), r.subjectName], [t('colTeacher'), r.teacherFullName], [t('year'), r.studyYear], [t('colPeriod'), r.term], [t('studyLanguage'), t(`lang_${r.studyLanguageId}`)], [t('metaLessonType'), t(`lesson_${r.lessonTypeId}`)], [t('colGroup'), r.groupIds.join(', ')], [t('streamCount'), r.studentCount], [t('streamLimits'), `${r.min} – ${r.max}`], [t('metaOnline'), t(r.online ? 'yes' : 'no')], [t('mainStream'), t(r.isMain ? 'yes' : 'no')]].map(([label, value]) => <Box key={label}><Text size="xs" c="dimmed">{label}</Text><Text>{value}</Text></Box>)}
        </SimpleGrid>
      </Box>
      <Box className="du-academic-card" p={16}><Text fw={600} mb={12}>{t('tabStudents')} · {enrolled.length}</Text>
        {enrolled.length === 0 ? <Text c="dimmed" py={24}>{t('streamStudentsEmpty')}</Text> : <Table><Table.Thead><Table.Tr><Table.Th>{t('colName')}</Table.Th><Table.Th>{t('colGroup')}</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{enrolled.map(s => <Table.Tr key={s.value}><Table.Td>{s.label}</Table.Td><Table.Td>{s.groupId}</Table.Td></Table.Tr>)}</Table.Tbody></Table>}
      </Box>
    </>;
  }
  return <>
    <PageHeader eyebrow={t('eduProcess')} title={t('academicGroups')} />
    <Box className="du-academic-card" p={16}>
      <Stack gap={12}>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={8} verticalSpacing={8}>
          <Select label={t('academicYear')} data={Array.from({ length: 4 }, (_, i) => { const y = Number(CURRENT_YEAR_TERM.studyYear.slice(0, 4)) - 2 + i; return `${y}-${y + 1}`; })} value={filters.studyYear} onChange={v => set({ studyYear: v })} allowDeselect={false} />
          <Select label={t('colPeriod')} data={['1', '2', '3']} value={filters.term} onChange={v => set({ term: v })} allowDeselect={false} />
          {choose('groupStatus', 'additional', options([['unprofitable', 'unprofitable'], ['overcrowded', 'overcrowded']]), { placeholder: t('selectValue') })}
          {choose('schoolId', 'teacherSchool', options([['computing', 'computingSchool'], ['creative', 'creativeSchool']]))}
          {choose('degreeId', 'degree', options([['bachelor', 'bachelor'], ['master', 'master']]), { onChange: v => set({ degreeId: v, eduProgramId: null, groupId: null, studentId: null, lessonTypeId: null }) })}
          {choose('eduProgramId', 'eduProgram', programs.map(({ value, label }) => ({ value, label })), { onChange: v => set({ eduProgramId: v, groupId: null, studentId: null }) })}
          {choose('studentId', 'colStudent', students.map(({ value, label }) => ({ value, label })), { disabled: !filters.groupId, placeholder: t('selectValue') })}
        </SimpleGrid>
        <Group justify="space-between" gap={8}>
          <Group gap={24}><Checkbox label={t('showOnline')} checked={filters.online} onChange={e => set({ online: e.currentTarget.checked })} /><Checkbox label={t('showMain')} checked={filters.isMain} onChange={e => set({ isMain: e.currentTarget.checked })} /></Group>
          <Group gap={8}><Button variant="subtle" size="compact-sm" leftSection={<FilterX size={14} />} onClick={reset} disabled={!active && !sort}>{t('resetFilters')}</Button><Button variant="subtle" size="compact-sm" rightSection={<ChevronDown size={14} style={{ transform: advanced ? 'rotate(180deg)' : undefined }} />} aria-expanded={advanced} onClick={() => setAdvanced(v => !v)}>{t('moreFilters')}</Button></Group>
        </Group>
        <Collapse in={advanced}><SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={8}>
          {choose('groupId', 'colGroup', groups, { onChange: selectGroup, placeholder: t('selectValue') })}
          {choose('subjectTypeId', 'subjectType', options([['general', 'general'], ['professional', 'professional']]), { onChange: v => set({ subjectTypeId: v, lessonTypeId: null }) })}
          {choose('lessonTypeId', 'metaLessonType', lessonTypes)}
          {choose('componentTypeId', 'componentType', options([['required', 'required'], ['elective', 'elective']]))}
          {choose('languageLevelId', 'languageLevel', [{ value: 'b2', label: 'B2' }])}
          {choose('sportSectionId', 'sportSection', options([['football', 'football'], ['volleyball', 'volleyball']]))}
        </SimpleGrid></Collapse>
        <Text c="dimmed" mt={4} aria-live="polite">{t('total')}: {filtered.length}</Text>
        <Box className="du-academic-table-wrap">
          <Table className="du-academic-table" style={{ tableLayout: 'fixed' }}>
            <colgroup>{[180, 208, 208, 150, 142, 150, 88, 88, 76].map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
            <Table.Thead><Table.Tr>
              <Table.Th rowSpan={2}>{t('academicStream')}<TextInput variant="unstyled" aria-label={t('streamCodePh')} placeholder={t('streamCodePh')} value={filters.groupName} onChange={e => set({ groupName: e.currentTarget.value })} /></Table.Th>
              <Table.Th rowSpan={2} aria-sort={sort?.key === 'subjectName' ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>{sortColumn('subjectName', 'colDiscipline')}<TextInput variant="unstyled" aria-label={t('subjectPh')} placeholder={t('subjectPh')} value={filters.subjectName} onChange={e => set({ subjectName: e.currentTarget.value })} /></Table.Th>
              <Table.Th rowSpan={2} aria-sort={sort?.key === 'teacherFullName' ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>{sortColumn('teacherFullName', 'colTeacher')}<TextInput variant="unstyled" aria-label={t('teacherPh')} placeholder={t('teacherPh')} value={filters.teacherFullName} onChange={e => set({ teacherFullName: e.currentTarget.value })} /></Table.Th>
              <Table.Th rowSpan={2} aria-sort={sort?.key === 'studyLanguageId' ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>{sortColumn('studyLanguageId', 'studyLanguage')}<Select variant="unstyled" data={languages} value={filters.studyLanguageId} onChange={v => set({ studyLanguageId: v })} clearable aria-label={t('languagePh')} placeholder={t('languagePh')} /></Table.Th>
              <Table.Th rowSpan={2}>{t('streamCount')}<TextInput type="number" min={0} step={1} variant="unstyled" aria-label={t('countPh')} placeholder={t('countPh')} value={filters.studentCount} onChange={e => set({ studentCount: e.currentTarget.value })} /></Table.Th>
              <Table.Th rowSpan={2} aria-sort={sort?.key === 'groupId' ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>{sortColumn('groupId', 'colGroup')}<Select variant="unstyled" data={groups} value={filters.groupId} onChange={selectGroup} clearable searchable aria-label={t('groupPh')} placeholder={t('groupPh')} /></Table.Th>
              <Table.Th colSpan={2}>{t('streamLimits')}</Table.Th><Table.Th rowSpan={2}>{t('actions')}</Table.Th>
            </Table.Tr><Table.Tr><Table.Th>{t('minimum')}</Table.Th><Table.Th>{t('maximum')}</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>{rows.map(r => <Table.Tr key={r.id}>
              <Table.Td>{badges(r)}<Anchor component="button" type="button" ta="left" fw={600} size="sm" onClick={() => setOpened(r)}>{r.groupName}</Anchor></Table.Td>
              <Table.Td>{r.subjectName}</Table.Td><Table.Td>{r.teacherFullName}</Table.Td><Table.Td>{t(`lang_${r.studyLanguageId}`)}</Table.Td><Table.Td>{r.studentCount}</Table.Td>
              <Table.Td><Tooltip label={r.groupIds.join(', ')} multiline w={220}><Text size="sm" lineClamp={3}>{r.groupIds.join(', ')}</Text></Tooltip></Table.Td><Table.Td>{r.min}</Table.Td><Table.Td>{r.max}</Table.Td>
              <Table.Td>{r.studentCount === 0 && <Tooltip label={t('deleteStream')}><ActionIcon variant="subtle" color="red" aria-label={`${t('deleteStream')} ${r.groupName}`} onClick={() => { setDeleting(r); setDeleteError(false); }}><Trash2 size={16} /></ActionIcon></Tooltip>}</Table.Td>
            </Table.Tr>)}</Table.Tbody>
          </Table>
          {rows.length === 0 && <Stack align="center" py={48} gap={12}><Text c="dimmed" ta="center">{t('emptyAcademic')}</Text><Button variant="light" onClick={reset}>{t('resetFilters')}</Button></Stack>}
        </Box>
        <Group justify="flex-end" gap={24} mt={4}><Group gap={8}><Text size="sm">{t('perPage')}</Text><Select aria-label={t('perPage')} w={72} data={['5', '10', '30', '50']} value={String(perPage)} allowDeselect={false} onChange={v => { setPerPage(Number(v)); setPage(1); }} /></Group><Pagination total={pages} value={currentPage} onChange={setPage} withEdges radius="xl" /></Group>
      </Stack>
    </Box>
    <Modal opened={!!deleting} onClose={() => setDeleting(null)} title={t('deleteTitle')} centered radius={16}>
      <Text>{deleting && t('deleteQuestion')(deleting.groupName)}</Text>
      {deleteError && <Text c="red" mt={12}>{t('saveFailed')}</Text>}
      <Group justify="flex-end" mt={24}><Button variant="default" onClick={() => setDeleting(null)}>{t('cancel')}</Button><Button color="red" onClick={remove}>{t('delete')}</Button></Group>
    </Modal>
  </>;
}
