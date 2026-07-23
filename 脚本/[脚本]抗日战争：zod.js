import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

const nonNegInt = value => Math.max(0, Math.floor(Number(value) || 0));
const posInt = value => Math.max(1, Math.floor(Number(value) || 1));

export const SchemaObject = z.object({
  // 顶层 prefault：世界书尚未绑定时 MagVarUpdate 可能以空 stat_data 触发校验，避免开局红字打断
  世界: z
    .object({
      当前时间: z.string().describe('抗日战争时期日期时间，格式如1937年7月7日 04:00').prefault('1937年7月7日 04:00'),
      当前地点: z
        .string()
        .describe('精确到具体场所，如【北平·宛平城外·卢沟桥附近阵地】')
        .prefault('【北平·宛平城外·卢沟桥附近阵地】'),
      近期事务: z.record(z.string().describe('事务名'), z.string().describe('事务描述')).prefault({}),
      主线阶段: z
        .string()
        .prefault('事件C_七七事变')
        .describe('当前主线阶段标识，参照世界书时间线条目，格式 事件X_简称'),
      叙事视角: z
        .enum(['中方', '日方', '外方'])
        .prefault('中方')
        .describe('文风/阵营扮演视角；可由剧情或关键词切换，供 EJS 调色盘读取'),
    })
    .prefault({}),

  玩家: z
    .object({
      等级: z.coerce
        .number()
        .transform(value => Math.max(1, Math.floor(Number(value) || 1)))
        .prefault(1)
        .describe('数值等级，1级起无上限；每累计100EXP升1级'),
      经验值: z.coerce.number().transform(nonNegInt).prefault(0).describe('当前等级段经验，无上限'),
      身份: z.string().prefault('国民革命军第二十九军三十七师士兵'),
      军衔: z
        .string()
        .prefault('一等兵')
        .describe('军衔等级：二等兵/一等兵/上等兵/下士/中士/上士/准尉/少尉/中尉/上尉/少校/中校/上校/少将/中将/上将'),
      阵营: z.string().prefault('国民革命军').describe('国民革命军/八路军/新四军/伪军/日军等'),
      所属派系: z.string().prefault('无').describe('中央军/晋绥军/西北军/东北军/川军/桂军/滇军/无等'),
      军法状态: z.string().prefault('无').describe('无/禁闭/军法审判/通缉/降职察看等'),
      身体状况: z.coerce
        .number()
        .transform(value => _.clamp(value, 0, 100))
        .prefault(100)
        .describe('健康百分比 0~100；0=死亡，1~9=濒死；战斗伤由 BP 伤档/致命检定写入，BP 本身不是血条'),
      身体状态描述: z.string().prefault('健康'),
      体力: z.coerce
        .number()
        .transform(nonNegInt)
        .prefault(110)
        .describe('当前体力；建议≤体力上限；无硬性数值上限'),
      体力上限: z.coerce
        .number()
        .transform(posInt)
        .prefault(110)
        .describe(
          '体力上限（同基础BP逻辑）：未破格时默认=100+等级×10；升级时在已录入基数上+Δ×10；训练/编制可破格抬高且禁止按公式压低；无硬性数值上限',
        ),
      伤势: z.string().prefault('无'),
      士气: z.coerce
        .number()
        .transform(value => _.clamp(value, 0, 100))
        .prefault(75)
        .describe('士气百分比 0~100；战斗结算读写'),
      作战专长: z.string().prefault('无'),
      受训经历: z.string().prefault('无').describe('沙盒扩展字段；默认无。若启用可写受训地名'),
      特殊体质: z
        .string()
        .prefault('无')
        .describe('可选风味标签，默认无；不参与 BP/伤亡主公式。有值时界面以稀有徽章显示'),
      专业技能: z.object({
        名称: z.string().prefault('无'),
        描述: z.string().prefault(''),
        掌握程度: z.enum(['未掌握', '基础', '熟练', '精通', '专家']).prefault('未掌握'),
        精通技能: z.string().prefault('未掌握').describe('专业技能精通方向或未掌握'),
      }),
      歼敌战绩: z.coerce
        .number()
        .transform(nonNegInt)
        .prefault(0)
        .describe('累计歼敌数量；无硬性数值上限'),
      武器装备: z.object({
        名称: z.string().prefault('中正式步枪'),
        类型: z.string().prefault('栓动步枪'),
        等级: z.string().prefault('普通').describe('普通/精良/特级'),
        弹药: z.coerce
          .number()
          .transform(nonNegInt)
          .prefault(60)
          .describe('随身弹药发数；无硬性数值上限，告急阈值仍为 <30'),
        状态: z.string().prefault('良好'),
      }),
      军饷: z.coerce
        .number()
        .transform(nonNegInt)
        .prefault(0)
        .describe('随身现金数量；单位见 货币种类；无硬性数值上限'),
      货币种类: z
        .string()
        .prefault('法币')
        .describe('银元/法币/边币/抗币/军票/中储券/日元等；随阵营与年代切换，禁止写死仅用法币'),
      驻地: z.string().prefault('【北平·宛平城·二十九军三十七师驻地】'),
      当前任务: z.string().prefault('【无】'),
      当前位置: z.string().prefault('【北平·宛平城·卢沟桥阵地】'),
      战役经历: z
        .record(
          z.string().describe('战役名'),
          z.object({
            结果: z
              .enum(['参战', '小胜', '大捷', '苦守', '败退', '撤退', '殉国', '受降'])
              .prefault('参战')
              .describe('成就色标依据'),
            时期: z.string().prefault('').describe('如 1938年3月'),
            简述: z.string().prefault('').describe('一句战果或经历'),
          }),
        )
        .prefault({})
        .describe('已参与战役档案；界面以成就徽章展示'),
      行囊: z
        .record(
          z.string().describe('物品名'),
          z.object({
            描述: z.string(),
            数量: z.coerce
              .number()
              .transform(nonNegInt)
              .prefault(1)
              .describe('物品数量；无硬性数值上限'),
          }),
        )
        .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
      战力: z.object({
        作战技能: z.record(
          z.string().describe('技能名'),
          z.object({
            描述: z.string(),
            熟练度: z.enum(['入门', '熟练', '精通']).prefault('入门'),
          }),
        ),
        专业技能: z.record(
          z.string().describe('技能名'),
          z.object({
            描述: z.string(),
            熟练度: z.enum(['入门', '熟练', '精通']).prefault('入门'),
          }),
        ),
        特长: z.record(
          z.string().describe('特长名'),
          z.object({
            描述: z.string(),
            熟练度: z.enum(['入门', '熟练', '精通']).prefault('入门'),
          }),
        ),
        战术素养: z.object({
          防御阵型: z.boolean().prefault(false).describe('构筑防御阵地与掩体工事'),
          火力压制: z.boolean().prefault(false).describe('以密集火力压制敌方行动'),
          精准打击: z.boolean().prefault(false).describe('对敌方关键目标实施精确打击'),
          阵地构筑: z.boolean().prefault(false).describe('基础阵地/战壕构筑'),
          战场急救: z.boolean().prefault(false).describe('沙盒辅助技能标记'),
        }),
        侦察能力: z.string().prefault('目视范围约500米'),
        军令: z.record(
          z.string().describe('军令名'),
          z.object({
            内容: z.string().describe('军令内容'),
            奖惩措施: z.string().describe('完成或违反的奖惩'),
          }),
        ),
        所属小队: z.record(
          z.string().describe('小队名'),
          z.object({
            描述: z.string(),
            状态: z.enum(['在编', '休整中', '已解散']).prefault('在编'),
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
            .describe('日常基准BP；可破格录入；升级时在基数上+Δ×10；无硬性数值上限'),
          瞬时BP: z.coerce
            .number()
            .transform(nonNegInt)
            .prefault(10)
            .describe('当前有效BP；日常通常=基础BP；无硬性数值上限'),
          弹药告急: z.boolean().prefault(false).describe('弹药暂时不足或耗尽（通常弹药<30 或 弹药=0）'),
          状态效果: z.record(z.string().describe('状态名'), z.string().describe('状态描述')).prefault({}),
        }),
      ),
      战役任务: z.object({
        参战中: z.boolean().prefault(false),
        战功值: z.coerce
          .number()
          .transform(nonNegInt)
          .prefault(0)
          .describe('参与战役积累的战功值；击杀敌军官+5、士兵+1；无硬性数值上限'),
        当前战区: z.string().prefault('无').describe('战区名称，如华北战区/淞沪战区/武汉战区/晋绥战区等，或无'),
      }),
    })
    .prefault({}),

  战斗记录: z
    .object({
      累计歼敌: z.coerce
        .number()
        .transform(nonNegInt)
        .prefault(0)
        .describe('累计歼敌；无硬性数值上限'),
      累计完成任务: z.coerce
        .number()
        .transform(nonNegInt)
        .prefault(0)
        .describe('累计完成任务；无硬性数值上限'),
      累计训练天数: z.coerce
        .number()
        .transform(nonNegInt)
        .prefault(0)
        .describe('累计训练天数；无硬性数值上限'),
      精准打击次数: z.coerce
        .number()
        .transform(nonNegInt)
        .prefault(0)
        .describe('成功完成精准打击的累计次数；无硬性数值上限'),
      指挥能力觉醒: z.boolean().prefault(false),
      精准射击掌握: z.boolean().prefault(false),
      战场急救掌握: z.boolean().prefault(false),
    })
    .prefault({}),

  系统日志: z
    .record(z.string().describe('日志条目名'), z.string().describe('日志内容'))
    .prefault({})
    .transform(data => _(data).entries().takeRight(20).fromPairs().value()),
});

function injuryBpMult(body) {
  const hp = Number(body);
  if (!(hp > 0)) return 0;
  if (hp > 80) return 1;
  if (hp > 60) return 0.85;
  if (hp > 30) return 0.65;
  if (hp > 9) return 0.4;
  return 0.2;
}

function bodyDescFromHp(hp) {
  const n = Number(hp);
  if (!(n > 0)) return '死亡';
  if (n <= 9) return '濒死';
  if (n <= 30) return '重伤';
  if (n <= 60) return '中伤';
  if (n <= 80) return '轻伤';
  return '健康';
}

function sanitizeStatData(stat) {
  if (!stat || typeof stat !== 'object') return false;
  const player = stat['玩家'];
  if (!player || typeof player !== 'object') return false;
  let changed = false;

  const body = _.clamp(Number(player['身体状况']) || 0, 0, 100);
  if (player['身体状况'] !== body) {
    player['身体状况'] = body;
    changed = true;
  }
  const morale = _.clamp(Number(player['士气']) || 0, 0, 100);
  if (player['士气'] !== morale) {
    player['士气'] = morale;
    changed = true;
  }
  const expectDesc = bodyDescFromHp(body);
  if (player['身体状态描述'] !== expectDesc) {
    player['身体状态描述'] = expectDesc;
    changed = true;
  }

  /* 体力上限同基础BP：默认底线=100+等级×10；已破格抬高则保留，禁止压回公式 */
  const level = Math.max(1, Math.floor(Number(player['等级']) || 1));
  const staminaFloor = 100 + level * 10;
  let staminaMax = Math.max(1, Math.floor(Number(player['体力上限']) || 1));
  if (staminaMax < staminaFloor) {
    staminaMax = staminaFloor;
    changed = true;
  }
  if (player['体力上限'] !== staminaMax) {
    player['体力上限'] = staminaMax;
    changed = true;
  }
  const stamina = Math.min(nonNegInt(player['体力']), staminaMax);
  if (player['体力'] !== stamina) {
    player['体力'] = stamina;
    changed = true;
  }

  const ammo = nonNegInt(player?.['武器装备']?.['弹药']);
  if (player['武器装备'] && player['武器装备']['弹药'] !== ammo) {
    player['武器装备']['弹药'] = ammo;
    changed = true;
  }

  const fight = player['战斗状态'];
  if (fight && typeof fight === 'object') {
    const base = nonNegInt(fight['基础BP']);
    if (fight['基础BP'] !== base) {
      fight['基础BP'] = base;
      changed = true;
    }
    const lowAmmo = ammo < 30;
    if (fight['弹药告急'] !== lowAmmo) {
      fight['弹药告急'] = lowAmmo;
      changed = true;
    }
    /* 有敌军目标则强制开战旗，再按伤档重算瞬时BP */
    if (!fight['是否战斗中'] && fight['当前敌人'] && fight['当前敌人'] !== '无') {
      fight['是否战斗中'] = true;
      changed = true;
    }
    const expectInstant = Math.max(
      0,
      fight['是否战斗中'] ? Math.floor(base * injuryBpMult(body)) : base,
    );
    if (fight['瞬时BP'] !== expectInstant) {
      fight['瞬时BP'] = expectInstant;
      changed = true;
    }
  }

  if (!player['货币种类']) {
    player['货币种类'] = '法币';
    changed = true;
  }
  if (!player['战役经历'] || typeof player['战役经历'] !== 'object') {
    player['战役经历'] = {};
    changed = true;
  }
  if (!stat['世界']) stat['世界'] = {};
  if (!stat['世界']['叙事视角']) {
    stat['世界']['叙事视角'] = '中方';
    changed = true;
  }
  return changed;
}

/** Schema 解析时同步校正，保证幂等；事件钩子作双保险 */
export const Schema = SchemaObject.transform(data => {
  sanitizeStatData(data);
  return data;
});

$(() => {
  registerMvuSchema(Schema);

  // 确保同名世界书已绑定，避免开局时 initvar 读空触发红字；不得清空 additional 附加世界书
  const CARD = '抗日战争 - 沙盒';
  const LOREBOOK = '抗日战争 - 沙盒';
  const ensureBound = async () => {
    try {
      if (getCurrentCharacterName?.() !== CARD) return;
      const primary = getCurrentCharPrimaryLorebook?.();
      if (primary === LOREBOOK) return;
      await setCurrentCharLorebooks({ primary: LOREBOOK });
      console.info('[抗战ZOD] 已自动绑定世界书', LOREBOOK);
    } catch (e) {
      console.warn('[抗战ZOD] 自动绑定世界书失败', e);
    }
  };

  const bindSanitize = async () => {
    await waitGlobalInitialized('Mvu');
    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (new_variables) => {
      try {
        const stat = _.get(new_variables, 'stat_data');
        if (sanitizeStatData(stat)) {
          console.info('[抗战ZOD] 已校正瞬时BP/伤档描述/弹药告急等');
        }
      } catch (e) {
        console.warn('[抗战ZOD] VARIABLE_UPDATE_ENDED 校正失败', e);
      }
    });
  };

  errorCatched(ensureBound)();
  errorCatched(bindSanitize)();
  try {
    eventOn?.(tavern_events.CHAT_CHANGED, () => errorCatched(ensureBound)());
  } catch (e) {
    /* 忽略 */
  }
});
