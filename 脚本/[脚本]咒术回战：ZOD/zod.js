import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

const nonNegInt = value => Math.max(0, Math.floor(Number(value) || 0));

export const Schema = z.object({
  世界: z.object({
    当前时间: z.string().describe('现代日本日期时间，格式如2018年6月20日 08:00'),
    当前地点: z.string().describe('精确到具体场所，如【东京都·东京都立咒术高专·一年级教室】'),
    近期事务: z.record(z.string().describe('事务名'), z.string().describe('事务描述')),
    主线阶段: z
      .string()
      .prefault('事件F3_五条悟担保与入学高专')
      .describe('当前主线阶段标识，参照世界书时间线条目，格式 事件X_简称'),
  }),

  玩家: z.object({
    等级: z.coerce
      .number()
      .transform(value => Math.max(1, Math.floor(Number(value) || 1)))
      .prefault(1)
      .describe('数值等级，1级起无上限；每累计100EXP升1级'),
    经验值: z.coerce.number().transform(nonNegInt).prefault(0).describe('当前等级段经验，无上限'),
    身份: z.string().prefault('东京都立咒术高专一年级生'),
    咒术师等级: z
      .string()
      .prefault('四级')
      .describe('总监部官方等级：四级/三级/二级/准一级/一级/特级，或候补生/见习'),
    阵营: z.string().prefault('中立派').describe('改革派/保守派/中立派/诅咒师/羂索派等'),
    御三家出身: z.string().prefault('无').describe('五条家/禅院家/加茂家/无'),
    通缉状态: z.string().prefault('无').describe('无/总监部通缉/死刑暂缓等'),
    身体状况: z.coerce.number().transform(value => _.clamp(value, 0, 100)).prefault(100),
    身体状态描述: z.string().prefault('健康'),
    咒力储备: z.coerce.number().transform(nonNegInt).prefault(20).describe('当前咒力；上限约=等级×10'),
    咒力上限: z.coerce
      .number()
      .transform(value => Math.max(1, Math.floor(Number(value) || 1)))
      .prefault(20)
      .describe('咒力上限≈等级×10（1~2级下限20）'),
    永久损伤: z.string().prefault('无'),
    术式流派: z.string().prefault('未觉醒生得术式'),
    海外修行: z
      .string()
      .prefault('无')
      .describe('沙盒扩展字段，非原著体系；默认无。若启用可写地区名'),
    天与咒缚: z
      .string()
      .prefault('无')
      .describe('无 / 零咒力·极致肉体(甚尔型) / 巨量咒力·肉体脆弱(与幸吉型) 等'),
    生得术式: z.object({
      名称: z.string().prefault('未觉醒'),
      描述: z.string().prefault(''),
      掌握阶段: z.enum(['未觉醒', '已觉醒', '术式顺转', '术式反转', '领域展开']).prefault('未觉醒'),
      极之番: z
        .string()
        .prefault('未掌握')
        .describe('术式奥义名或未掌握；代价因人而异，禁止默认写成必濒死'),
    }),
    宿傩手指: z.coerce
      .number()
      .transform(value => _.clamp(value, 0, 20))
      .prefault(0)
      .describe('已吞下/收集的宿傩手指（共20根）'),
    咒具: z.object({
      名称: z.string().prefault('无'),
      类型: z.string().prefault('无'),
      等级: z.string().prefault('普通').describe('普通/一级/特级'),
      耐久: z.coerce.number().transform(value => _.clamp(value, 0, 100)).prefault(100),
      状态: z.string().prefault('极佳'),
    }),
    金钱: z.coerce.number().transform(value => _.clamp(value, 0, 999999)).prefault(0),
    居住: z.string().prefault('【东京都·东京都立咒术高专·男生宿舍】'),
    当前任务: z.string().prefault('【无】'),
    当前位置: z.string().prefault('【东京都·东京都立咒术高专·一年级教室】'),
    当前服装: z.object({
      外套: z.string().prefault('高专制服外套'),
      内搭: z.string().prefault('白色T恤'),
      下装: z.string().prefault('黑色长裤'),
      足具: z.string().prefault('运动鞋'),
      战术功能: z.string().prefault('无').describe('防火面料等；无则填无'),
      备注: z.string().prefault(''),
    }),
    行囊: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number().transform(value => _.clamp(value, 0, 9999)).prefault(1),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
    能力: z.object({
      掌握战技: z.record(
        z.string().describe('战技名'),
        z.object({
          描述: z.string(),
          熟练度: z.enum(['入门', '熟练', '精通']).prefault('入门'),
        }),
      ),
      掌握术式: z.record(
        z.string().describe('术式名'),
        z.object({
          描述: z.string(),
          熟练度: z.enum(['入门', '熟练', '精通']).prefault('入门'),
        }),
      ),
      特殊能力: z.record(
        z.string().describe('能力名'),
        z.object({
          描述: z.string(),
          熟练度: z.enum(['入门', '熟练', '精通']).prefault('入门'),
        }),
      ),
      进阶技法: z.object({
        简易领域: z.boolean().prefault(false).describe('可对抗领域必中；掌握者稀少'),
        领域展延: z.boolean().prefault(false).describe('以咒力中和敌方术式效果'),
        术式顺转最大输出: z.boolean().prefault(false).describe('将术式推至高输出；具体倍率勿写死为原著'),
        帐术: z.boolean().prefault(false).describe('基础帐/结界操作'),
        净灵术式: z.boolean().prefault(false).describe('沙盒辅助技法标记，非原著正式术式名'),
      }),
      咒力感知: z.string().prefault('被动约30米'),
      束缚誓言: z.record(
        z.string().describe('誓言名'),
        z.object({
          内容: z.string().describe('限制内容'),
          代价或强化: z.string().describe('换取的强化或承担的代价'),
        }),
      ),
      式神: z.record(
        z.string().describe('式神名'),
        z.object({
          描述: z.string(),
          状态: z.enum(['可召唤', '调伏中', '已破坏']).prefault('可召唤'),
        }),
      ),
    }),
    战斗状态: z.preprocess(
      raw => {
        if (!raw || typeof raw !== 'object') return raw;
        const data = { ...raw };
        if (data['基础BP'] == null && data['基础战斗力'] != null) data['基础BP'] = data['基础战斗力'];
        if (data['瞬时BP'] == null && data['有效战斗力'] != null) data['瞬时BP'] = data['有效战斗力'];
        return data;
      },
      z.object({
        是否战斗中: z.boolean().prefault(false),
        当前敌人: z.string().prefault('无'),
        基础BP: z.coerce
          .number()
          .transform(nonNegInt)
          .prefault(10)
          .describe('日常基准BP；可破格录入；升级时在基数上+Δ×10'),
        瞬时BP: z.coerce
          .number()
          .transform(nonNegInt)
          .prefault(10)
          .describe('当前有效BP；日常通常=基础BP'),
        术式熔断: z.boolean().prefault(false).describe('生得术式暂时不可用'),
        状态效果: z.record(z.string().describe('状态名'), z.string().describe('状态描述')).prefault({}),
      }),
    ),
    死灭回游: z.object({
      参与中: z.boolean().prefault(false),
      泳者点数: z.coerce
        .number()
        .transform(value => _.clamp(value, 0, 9999))
        .prefault(0)
        .describe('参与时初始通常为1；击杀术师+5、非术师+1；满100可追加总则'),
      所在结界: z
        .string()
        .prefault('无')
        .describe('殖民地结界名，如东京第1结界/东京第2结界/仙台/樱岛等，或无；禁止写结界核心'),
    }),
  }),

  战斗记录: z.object({
    累计祓除咒灵: z.coerce.number().transform(value => _.clamp(value, 0, 9999)).prefault(0),
    累计完成任务: z.coerce.number().transform(value => _.clamp(value, 0, 9999)).prefault(0),
    累计修炼天数: z.coerce.number().transform(value => _.clamp(value, 0, 9999)).prefault(0),
    黑闪次数: z.coerce
      .number()
      .transform(value => _.clamp(value, 0, 9999))
      .prefault(0)
      .describe('成功打出黑闪的累计次数；禁止少年院四连等非原著纪录'),
    领域展开觉醒: z.boolean().prefault(false),
    黑闪领悟: z.boolean().prefault(false),
    反转术式觉醒: z.boolean().prefault(false),
  }),

  系统日志: z
    .record(z.string().describe('日志条目名'), z.string().describe('日志内容'))
    .transform(data => _(data).entries().takeRight(20).fromPairs().value()),
});

$(() => {
  registerMvuSchema(Schema);
});
