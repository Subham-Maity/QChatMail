export const backend_pdf_prefix = process.env.NEXT_PUBLIC_BACKEND_PDF_PREFIX;

export const PORTFOLIO_SERVER_BASE_URL =
  process.env.NEXT_PUBLIC_PORTFOLIO_SERVER_BASE_URL;

export const BASE_URLS = [
  // 1. PDF
  `${PORTFOLIO_SERVER_BASE_URL}${backend_pdf_prefix}`,
  // 2. Example
  process.env.NEXT_PUBLIC_BASE_URL_EXAMPLE,
];
