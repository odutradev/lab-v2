export interface TimeRangePickerProps {
  allDay: boolean
  onAllDayChange: (val: boolean) => void
  startTime: string
  endTime: string
  onStartTimeChange: (val: string) => void
  onEndTimeChange: (val: string) => void
}
