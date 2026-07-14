import axios, { type AxiosError } from "axios";

export interface ChatMessage {
  role: string;
  content: string;
}

export interface AiGatewayErrorPayload {
  message: string;
  code?: string | number;
  status?: number;
}

export class AiGatewayError extends Error {
  code?: string | number;
  status?: number;

  constructor(payload: AiGatewayErrorPayload) {
    super(payload.message);
    this.name = "AiGatewayError";
    this.code = payload.code;
    this.status = payload.status;
  }
}

export interface ChatCompletionChoice {
  message?: {
    role?: string;
    content?: string | null;
  };
}

export interface ChatCompletionResponse {
  choices?: ChatCompletionChoice[];
}

const aiGateway = axios.create({
  baseURL: import.meta.env.VITE_AI_GATEWAY_URL,
});

aiGateway.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_AI_GATEWAY_API_KEY?.trim();
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`;
    config.headers["X-API-Key"] = apiKey;
  }
  return config;
});

const FALLBACK_ERROR_MESSAGE =
  "Не удалось получить ответ от AI-шлюза. Попробуйте позже.";

const extractGatewayError = (error: unknown): AiGatewayError => {
  const axiosError = error as AxiosError<Record<string, unknown>>;
  const status = axiosError.response?.status;
  const data = axiosError.response?.data;

  if (data && typeof data === "object") {
    const message =
      typeof data.message === "string" && data.message.trim().length > 0
        ? data.message
        : FALLBACK_ERROR_MESSAGE;
    const code =
      typeof data.code === "string" || typeof data.code === "number"
        ? data.code
        : undefined;

    return new AiGatewayError({
      message,
      code,
      status: typeof status === "number" ? status : undefined,
    });
  }

  return new AiGatewayError({
    message: FALLBACK_ERROR_MESSAGE,
    status: typeof status === "number" ? status : undefined,
  });
};

export const createChatCompletion = async (
  messages: ChatMessage[],
): Promise<ChatCompletionResponse> => {
  try {
    const { data } = await aiGateway.post<ChatCompletionResponse>(
      "/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages,
      },
    );
    return data;
  } catch (error) {
    throw extractGatewayError(error);
  }
};
