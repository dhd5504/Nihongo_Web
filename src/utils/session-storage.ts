export const SessionKey = {
    LESSON_ID: "lesson_id",
  } as const;
  
  export const SessionStorage = {
    set: (key: string, value: string) => {
      sessionStorage.setItem(key, value);
    },
    get: (key: string): string | null => {
      return sessionStorage.getItem(key);
    },
    delete: (key: string) => {
      sessionStorage.removeItem(key);
    },
  };
  