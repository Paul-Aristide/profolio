export type Post = {
  id: string;
  title: string | null;
  description: string | null;
  content: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  backgroundColor: string | null;
  linkUrl: string | null;
  createdAt: string;
};

export type UserData = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
  birthPlace?: string;
  phone?: string;
  profile?: {
    bio: string | null;
    expertise: string | null;
    city: string | null;
    country: string | null;
    neighborhood: string | null;
    profilePhoto: string | null;
    coverPhoto: string | null;
    maritalStatus: string | null;
    hobbies: string[];
    interests: { sports: string[]; foods: string[]; preferences: string[] } | null;
    githubUrl: string | null;
    facebookUrl: string | null;
    youtubeUrl: string | null;
    linkedinUrl: string | null;
    whatsappUrl: string | null;
    instagramUrl: string | null;
  } | null;
  formations: Array<{
    id: string;
    title: string;
    institution: string;
    year: number;
    description: string | null;
    photo: string | null;
  }>;
  experiences: Array<{
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string | null;
    logo: string | null;
  }>;
  skills: Array<{
    id: string;
    category: string;
    title: string;
    description: string | null;
  }>;
  posts: Array<{
    id: string;
    title: string | null;
    description: string | null;
    content: string | null;
    mediaUrl: string | null;
    mediaType: string | null;
    backgroundColor: string | null;
    linkUrl: string | null;
    createdAt: string;
  }>;
  agendaEvents: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    timezone: string;
    status: string;
    description: string | null;
  }>;
};
