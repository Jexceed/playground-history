export type StationAppearance = {
  id: string;
  periodId: string;
  years: string;
  title: string;
  childLine: string;
  iconSrc: string;
};

type StationTrack = {
  id: string;
  label: string;
  periods: Array<{ id: string; label: string; years?: string; range?: string; stationYears?: string; learningContext?: { childIntro?: string } | null }>;
  chapters: Array<{ id: string; periodId: string }>;
};

export type HistoryStation = StationAppearance & {
  trackId: string;
  trackLabel: string;
  number: number;
  chapterIds: string[];
};

const trackIcons: Record<string, string> = {
  'world-ancient': '/images/history-stations/world-ancient.webp',
  'world-modern': '/images/history-stations/world-modern.webp',
  'world-contemporary': '/images/history-stations/world-contemporary.webp',
  'cross-disciplinary': '/images/history-stations/cross-disciplinary.webp',
};

/** Keep each track's chronology separate; only periods with visible chapters become stops. */
export function buildStationGroups(tracks: StationTrack[], appearances: StationAppearance[] = []) {
  return tracks.map(track => {
    const stations = track.periods.flatMap(period => {
      const chapterIds = track.chapters.filter(chapter => chapter.periodId === period.id).map(chapter => chapter.id);
      if (!chapterIds.length) return [];
      const appearance = track.id.startsWith('china-') ? appearances.find(station => station.periodId === period.id) : undefined;
      return [{
        id: `${track.id}:${period.id}`,
        periodId: period.id,
        title: period.label,
        years: period.stationYears ?? period.years ?? period.range ?? appearance?.years ?? '',
        childLine: period.learningContext?.childIntro ?? appearance?.childLine ?? '',
        iconSrc: appearance?.iconSrc ?? trackIcons[track.id] ?? '/images/history-stations/change.webp',
        trackId: track.id,
        trackLabel: track.label,
        number: 0,
        chapterIds,
      }];
    }).map((station, index) => ({ ...station, number: index + 1 }));
    return { id: track.id, label: track.label, stations };
  }).filter(group => group.stations.length);
}
