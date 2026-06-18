export interface ResumeData {
  url: string
}

export const emptyResume = (): ResumeData => ({
  url: '',
})
