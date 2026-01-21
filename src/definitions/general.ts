export type GeneralObject = { [key: string]: any };

export type Material = {
  material_id: number | null;
  material_name: string;
  html_text: string;
};

export type Chapter = {
  id: number;
  material_id: number;
  language_resources: any;
  name: string;
  tabs?: any;
  isAssessment?: boolean;
};
export type Lesson = {
  id: number;
  chapters: Chapter[];
  lesson_id: number;
  name: string;
};

export type Curriculum = {
  bundle_id: number;
  bundle_name: string;
  curriculum: Lesson[];
  id: number;
  img_url: string;
  is_downloaded: boolean;
  is_installed: boolean;
  type: number;
};

export type NotesData = {
  // clm_id = courseId-lessonId-materialId
  blm_id: string;
  page_number: number;
  x_cord: number;
  y_cord: number;
  content: string;
  id: number;
};

export type Bookmark = {
  // chapter_id: number;
  name: string;
  id: number;
  bundleId?: number;
  lessonId?: number;
  materialId?: number;
  course_type?: number;
};
