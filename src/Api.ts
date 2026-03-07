//const BASE_URL = "https://api.staffskills.us";
const BASE_URL = "http://127.0.0.1:4000/api";
const ROOT_URL = BASE_URL.replace(/\/api$/, "");

export const APIS = {
    AUTH: `${BASE_URL}/auth`,
    ADMIN: `${BASE_URL}/admin`,
    CATEGORIES: `${BASE_URL}/categories`,
    COURSES: `${BASE_URL}/courses`,
    ENROLLMENTS: `${BASE_URL}/enrollments`,
    QUIZ: `${BASE_URL}/quizzes`,
    CERTIFICATES: `${BASE_URL}/certificates`,
    EMPLOYEE: `${BASE_URL}/employee`,
};

export const ENDPOINTS = {
    AUTH: {
        LOGIN: `${APIS.AUTH}/login`,
        REGISTER: `${APIS.AUTH}/register`,
        PROFILE: `${APIS.AUTH}/profile`,
        SEED_ADMIN: `${APIS.AUTH}/seed-admin`,
        CHANGE_PASSWORD: `${APIS.AUTH}/password`,
    },
    ADMIN: {
        LIST_EMPLOYEES: `${APIS.ADMIN}/employees`,
        DEACTIVATE_EMPLOYEE: (employeeId: string) => `${APIS.ADMIN}/employees/${employeeId}/deactivate`,
        ACTIVATE_EMPLOYEE: (employeeId: string) => `${APIS.ADMIN}/employees/${employeeId}/activate`,
        UPDATE_EMPLOYEE: (employeeId: string) => `${APIS.ADMIN}/employees/${employeeId}`,
        DEACTIVATE_QUIZ: (quizId: string) => `${APIS.ADMIN}/quizzes/${quizId}/deactivate`,
        DASHBOARD: `${APIS.ADMIN}/dashboard`,
    },
    CATEGORIES: {
        LIST: `${APIS.CATEGORIES}/`,
        GET: (id: string) => `${APIS.CATEGORIES}/${id}`,
        CREATE: `${APIS.CATEGORIES}/`,
        UPDATE: (id: string) => `${APIS.CATEGORIES}/${id}`,
        DELETE: (id: string) => `${APIS.CATEGORIES}/${id}`,
    },
    COURSES: {
        CREATE: `${APIS.COURSES}/`,
        UPDATE: (id: string) => `${APIS.COURSES}/${id}`,
        DEACTIVATE: (id: string) => `${APIS.COURSES}/${id}`,
        ADMIN_LIST: `${APIS.COURSES}/`,
        ADMIN_GET: (id: string) => `${APIS.COURSES}/${id}`,
        ADD_CHAPTER: (courseId: string) => `${APIS.COURSES}/${courseId}/chapters`,
        ADD_LESSON: (courseId: string, chapterId: string) => `${APIS.COURSES}/${courseId}/chapters/${chapterId}/lessons`,
        PUBLIC_LIST: `${APIS.COURSES}/public/list`,
        PUBLIC_GET: (id: string) => `${APIS.COURSES}/public/${id}`,
    },
    ENROLLMENTS: {
        ENROLL: (courseId: string) => `${APIS.ENROLLMENTS}/${courseId}/enroll`,
        ME: `${APIS.ENROLLMENTS}/me`,
        COMPLETE_LESSON: (courseId: string) => `${APIS.ENROLLMENTS}/${courseId}/complete-lesson`,
        PROGRESS: (courseId: string) => `${APIS.ENROLLMENTS}/${courseId}/progress`,
        RESUME: (courseId: string) => `${APIS.ENROLLMENTS}/${courseId}/resume`,
    },
    QUIZ: {
        CREATE_QUIZ: `${APIS.QUIZ}`,
        ATTEMPT: (quizId: string) => `${APIS.QUIZ}/${quizId}/attempt`,
        UPDATE: (quizId: string) => `${APIS.QUIZ}/${quizId}`,
        DELETE: (quizId: string) => `${APIS.QUIZ}/${quizId}`,
        GET: (quizId: string) => `${APIS.QUIZ}/${quizId}`,
    },
    CERTIFICATES: {
        LIST: `${APIS.CERTIFICATES}`,
    },
    EMPLOYEE: {
        DASHBOARD: `${APIS.EMPLOYEE}/dashboard`,
    },
};

export const MEDIA = {
  ROOT: ROOT_URL,
  url: (p?: string) => {
    if (!p) return '';
    const path = p.startsWith('/') ? p : '/' + p;
    return ROOT_URL + path;
  },
};
