
import * as XLSX from 'xlsx';
import { DayLog, Topic } from '../types';

export const exportToExcel = (logs: DayLog[], topics: Topic[]) => {
  const wb = XLSX.utils.book_new();

  // Tab 1: Nota Geral
  const generalData = logs.map(log => ({
    Data: log.date,
    'Nota Geral (0-10)': (log.score / 10).toFixed(1),
    'Pontuação (0-100)': log.score,
    ...topics.reduce((acc, t) => {
      acc[t.name] = log.topicScores[t.id] || 0;
      return acc;
    }, {} as any)
  }));
  
  const wsGeneral = XLSX.utils.json_to_sheet(generalData);
  XLSX.utils.book_append_sheet(wb, wsGeneral, "Nota Geral");

  // Detailed Tabs for each topic
  topics.forEach(topic => {
    const topicData = logs.map(log => {
      // Find which actions of this topic were completed on this date
      const completedNames = topic.actions
        .filter(action => log.completedActions.includes(`${log.date}-${action.id}`))
        .map(a => a.name)
        .join(", ");

      return {
        Data: log.date,
        Score: log.topicScores[topic.id] || 0,
        'Ações Concluídas': completedNames || "Nenhuma"
      };
    });

    const wsTopic = XLSX.utils.json_to_sheet(topicData);
    XLSX.utils.book_append_sheet(wb, wsTopic, topic.name.substring(0, 31)); // Excel limit
  });

  XLSX.writeFile(wb, `Relatorio_LifeCEO_${new Date().toISOString().split('T')[0]}.xlsx`);
};
