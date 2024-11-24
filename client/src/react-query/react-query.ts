import { QueryClient } from "react-query";
import { queryOptions } from "./setting";

export const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: queryOptions,
  },
});
