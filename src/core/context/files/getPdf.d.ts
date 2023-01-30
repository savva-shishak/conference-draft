import { f } from "./getPdfF";

export declare function getPdf(path: string): Promise<Awaited<ReturnType<typeof f>>>;