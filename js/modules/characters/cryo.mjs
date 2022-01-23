import * as Base from './base.mjs';
import * as Widget from '../widget.mjs';
import * as Calc from '../dmg-calc.mjs';
import * as Utils from '../utils.mjs';
import * as BuffEffect from '../buffeffect.mjs';
import * as TypeDefs from '../typedefs.mjs';



export class CryoCharacterViewModel extends Base.CharacterViewModel
{
    constructor(parent)
    {
        super(parent);
        this.reactionProb = ko.observable(0);
    }


    viewHTMLList(target){
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "溶解反応",
                Widget.sliderViewHTML("reactionProb", 0, 1, 0.1,
                    `反応確率：` + Widget.spanPercentage("reactionProb()", 2))
            )
        );

        return dst;
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        let prob = Number(this.reactionProb());
        if(prob == 0)
            return calc;

        calc = calc.applyExtension(Klass => class extends Klass {
            modifyAttackInfo(attackInfo) {
                return super.modifyAttackInfo(attackInfo)
                    .map(info => {
                        if("isVaporize" in info.props || "isMelt" in info.props) {
                            // 冪等性を保つために，info.propsにすでにisVaporizeやisMeltが存在するときには
                            // 元素反応の計算をせずにそのまま返す
                            return info;
                        } else if(info.props.isCryo || false)
                        {
                            // 冪等性を保つために，必ず[type]: falseも入れる
                            return [
                                new Calc.AttackInfo(info.scale, info.ref, {...info.props, isMelt: false}, info.prob.mul(1 - prob)),
                                new Calc.AttackInfo(info.scale, info.ref, {...info.props, isMelt: true}, info.prob.mul(prob))
                            ];
                        } else {
                            return info;
                        }
                    }).flat(10);
            }
        });

        return calc;
    }


    toJS() {
        let obj = super.toJS();
        obj.reactionProb = this.reactionProb();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.reactionProb(obj.reactionProb || 0);
    }
}


// 甘雨
export class Ganyu extends Base.CharacterData
{
    constructor()
    {
        super(
            "ganyu",
            "甘雨",
            5,
            "Cryo",
            "Bow",
            335,            /* bAtk */
            630,            /* bDef */
            9797,          /* bHP */
            "baseCrtDmg",   /* bBonusType */
            0.384           /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new GanyuViewModel(this);
    }

    static normalTalentTable = [
    //  0:1段,     1:2段     2:3段     3:4段     4:5段      5:6段     6:狙撃    7:1段チャージ 8: 霜華 9:満開 10:落下 11:低空 12:高空
        [31.7/100, 35.6/100, 45.5/100, 45.5/100, 48.2/100, 57.6/100, 43.9/100, 124/100, 128/100, 218/100, 56.8/100, 114/100, 142/100],
        [34.3/100, 38.5/100, 49.2/100, 49.2/100, 52.2/100, 62.3/100, 47.4/100, 133/100, 138/100, 234/100, 61.5/100, 123/100, 153/100],
        [36.9/100, 41.4/100, 52.9/100, 52.9/100, 56.1/100, 67.0/100, 51.0/100, 143/100, 147/100, 250/100, 66.1/100, 132/100, 165/100],
        [40.6/100, 45.5/100, 58.2/100, 58.2/100, 61.7/100, 73.7/100, 56.1/100, 155/100, 160/100, 272/100, 72.7/100, 145/100, 182/100],
        [43.2/100, 48.4/100, 61.9/100, 61.9/100, 65.6/100, 78.4/100, 59.7/100, 164/100, 170/100, 288/100, 77.3/100, 155/100, 193/100],
        [46.1/100, 51.8/100, 66.1/100, 66.1/100, 70.1/100, 83.8/100, 63.8/100, 174/100, 179/100, 305/100, 82.6/100, 165/100, 206/100],
        [50.2/100, 56.3/100, 71.9/100, 71.9/100, 76.3/100, 91.1/100, 69.4/100, 186/100, 192/100, 326/100, 89.9/100, 180/100, 224/100],
        [54.2/100, 60.9/100, 77.8/100, 77.8/100, 82.5/100, 98.5/100, 75.0/100, 198/100, 205/100, 348/100, 97.1/100, 194/100, 243/100],
        [58.3/100, 65.4/100, 83.6/100, 83.6/100, 88.6/100, 105.9/100, 80.6/100, 211/100, 218/100, 370/100, 104.4/100, 209/100, 261/100],
        [62.7/100, 70.4/100, 89.9/100, 89.9/100, 95.4/100, 113.9/100, 86.7/100, 223/100, 230/100, 392/100, 112.3/100, 225/100, 281/100],
        [67.8/100, 76.1/100, 97.2/100, 97.2/100, 103.1/100, 123.1/100, 92.8/100, 236/100, 243/100, 413/100, 120.3/100, 240/100, 300/100],
    ];

    static skillTalentTable = [
    //  0:HP継承, 1:ダメージ
        [1.20, 1.32],
        [1.29, 1.42],
        [1.38, 1.52],
        [1.50, 1.65],
        [1.59, 1.75],
        [1.68, 1.85],
        [1.80, 1.98],
        [1.92, 2.11],
        [2.04, 2.24],
        [2.16, 2.38],
        [2.28, 2.51],
        [2.40, 2.64],
        [2.55, 2.81],
    ];

    static burstTalentTable = [
        0.70,
        0.76,
        0.81,
        0.88,
        0.93,
        0.98,
        1.05,
        1.12,
        1.19,
        1.26,
        1.34,
        1.41,
        1.49,
        1.58,
    ];


    static presetAttacks = [
        {
            id: "charged2",
            label: "霜華の矢",
            dmgScale(vm){ return Ganyu.normalTalentTable[vm.normalRank()-1][8]; },
            attackProps: { isCharged: true, isCryo: true, isGanyu2ndCharged: true }
        },
        {
            id: "charged2_flower",
            label: "霜華満開",
            dmgScale(vm){ return Ganyu.normalTalentTable[vm.normalRank()-1][9]; },
            attackProps: { isCharged: true, isCryo: true, isGanyu2ndCharged: true }
        },
        {
            id: "skill_dmg",
            label: "スキルダメージ",
            dmgScale(vm){ return Ganyu.skillTalentTable[vm.skillRank()-1][1]; },
            attackProps: { isSkill: true, isCryo: true }
        },
        {
            id: "burst_dmg",
            label: "爆発氷柱ダメージ",
            dmgScale(vm){ return Ganyu.burstTalentTable[vm.burstRank()-1]; },
            attackProps: { isBurst: true, isCryo: true }
        }
    ];
}

// 甘雨
export class GanyuViewModel extends CryoCharacterViewModel
{
    constructor(ch)
    {
        super(ch);
        this.useCryoDmgInc = ko.observable(false);  // 元素爆発エリア内で氷ダメージ+20%
        this.useC1Effect = ko.observable(true);     // 1凸効果，氷耐性-15%
        this.stacksC4Effect = ko.observable(0);     // 4凸効果，元素爆発エリア内の敵に+5%/スタックのダメージバフ，最大5スタックで+25% 
    }


    maxSkillTalentRank() { return this.constell() >= 5 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 3 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.useCryoDmgInc()) {
            calc.baseCryoDmg.value += 0.2;
        }

        if(this.useC1Effect() && this.constell() >= 1) {
            calc.baseCryoResis.value -= 0.15;
        }

        if(this.constell() >= 4) {
            calc.baseAllDmg.value += 0.05 * Number(this.stacksC4Effect());
        }

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            crtRate(attackProps) {
                if(attackProps.isGanyu2ndCharged || false) {
                    return super.crtRate(attackProps).add(0.2);
                } else {
                    return super.crtRate(attackProps);
                }
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    viewHTMLList(target)
    {
        let ret = super.viewHTMLList(target);

        ret.push(
            Widget.buildViewHTML(target, "元素爆発「降衆天華」関連効果",
                Widget.checkBoxViewHTML("useCryoDmgInc", "天賦「天地安泰」：氷元素ダメージ+20%")
                +
                (
                    (this.constell() < 4) ? "" :
                    Widget.selectViewHTML("stacksC4Effect", [
                        {label: "ダメージ+0%", value: 0},
                        {label: "ダメージ+5%", value: 1},
                        {label: "ダメージ+10%", value: 2},
                        {label: "ダメージ+15%", value: 3},
                        {label: "ダメージ+20%", value: 4},
                        {label: "ダメージ+25%", value: 5},
                    ], "西狩（4凸）")
                )
        ));

        if(this.constell() >= 1) {
            ret.push(
                Widget.buildViewHTML(target, "2段チャージ関連効果", Widget.checkBoxViewHTML("useC1Effect", "敵の氷元素耐性-15%（1凸）"))
            );
        }

        return ret;
    }


    toJS() {
        let obj = super.toJS();
        obj.useCryoDmgInc = this.useCryoDmgInc();
        obj.useC1Effect = this.useC1Effect();
        obj.stacksC4Effect = this.stacksC4Effect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);

        this.useCryoDmgInc(obj.useCryoDmgInc);
        this.useC1Effect(obj.useC1Effect);
        this.stacksC4Effect(obj.stacksC4Effect);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Ganyu(),
        {
            "vm": {
                "parent_id": "ganyu",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "useCryoDmgInc": false,
                "useC1Effect": true,
                "stacksC4Effect": 0
            },
            "expected": {
                "charged2": 782.6660252500001,
                "charged2_flower": 1328.37811625,
                "skill_dmg": 695.620268,
                "burst_dmg": 369.54826737499997
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Ganyu().newViewModel()
    ));
});


// 申鶴
export class Shenhe extends Base.CharacterData
{
    constructor()
    {
        super(
            "shenhe",
            "申鶴",
            5,
            "Cryo",
            "Polearm",
            304,            /* bAtk */
            830,            /* bDef */
            12993,          /* bHP */
            "rateAtk",      /* bBonusType */
            0.288           /* bBonusValue */
        );
    }


    // @ts-ignore
    newViewModel()
    {
        let Class = ShenheViewModel(CryoCharacterViewModel);
        return new Class(this, false);
    }


    static normalTalentTable = [
    //  0:1段,  1:2段,  2:3段,  3:4段          4:5段,  5:重撃, 6:落下 7:低空 8:高空
        [0.433, 0.402, 0.533, [0.263, 0.263], 0.656, 1.107, 0.639, 1.28, 1.60],
        [0.468, 0.435, 0.577, [0.285, 0.285], 0.710, 1.197, 0.691, 1.38, 1.73],
        [0.503, 0.468, 0.620, [0.306, 0.306], 0.763, 1.287, 0.743, 1.49, 1.86],
        [0.553, 0.515, 0.682, [0.337, 0.337], 0.839, 1.416, 0.818, 1.64, 2.04],
        [0.589, 0.548, 0.725, [0.358, 0.358], 0.893, 1.506, 0.870, 1.74, 2.17],
        [0.629, 0.585, 0.775, [0.383, 0.383], 0.954, 1.609, 0.929, 1.86, 2.32],
        [0.684, 0.637, 0.843, [0.414, 0.416], 1.038, 1.750, 1.011, 2.02, 2.53],
        [0.739, 0.688, 0.911, [0.450, 0.450], 1.122, 1.892, 1.093, 2.19, 2.73],
        [0.795, 0.739, 0.980, [0.484, 0.484], 1.206, 2.033, 1.175, 2.35, 2.93],
        [0.855, 0.796, 1.054, [0.520, 0.520], 1.297, 2.188, 1.264, 2.53, 3.16],
        [0.916, 0.852, 1.128, [0.557, 0.557], 1.389, 2.342, 1.353, 2.71, 3.38],
    ];


    static skillTalentTable = [
    //  0:単押しダメージ, 1:長押しダメージ, 2:追加ダメージ
        [1.39, 1.888, 0.457],
        [1.50, 2.030, 0.491],
        [1.60, 2.171, 0.525],
        [1.74, 2.360, 0.571],
        [1.84, 2.502, 0.605],
        [1.95, 2.643, 0.639],
        [2.09, 2.832, 0.685],
        [2.23, 3.021, 0.730],
        [2.37, 3.210, 0.776],
        [2.51, 3.398, 0.822],
        [2.64, 3.587, 0.867],
        [2.78, 3.776, 0.913],
        [2.96, 4.012, 0.970],
    ];


    static burstTalentTable = [
    //  0:ダメージ, 1:耐性ダウン, 2:継続ダメージ
        [1.01, 0.06, 0.331],
        [1.08, 0.07, 0.356],
        [1.16, 0.08, 0.381],
        [1.26, 0.09, 0.414],
        [1.34, 0.10, 0.439],
        [1.41, 0.11, 0.464],
        [1.51, 0.12, 0.497],
        [1.61, 0.13, 0.530],
        [1.71, 0.14, 0.563],
        [1.81, 0.15, 0.596],
        [1.92, 0.15, 0.629],
        [2.02, 0.15, 0.662],
        [2.14, 0.15, 0.704],
    ];


    static increaseDamage(skillRank, totalAtk)
    {
        let scale = Shenhe.skillTalentTable[skillRank - 1][2];
        return totalAtk.mul(scale);
    }


    static presetAttacks = [
        {
            id: "normal_1",
            label: "通常5段累計",
            dmgScale: vm => Shenhe.normalTalentTable[vm.normalRank()-1].slice(0, 5).flat(10),
            attackProps: { isNormal: true, isPhysical: true },
        },
        {
            id: "charged",
            label: "重撃",
            dmgScale: vm => Shenhe.normalTalentTable[vm.normalRank()-1][5],
            attackProps: { isCharged: true, isPhysical: true },
        },
        {
            id: "skill_short",
            label: "元素スキル（短押し）",
            dmgScale: vm => Shenhe.skillTalentTable[vm.skillRank()-1][0],
            attackProps: { isSkill: true, isCryo: true, isShenheSkill: true },
        },
        {
            id: "skill_long",
            label: "元素スキル（長押し）",
            dmgScale: vm => Shenhe.skillTalentTable[vm.skillRank()-1][1],
            attackProps: { isSkill: true, isCryo: true, isShenheSkill: true },
        },
        {
            id: "burst_dmg_6",
            label: "元素爆発（初撃＋継続ダメージ6回）",
            dmgScale: vm => [Shenhe.burstTalentTable[vm.burstRank()-1][0], ...new Array(6).fill(Shenhe.burstTalentTable[vm.burstRank()-1][2])],
            attackProps: { isBurst: true, isCryo: true },
        },
        {
            id: "burst_dmg_9",
            label: "元素爆発（初撃＋継続ダメージ9回）（2凸用）",
            dmgScale: vm => [Shenhe.burstTalentTable[vm.burstRank()-1][0], ...new Array(9).fill(Shenhe.burstTalentTable[vm.burstRank()-1][2])],
            attackProps: { isBurst: true, isCryo: true },
        },
        {
            id: "burst_add",
            label: "スキル加算ダメージ（天賦倍率x攻撃力）",
            func(calc, vm){ return Shenhe.increaseDamage(vm.skillRank(), calc.atk({})); },
            attackProps: { }
        }
    ];
}

// 申鶴, ViewModel
/**
 * @mixin
 */
export let ShenheViewModel = (Base) => class extends Base {
    constructor(parent, isBuffer)
    {
        super(parent);
        this.isBuffer = isBuffer;
        this.useSkillIncDmgEffect = ko.observable(true);// 元素スキルによる追加ダメージを考慮
        this.typeSkillDmgUp = ko.observable('Short');   //元素スキルによるダメージバフ増加効果, 'None' or 'Short' or 'Long' or 'Both'
        this.useCryoDmgUp = ko.observable(true);        // 元素爆発フィールド上での氷ダメージ加算効果
        this.useCryoResisDown = ko.observable(true);    // 元素爆発フィールド上の敵の氷/物理耐性ダウン
        this.useC2Effect = ko.observable(true);         // 2凸効果, 元素フィールド上での氷元素会心ダメージ+15%

        this.constell.subscribe((newVal) => {
            if(newVal < 1 && this.typeSkillDmgUp() == "Both") {
                this.typeSkillDmgUp("Short");
            }
        });

        if(!isBuffer)
            this.stacksC4Effect = ko.observable(20);    // 4凸効果のスタック数

        if(isBuffer)
            this.totalAtk = ko.observable(3000);        // 申鶴自身の攻撃力
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);
        let data = this.toJS();
        let isBuffer = this.isBuffer;
        let ctx = Calc.VGData.context;

        if(data.useSkillIncDmgEffect) {
            calc = calc.applyExtension(Base => class extends Base {
                increaseDamage(attackProps) {
                    let dmg = super.increaseDamage(attackProps);

                    if(attackProps.isCryo) {
                        if(isBuffer)
                            dmg = dmg.add(Shenhe.increaseDamage(data.skillRank, Calc.VGData.constant(data.totalAtk)).as(ctx));
                        else
                            dmg = dmg.add(Shenhe.increaseDamage(data.skillRank, this.atk(attackProps)));
                    }
                    
                    return dmg;
                }
            });
        }

        if(data.typeSkillDmgUp == "Short" || data.typeSkillDmgUp == "Both") {
            calc.baseSkillDmg.value += 0.15;
            calc.baseBurstDmg.value += 0.15;
        }
        
        if(data.typeSkillDmgUp == "Long" || data.typeSkillDmgUp == "Both") {
            calc.baseNormalDmg.value += 0.15;
            calc.baseChargedDmg.value += 0.15;
            calc.basePlungeDmg.value += 0.15;
        }

        if(data.useCryoDmgUp) {
            calc.baseCryoDmg.value += 0.15;
        }

        if(data.useCryoResisDown) {
            calc.baseCryoResis.value -= Shenhe.burstTalentTable[data.burstRank-1][1];
            calc.basePhysicalResis.value -= Shenhe.burstTalentTable[data.burstRank-1][1];
        }

        if(data.useC2Effect && data.constell >= 2) {
            calc = calc.applyExtension(Base => class extends Base {
                crtDmg(attackProps) {
                    if(attackProps.isCryo)
                        return super.crtDmg(attackProps).add(Calc.VGData.constant(0.15).as(ctx));
                    else
                        return super.crtDmg(attackProps);
                }
            });
        }

        if(data.constell >= 4 && !this.isBuffer) {
            calc = calc.applyExtension(Base => class extends Base {
                skillDmgBuff(attackProps) {
                    if(attackProps.isShenheSkill)
                        return super.skillDmgBuff(attackProps).add(Calc.VGData.constant(0.05 * data.stacksC4Effect).as(ctx));
                    else
                        return super.skillDmgBuff(attackProps);
                }
            });
        }

        return calc;
    }


    viewHTMLList(target)
    {
        let dst = super.viewHTMLList(target);

        {
            let options = [
                {value: "Short",    label: "元素スキル・爆発ダメージ+15%（短押し）"},
                {value: "Long",     label: "通常・重撃・落下ダメージ+15%（長押し）"},
                {value: "None",     label: "両方とも無効"},
            ];

            if(this.constell() >= 1) {
                options.push({value: "Both",     label: "両方を有効（1凸以上でスキル2回発動）"});
            }

            dst.push(Widget.buildViewHTML(target, "スキル「仰霊威召将役呪」効果",
                Widget.checkBoxViewHTML("useSkillIncDmgEffect",
                    this.isBuffer ? `氷元素攻撃へのダメージ加算（加算値：+${textInteger(Shenhe.increaseDamage(this.skillRank(), Calc.VGData.constant(this.totalAtk())).value)}）`
                                  : "氷元素攻撃へのダメージ加算")
                +
                (
                    !this.isBuffer ? "" :
                    Widget.selectViewHTML("skillRank",
                        new Array(this.maxSkillTalentRank()).fill(0).map((e, i) => { return {value:i+1, label:`${i+1}`} }),
                        "天賦レベル", {disable: "!useSkillIncDmgEffect()"})
                    +
                    Widget.textBoxViewHTML("totalAtk", "申鶴の攻撃力", {disable: "!useSkillIncDmgEffect()"})
                    +
                    `<span>申鶴の攻撃力の目安は2000〜4000程度です．どれくらいになるかよくわからない場合には<a href="https://genshinopt.toyohashi.nagoya/?ver=2&data=XQAAgABcAgAAAAAAAABFKkhmgyqxDEMhlgcym7FiUnE4jpmEpfQPBmB3s5JEgzQWNNdppP87PAN9uij_-QYHqKqJDvTlHiNKjCXnjrwAdccok98XLAlCk3ro7sNs1IkW%2Bmy3lLpBrtrZoXieDZbMLsMD%2BnZhAN5OlcjoRIcOSKJ6Kqx1ai9VDv3AbzR4fVEPNDQWBjQwWJ6wxRbi0UQ1rlbfjneWd8wUBWYsNm5jOOFSmZjN4ogxI8bnpxSV2akCLWR8M69qG3wkOGFLugND%2FxPQwgS%2BB6un4kPiQWDROnyLB%2FjMjo6hJ4cG6Hzq5qbQZwyE%2BJtvJGXoXtzWqKiyPJoSWz%2B3unCJHRFdKq1KZ4EmgyRyTX7S%2B9uNqGL%2Bd2d7wnf2rA8aPUp%2FtRPTP09jKihlCCABWpPc6F2DvwaFc5EGe3O%2Fb7EG00PVvDqL8cge%2BbIf1mxMiXXRt%2BKhuSPtxvTSQIHT7FPDZh%2BGdRFtIIuI22x%2BPGp67PV3XGLsoax63S1pQQdSvQvHnpJwNl3tQS2H7o8LW3HAKoDub82Imh%2Fc%2F8zxjJs%3D" target="_blank" rel="noopener noreferrer">こちらのページの結果の詳細表示</a>を参考にしてください．</span>`
                )
                +
                "<hr>"
                +
                Widget.radioViewHTML("typeSkillDmgUp", options)
                +
                (
                    (this.constell() < 4 || this.isBuffer) ? "" :
                    "<hr>" + Widget.sliderViewHTML("stacksC4Effect", 0, 50, 5, `4凸効果「霜霄訣」${textInteger(this.stacksC4Effect())}層`)
                )
            ));
        }

        dst.push(Widget.buildViewHTML(target, "爆発「神女遣霊真訣」効果",
            (
                !this.isBuffer ? "" :
                Widget.selectViewHTML("burstRank",
                    new Array(this.maxBurstTalentRank()).fill(0).map((e, i) => { return {value:i+1, label:`${i+1}`} }),
                    "天賦レベル")
            )
            +
            Widget.checkBoxViewHTML("useCryoDmgUp", "氷元素ダメージ+15%")
            +
            Widget.checkBoxViewHTML("useCryoResisDown",
                `敵の氷元素/物理耐性ダウン-${textPercentageFix(Shenhe.burstTalentTable[this.burstRank()-1][1], 0)}`)
            +
            (
                this.constell() < 2 ? "":
                Widget.checkBoxViewHTML("useC2Effect", "氷元素攻撃の会心ダメージ+15%（2凸効果）")
            )
        ));

        return dst;
    }


    toJS()
    {
        let obj = super.toJS();
        obj.useSkillIncDmgEffect = this.useSkillIncDmgEffect();
        obj.typeSkillDmgUp = this.typeSkillDmgUp();
        obj.useCryoDmgUp = this.useCryoDmgUp();
        obj.useCryoResisDown = this.useCryoResisDown();
        obj.useC2Effect = this.useC2Effect();

        if(!this.isBuffer)
            obj.stacksC4Effect = this.stacksC4Effect();

        if(this.isBuffer)
            obj.totalAtk = this.totalAtk();

        return obj;
    }


    fromJS(obj)
    {
        super.fromJS(obj);
        this.useSkillIncDmgEffect(obj.useSkillIncDmgEffect);
        this.typeSkillDmgUp(obj.typeSkillDmgUp);
        this.useCryoDmgUp(obj.useCryoDmgUp);
        this.useCryoResisDown(obj.useCryoResisDown);
        this.useC2Effect(obj.useC2Effect);

        if(!this.isBuffer)
            this.stacksC4Effect(obj.stacksC4Effect);

        if(this.isBuffer)
            this.totalAtk(obj.totalAtk);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Shenhe(),
        {
            "vm": {
                "parent_id": "shenhe",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "reactionProb": 0,
                "useSkillIncDmgEffect": true,
                "typeSkillDmgUp": "Short",
                "useCryoDmgUp": true,
                "useCryoResisDown": true,
                "useC2Effect": true,
                "stacksC4Effect": 20
            },
            "expected": {
                "normal_1": 1668.4478737920003,
                "charged": 723.539788272,
                "skill_short": 2629.10335143456,
                "skill_long": 3331.0889888169595,
                "burst_dmg_6": 4969.1281453632,
                "burst_dmg_9": 6866.560441933919,
                "burst_add": 503.741952
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Shenhe().newViewModel()
    ));
});


// 重雲
export class Chongyun extends Base.CharacterData
{
    constructor()
    {
        super(
            "chongyun",
            "重雲",
            4,
            TypeDefs.Element.Cryo,
            TypeDefs.WeaponType.Claymore,
            223,
            648,
            10984,
            TypeDefs.StaticStatusType.rateAtk,
            0.240,
        );
    }


    newViewModel()
    {
        return new (ChongyunViewModel(CryoCharacterViewModel))(this, false);
    }


    static normalTalentTable = [
        // 0-3: 通常, 4:重撃継続, 5:重撃終了, 6:落下, 7:低空, 8:高空
        [0.700, 0.631, 0.803, 1.010, 0.563, 1.020, 0.746, 1.490, 1.860],
        [0.757, 0.683, 0.869, 1.090, 0.609, 1.100, 0.807, 1.610, 2.010],
        [0.814, 0.734, 0.934, 1.180, 0.654, 1.180, 0.867, 1.730, 2.170],
        [0.895, 0.807, 1.030, 1.290, 0.720, 1.300, 0.954, 1.910, 2.380],
        [0.952, 0.859, 1.090, 1.380, 0.766, 1.380, 1.015, 2.030, 2.530],
        [1.020, 0.918, 1.170, 1.470, 0.818, 1.480, 1.084, 2.170, 2.710],
        [1.110, 0.998, 1.270, 1.600, 0.890, 1.610, 1.180, 2.360, 2.950],
        [1.200, 1.080, 1.370, 1.730, 0.962, 1.740, 1.270, 2.550, 3.180],
        [1.290, 1.160, 1.480, 1.860, 1.030, 1.870, 1.370, 2.740, 3.420],
        [1.380, 1.250, 1.590, 2.000, 1.110, 2.010, 1.474, 2.950, 3.680],
        [1.480, 1.340, 1.700, 2.140, 1.190, 2.150, 1.578, 3.160, 3.940]
    ];


    static skillTalentTable = [
        1.720,
        1.850,
        1.980,
        2.150,
        2.280,
        2.410,
        2.580,
        2.750,
        2.920,
        3.100,
        3.270,
        3.440,
        3.650
    ];


    static burstTalentTable = [
        1.420,
        1.530,
        1.640,
        1.780,
        1.890,
        1.990,
        2.140,
        2.280,
        2.420,
        2.560,
        2.710,
        2.850,
        3.030,
        3.200
    ];


    static presetAttacks = [
        {
            id: "normal_total",
            label: "通常4段累計",
            dmgScale(vm){ return Chongyun.normalTalentTable[vm.normalRank()-1].slice(0, 4); },
            attackProps: { isNormal: true, isPhysical: true }
        },
        {
            id: "normal_total_C1",
            label: "通常4段累計 + 1凸氷ダメージx3",
            list: [
                {
                    dmgScale(vm){ return Chongyun.normalTalentTable[vm.normalRank()-1].slice(0, 4); },
                    attackProps: { isNormal: true, isPhysical: true }
                },
                {
                    dmgScale(vm){ return [0.5, 0.5, 0.5]; },
                    attackProps: { isCryo: true }
                }
            ]
        },
        {
            id: "skill_dmg",
            label: "元素スキル「霊刃・重華積霜」",
            dmgScale(vm){ return Chongyun.skillTalentTable[vm.skillRank()-1]; },
            attackProps: { isSkill: true, isCryo: true }
        },
        {
            id: "skill_dmg_finish",
            label: "元素スキル「霊刃・重華積霜」消滅時ダメージ",
            dmgScale(vm){ return Chongyun.skillTalentTable[vm.skillRank()-1]; },
            attackProps: { isSkill: true, isCryo: true }
        },
        {
            id: "burst_dmg",
            label: "元素爆発「霊刃・雲開星落」x 3本（6凸時は4本）",
            dmgScale(vm){
                    return new Array(vm.constell() >= 6 ? 4 : 3)
                    .fill(Chongyun.burstTalentTable[vm.burstRank()-1]);
            },
            attackProps: { isBurst: true, isCryo: true }
        }
    ];
}


// 重雲
export let ChongyunViewModel = (Base) => class extends Base
{
    constructor(parent, isBuffer)
    {
        super(parent);
        this.isBuffer = isBuffer;

        // スキルでの元素付与効果
        this.registerTalent({
            type: "Skill",
            requiredC: 0,
            uiList: [{
                type: "checkbox",
                name: "useToCryoEffect",
                init: true,
                label: (vm) => "片手剣/両手剣/長柄武器に氷元素付与",
            }],
            effect: undefined   // 効果はapplyDmgCalcImplで実装
        });

        // スキルでの氷耐性減少効果
        this.registerTalent({
            type: "Skill",
            requiredC: 0,
            uiList: [{
                type: "checkbox",
                name: "useCryoResisDown",
                init: true,
                label: (vm) => "氷元素耐性-10%（スキル命中時）",
            }],
            effect: {
                cond: (vm) => vm.useCryoResisDown(),
                list: [{
                    target: TypeDefs.StaticStatusType.cryoResis,
                    value: (vm) => -0.1
                }]
            }
        });

        if(!isBuffer) {
            // 元素爆発のダメージ増加効果
            this.registerTalent({
                type: "Burst",
                requiredC: 6,
                uiList: [{
                    type: "checkbox",
                    name: "useC6Effect",
                    init: true,
                    label: (vm) => "元素爆発ダメージ+15%（HPの割合が重雲より低い敵に）",
                }],
                effect: {
                    cond: (vm) => vm.useC6Effect(),
                    list: [{
                        target: TypeDefs.StaticStatusType.burstDmg,
                        value: (vm) => 0.15
                    }]
                }
            });
        }
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.useToCryoEffect()) {
            calc = calc.applyExtension(Klass => class extends Klass {
                modifyAttackInfo(attackInfo) {
                    return super.modifyAttackInfo(attackInfo).map(info => {
                        if(!info.props.isCryo &&
                        (this.character.weaponType == 'Sword' || this.character.weaponType == 'Claymore' || this.character.weaponType == 'Polearm'))
                    {
                        // 全元素や元素反応を消して，氷元素を付与
                        let newProps = Calc.deleteAllElementFromAttackProps({...info.props});
                        newProps.isCryo = true;

                        return this.modifyAttackInfo(new Calc.AttackInfo(info.scale, info.ref, newProps, info.prob));
                    }
                    else
                    {
                        // 元々氷元素だったり，対象外であればそのまま返す
                            return info;
                    }
                    }).flat(10);
                }
            });
        }

        return calc;
    }

    
    maxSkillTalentRank() { return this.constell() >= 5 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 3 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Chongyun(),
        {
            "vm": {
                "parent_id": "chongyun",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "useToCryoEffect": true,
                "useCryoResisDown": true,
                "useC6Effect": true,
                "reactionProb": 0
            },
            "expected": {
                "normal_total": 1632.371805,
                "normal_total_C1": 2055.266055,
                "skill_dmg": 823.2341399999999,
                "skill_dmg_finish": 823.2341399999999,
                "burst_dmg": 3138.4391939999996
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Chongyun().newViewModel()
    ));
});