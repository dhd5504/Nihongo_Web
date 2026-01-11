import { getLesson } from "~/db/queries";

import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FlashcardSet from "~/lesson/flashcard";
import { Quiz } from "~/lesson/quiz";
import { LESSON_TYPE } from "~/pages/lesson/[lessonId]";
import { SessionKey, SessionStorage } from "~/utils/session-storage";

const LessonPage: NextPage = () => {
  return null;
};

export default LessonPage;

export function getServerSideProps() {
  return {
    redirect: {
      destination: "/learn",
    },
  };
}
