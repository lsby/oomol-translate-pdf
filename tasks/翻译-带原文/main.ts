import { createReadStream, createWriteStream } from "fs";
import * as readline from "readline";
import OpenAILib from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import type { Context } from "@oomol/types/oocana";

//#region generated meta
type Inputs = {
    输入文件路径: string;
    输出文件路径: string;
    源文语言: string;
    目标语言: string;
    AI_Bash: string;
    AI_Key: string;
    AI_Model: string;
};
type Outputs = {
    输出文件: string;
};
//#endregion

export default async function (
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Outputs> {
    let openai = new OpenAILib({
        apiKey: params.AI_Key,
        baseURL: params.AI_Bash,
    })

    const rl = readline.createInterface({
        input: createReadStream(params.输入文件路径, { encoding: "utf-8" }),
        crlfDelay: Infinity,
    });

    const output = createWriteStream(params.输出文件路径, { encoding: "utf-8" });

    let buffer: string[] = [];

    const flushParagraph = async () => {
        if (buffer.length === 0) return;

        const paragraph = buffer.join("\n").trim();
        buffer = [];

        console.log('==========================')
        console.log(`原文: ${paragraph}`);
        let response = await openai.chat.completions.create({
            model: params.AI_Model,
            messages: [{
                role: 'system' as const,
                content: [
                    `你是一位语言风格精准、熟悉多语种语境的翻译专家。现在请你将以下文本从【${params.源文语言}】翻译为【${params.目标语言}】。`,
                    `要求如下：`,
                    `- 精准还原原文含义；`,
                    `- 保持原文的语气和语境；`,
                    `- 如有术语或专业词汇，使用${params.目标语言}中通用/标准的表达；`,
                    `- 不添加任何解释或注释；`,
                    `- 输出内容仅包含翻译后的文本。`,
                    '',
                    `原文如下：`,
                    `${paragraph}`
                ].join('\n'),
            }]
        })
        let 结果 = response.choices[0].message.content
        console.log(`翻译: ${结果}`);

        output.write(paragraph + '\n\n' + 结果 + "\n\n");
    };

    for await (const line of rl) {
        if (line.trim() === "") {
            await flushParagraph();
        } else {
            buffer.push(line);
        }
    }

    await flushParagraph(); // 处理最后一段
    output.end();

    return { 输出文件: params.输出文件路径 };
};
