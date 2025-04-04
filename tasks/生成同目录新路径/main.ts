import path from "path";
import type { Context } from "@oomol/types/oocana";

//#region generated meta
type Inputs = {
  文件路径: string;
  增加后缀文本: string;
  重定义后缀名: string | null;
};
type Outputs = {
  新文件路径: string;
};
//#endregion

export default async function (
  params: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {
  const 原路径 = params.文件路径;
  const 目录 = path.dirname(原路径);

  var 原扩展名 = path.extname(原路径)
  let 新扩展名 = params.重定义后缀名 ?? 原扩展名;
  if (新扩展名.startsWith('.') === false) {
    新扩展名 = '.' + 新扩展名
  }

  const 文件名 = path.basename(原路径, 原扩展名);
  const 新文件名 = `${文件名}${params.增加后缀文本}${新扩展名}`;
  const 新文件路径 = path.join(目录, 新文件名);

  return { 新文件路径 };
}
