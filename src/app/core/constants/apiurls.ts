export const API_URL = {
  AUTH: {
    SEND_EMAIL_OTP: '/auth/kycus/sendEmailOtp',
    VALIDATE_EMAIL_OTP: '/auth/kycus/validateEmail',
    SIGNUP: '/auth/kycus/signup',
    REQUEST_LOGIN_OTP: '/auth/kycus/requestLoginOtp',
    LOGIN: '/auth/kycus/login',
  },
  BANKERS: {
    REQUEST_OTP: '/kycus/rekyc/banker/login',
    VERIFY_OTP: '/kycus/rekyc/banker/verifyOtp',
  },
  REKYC: {
    UPLOAD_EXCEL: '/kycus/rekyc/upload',
    SUBMIT_EXCEL: '/kycus/rekyc/upload',
    EXCEL_TEMPLATE: `/kycus/rekyc/excelTemplate`,
    SEND_REMINDER: (entityId: string) => `/kycus/rekyc/sendReminders/${entityId}`,
  },
  APPLICATION: {
    REKYC: {
      APPLICATIONS: '/kycus/rekyc/applications',
      AUS_LIST: (ausId: string) => `/kycus/rekyc/ausListDropdown/${ausId}`,
      DELETE_DOCUMENT: '/kycus/rekyc/document/delete',
      TAB_COMPLETION_STATUS: (ausId: string) => `/kycus/rekyc/tabCompletionStatus?ausId=${ausId}`,
      AUTH: {
        REQUEST_OTP: '/kycus/rekyc/auth/request-otp',
        VERIFY_OTP: '/kycus/rekyc/auth/verify-otp',
      },
      ENTITY_INFO: {
        ENTITY_FILLED_BY: '/kycus/rekyc/entityInfo/entityFilledBy',
        ENTITY_FILLED_BY_OTHERS: '/kycus/rekyc/othersDetails',
      },
      ENTITY_DETAILS_FORM: {
        ENTITY_DOCS_UPLOAD: '/kycus/rekyc/entityDocs/uploads',
        ENTITY_DETAILS: (entityId: string) => `/kycus/rekyc/entityDetails/${entityId}`,
        PREVIEW_DETAILS: (entityId: string) => `/kycus/rekyc/entityPreview/${entityId}`,
      },
      DECLARATION_FORM: {
        DIRECTORS: {
          DIRECTORS: '/kycus/rekyc/declaration/directors',
          SAVE_DRAFT: '/kycus/rekyc/declaration/directors',
        },
        BO: {
          SAVE: '/kycus/rekyc/declaration/beneficiaryOwner',
          GET: (entityId: string) => `/kycus/rekyc/boDetails?entityId=${entityId}`,
        },
      },
      PERSONAL_FORM: {
        PERSONAL_DOCS_UPLOAD: '/kycus/rekyc/ausDocs/uploads',
        PERSONAL_DETAILS: (entityId: string, ausId: string) =>
          `/kycus/rekyc/ausDetails/${entityId}/${ausId}`,
        PREVIEW_DETAILS: (entityId: string, ausId: string) =>
          `/kycus/rekyc/ausPreview/${entityId}/${ausId}`,
      },
      REKYC_FORM: {
        GET: (entityId: string) => `/kycus/rekyc/rekycForm/${entityId}`,
        PUT: (entityId: string) => `/kycus/rekyc/rekycForm/${entityId}`,
      },
      REPORT: {
        VIEW: (entityId: string) => `/kycus/rekyc/viewFinalReport/${entityId}`,
        DOWNLOAD: (entityId: string) => `/kycus/rekyc/download/${entityId}`,
        GENERATE_REPORT: (entityId: string) => `/kycus/rekyc/finalReport/${entityId}`,
        GET_REPORT: (entityId: string) => `/kycus/rekyc/rekycFormPreview/${entityId}`,
      },
    },
  },
};
