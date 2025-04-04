import type { Context } from "@oomol/types/oocana";

import path from "path";
import fs from "fs/promises";
import download from './lib'

//#region generated meta
type Inputs = {
    url: string;
    query: Record<string, any>;
    headers: Record<string, any>;
    timeout: number;
    retry_times: number;
    save_path: string;
};
type Outputs = {
    file_path: string;
};
//#endregion


export default async function (
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Outputs> {
    const filePath = params.save_path
    const folderPath = path.dirname(filePath);
    const binary = await download({
        ...params,
        reportProgress: p => context.reportProgress(p),
    });
    await fs.mkdir(folderPath, { recursive: true });
    await fs.writeFile(filePath, binary);

    return { file_path: filePath };
}