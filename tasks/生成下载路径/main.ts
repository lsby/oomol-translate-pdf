import type { Context } from "@oomol/types/oocana";

//#region generated meta
type Inputs = {
    工作路径: string;
    下载地址: string;
    后缀名: string;
};
type Outputs = {
    下载路径: string;
};
//#endregion

export default async function(
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Outputs> {
    const { 工作路径, 下载地址, 后缀名 } = params;

    // 去掉 http:// 或 https:// 前缀
    let sanitized = 下载地址.replace(/^https?:\/\//, '');

    // 替换不能作为文件夹名的符号为下划线
    sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');

    // 拼接路径加上后缀名
    const 下载路径 = `${工作路径}/${sanitized}/${sanitized}${后缀名.startsWith('.') ? 后缀名 : '.' + 后缀名}`;

    return { 下载路径 };
};
