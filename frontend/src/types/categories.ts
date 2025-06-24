
export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'research',
    name: 'Research',
    color: 'blue',
    icon: 'BookOpen',
    description: 'Academic papers, studies, and research materials'
  },
  {
    id: 'business',
    name: 'Business',
    color: 'green',
    icon: 'Briefcase',
    description: 'Business strategies, market analysis, and industry insights'
  },
  {
    id: 'technology',
    name: 'Technology',
    color: 'purple',
    icon: 'Cpu',
    description: 'Tech news, programming resources, and innovation'
  },
  {
    id: 'personal',
    name: 'Personal',
    color: 'orange',
    icon: 'User',
    description: 'Personal notes, thoughts, and reflections'
  },
  {
    id: 'learning',
    name: 'Learning',
    color: 'pink',
    icon: 'GraduationCap',
    description: 'Educational content, courses, and tutorials'
  },
  {
    id: 'inspiration',
    name: 'Inspiration',
    color: 'yellow',
    icon: 'Lightbulb',
    description: 'Inspiring articles, quotes, and creative ideas'
  }
];
