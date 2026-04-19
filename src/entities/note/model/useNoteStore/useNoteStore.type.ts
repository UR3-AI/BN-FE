export interface NoteState {
  selectedNoteNumber: number;
}

export interface NoteActions {
  selectNote: (noteNumber: number) => void;
}

export type NoteStore = NoteState & NoteActions;
