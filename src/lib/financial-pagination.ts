export function getFinancialPagination(searchParams: URLSearchParams) {
  const requestedPage = Number(searchParams.get("page"));
  const requestedLimit = Number(searchParams.get("limit"));
  return {
    page: Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage <= 100000 ? requestedPage : 1,
    limit: Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 10,
  };
}
