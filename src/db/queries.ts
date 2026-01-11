import axios from "axios";
import { env } from "~/env.mjs";

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;

axios.defaults.withCredentials = true;

export type Lesson = {
  id: number;
  order: number;
  name: string;
  type: string;
  status: string;
};

export type Unit = {
  id: number;
  displayOrder: number;
  title: string;
  description: string;
  level: string;
  lessons: Lesson[];
};

export const getPractices = () => {
  return;
};

export const updateProfile = async ({
  userId,
  name,
  phoneNumber,
  password,
  avatar,
}: {
  userId: number;
  name: string;
  phoneNumber: string;
  password: string;
  avatar?: string | null;
}) => {
  return await axios.put(`${API_BASE_URL}/api/user/update-info`, {
    userId,
    name,
    phoneNumber,
    password,
    avatar,
  });
};

export const getProfile = async (userId: number) => {
  try {
    const response = await axios.get<{
      name: string;
      userXP: number;
      phone: string;
      email: string;
      avatar?: string | null;
    }>(`${API_BASE_URL}/api/user/info/${userId}`);

    return response.data;
  } catch (error) {
    return {
      name: "",
      userXP: 0,
      phone: "",
      email: "",
      avatar: "",
    };
  }
};

export const experienceByLevel = async (level: string) => {
  try {
    const response = await axios.get<
      {
        userId: number;
        name: string;
        exp: number;
      }[]
    >(`${API_BASE_URL}/api/user/experience-by-level?level=${level}`);

    return response.data;
  } catch (error) {
    console.error("Error updating right answer:", error);
    return null;
  }
};

export const updateQuestionRightAnswer = async (
  questionId: number,
  userId: number,
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/questions/right-answer?userId=${userId}&questionId=${questionId}&type=MULTIPLE_CHOICE`,
    );

    return response.data;
  } catch (error) {
    console.error("Error updating right answer:", error);
    throw error;
  }
};

export const updateQuestionWrongAnswer = async (
  questionId: number,
  userId: number,
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/questions/wrong-answer?userId=${userId}&questionId=${questionId}&type=MULTIPLE_CHOICE`,
    );
    console.log(response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error updating wrong answer:", error);
    throw error;
  }
};

export const updateStatusLesson = async (lessonId: number, userId: number) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/units/update-status?userId=${userId}&lessonId=${lessonId}`,
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return null;
    }
    console.log("Error updating lesson status:", error);
    throw error;
  }
};

export const getUnits = async (userId: number, headers?: Record<string, string>): Promise<Unit[]> => {
  try {
    const response = await axios.get<Unit[]>(
      `${API_BASE_URL}/api/units?userId=${userId}`,
      headers ? { headers } : {}
    );
    return response.data ?? [];
  } catch (error) {
    console.error("Error fetching units:", error);
    throw error;
  }
};

export const getLessonById = async (lessonId: number) => {
  const response = await axios.get(`${API_BASE_URL}/lessons/${lessonId}`);
  return response.data;
};

export const getCurrentLesson = async (userId: number) => {
  const units = await getUnits(userId);
  const currentLesson = units
    .flatMap((unit: { lessons: any[] }) => unit.lessons)
    .find((lesson: { status: string }) => lesson.status === "current");

  if (!currentLesson) return null;
  return await getLessonById(currentLesson.id);
};

export const getPreviousLessons = async (userId: number) => {
  const units = await getUnits(userId);
  const lessons = units.flatMap((unit: { lessons: any[] }) => unit.lessons);
  const currentLesson = lessons.find(
    (lesson: { status: string }) => lesson.status === "current",
  );
  if (!currentLesson) return [];
  return lessons.filter(
    (lesson: { id: number }) => lesson.id < currentLesson.id,
  );
};

export const getPracticeChallenges = async (userId: number) => {
  const previousLessons = await getPreviousLessons(userId);
  const challenges = [];
  for (const lesson of previousLessons) {
    const lessonDetails = await getLessonById(lesson.id);
    const incompleteChallenges = lessonDetails.challenges.filter(
      (challenge: { completed: boolean }) => !challenge.completed,
    );
    challenges.push(...incompleteChallenges);
  }

  return challenges;
};

export const isLessonCompleted = async (lessonId: number, userId: number) => {
  const units = await getUnits(userId);
  const lesson = units
    .flatMap((unit: { lessons: any[] }) => unit.lessons)
    .find((lesson: { id: number; status: string }) => lesson.id === lessonId);

  return lesson?.status === "completed" || false;
};

export const getLesson = async (
  lessonId: number,
  userId: number,
  type: string,
) => {
  const response = await axios.get<
    {
      id: number;
      word: string;
      meaning: string;
      question: string;
      completed: boolean;
      challengeOptions: any;
    }[]
  >(`${API_BASE_URL}/api/questions/${lessonId}?userId=${userId}&type=${type}`);

  return response.data;
};

export const getPracticeUnit = async (
  userId: number,
  unitId: number | undefined,
) => {
  if (unitId === undefined) return null;

  const response = await axios.get(
    `${API_BASE_URL}/api/questions/practice-by-unit?userId=${userId}&unitId=${unitId}&type=MULTIPLE_CHOICE`,
  );

  return response.data;
};
export const checkNewUser = async (
  userId: number,
) => {
  const A = 36;
  const response = await axios.get(
    `${API_BASE_URL}/api/user/check-new-user/${userId}`,
  );

  return response.data;
};
export const setUserLevel = async (
  userId: number,
  level: string,
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/units/set-level?userId=${userId}&level=${level}`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error; // Re-throw the error after logging it
  }
};
export const getUserProgress = async () => {
  // const response = await axios.get(`${API_BASE_URL}/user-progress`);
  // return response.data;

  return {
    points: 10,
    lessonPercentage: 100,
  };
};

export const signup = async ({
  age,
  username,
  email,
  password,
}: {
  age: string;
  username: string;
  email: string;
  password: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/account/signup`, {
    username,
    email,
    password,
    firstName: age,
  });
  return response.data;
};

export const signin = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const response = await axios.post<{
    jwt: string;
  }>(`${API_BASE_URL}/account/login`, {
    username,
    password,
  });
  return response.data;
};

export const addUserXp = async (
  userId: number,
  lessonId: number,
  score: number,
) => {
  const response = await axios.post<number>(
    `${API_BASE_URL}/api/user-progress/add-xp?userId=${userId}&lessonId=${lessonId}&score=${score}`,
  );
  return response.data;
};
