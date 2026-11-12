export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{ field?: string; message: string }>;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Array<{ field?: string; message: string }>;
}

export interface PaginationMeta {
  total: number;
  totalPages: number;
  limit: number;
  page: number;
}

export interface PaginatedResponse<T> {
  meta: PaginationMeta;
  data: T[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
