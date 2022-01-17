import * as Base from './base.mjs';
import * as Widget from '../widget.mjs';
import * as Calc from '../dmg-calc.mjs';
import * as Utils from '../utils.mjs';


export class PyroCharacterViewModel extends Base.CharacterViewModel
{
    constructor(parent)
    {
        super(parent);
        this.reactionType = ko.observable("isVaporize");
        this.reactionProb = ko.observable(0);
    }


    viewHTMLList(target){
        let dst = super.viewHTMLList(target);

        dst.push(
            Widget.buildViewHTML(target, "蒸発/溶解",
                Widget.selectViewHTML("reactionType", [
                    {label: "蒸発", value: "isVaporize"},
                    {label: "溶解", value: "isMelt"}
                ], "元素反応")
                +
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
        let type = this.reactionType();
        if(prob == 0)
            return calc;

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            reactionProb = prob;
            reactionType = type;

            calculate(dmgScale, attackProps) {
                if(attackProps.isPyro || false) {
                    let newProps = Object.assign({}, attackProps);
        
                    // 元素反応なし
                    let dmg1 = super.calculate(dmgScale, newProps);

                    // 元素反応あり
                    newProps[this.reactionType] = true;
                    let dmg2 = super.calculate(dmgScale, newProps);

                    let txtReact = (this.reactionType == "isVaporize") ? "蒸発" : "溶解";
        
                    return Calc.Attacks.expect([1 - this.reactionProb, this.reactionProb], [dmg1, dmg2], [`${txtReact}反応なし`, `${txtReact}反応あり`]);
                } else {
                    // 攻撃が炎ではないので，元素反応なし
                    return super.calculate(dmgScale, attackProps);
                }
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    toJS() {
        let obj = super.toJS();
        obj.reactionType = this.reactionType();
        obj.reactionProb = this.reactionProb();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.reactionType(obj.reactionType || "isVaporize");
        this.reactionProb(obj.reactionProb || 0);
    }
}


// ディルック
export class Diluc extends Base.CharacterData
{
    constructor()
    {
        super(
            "diluc",
            "ディルック",
            5,
            "Pyro",
            "Claymore",
            335,            /* bAtk */
            784,            /* bDef */
            12981,          /* bHP */
            "baseCrtRate",      /* bBonusType */
            0.192           /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new DilucViewModel(this);
    }


    static normalTalentTable = [
    //  0:1段,     1:2段,   2:3段,     3:4段,   4:重撃連続, 5:重撃終了,  6:落下,  7:低空, 8:高空 
        [89.7/100, 87.6/100, 98.8/100, 134/100, 68.8/100, 125/100, 89.5/100, 179/100, 224/100],
        [97/100, 94.8/100, 107/100, 145/100, 74.4/100, 135/100, 96.8/100, 194/100, 242/100],
        [104/100, 102/100, 115/100, 156/100, 80/100, 145/100, 104/100, 208/100, 260/100],
        [115/100, 112/100, 126/100, 171/100, 88/100, 160/100, 114/100, 229/100, 286/100],
        [122/100, 119/100, 134/100, 182/100, 93.6/100, 170/100, 122/100, 243/100, 304/100],
        [130/100, 127/100, 144/100, 195/100, 100/100, 181/100, 130/100, 260/100, 325/100],
        [142/100, 139/100, 156/100, 212/100, 109/100, 197/100, 142/100, 283/100, 354/100],
        [153/100, 150/100, 169/100, 229/100, 118/100, 213/100, 153/100, 306/100, 382/100],
        [165/100, 161/100, 182/100, 246/100, 126/100, 229/100, 164.4/100, 329/100, 411/100],
        [177/100, 173/100, 195/100, 265/100, 136/100, 247/100, 176.9/100, 354/100, 442/100],
        [192/100, 187/100, 211/100, 286/100, 147/100, 266/100, 189.4/100, 379/100, 473/100],
    ];


    static skillTalentTable = [
    //  0:1段,  1:2段,  2:3段
        [0.944, 0.976, 1.29],
        [1.01, 1.05, 1.38],
        [1.09, 1.12, 1.48],
        [1.18, 1.22, 1.61],
        [1.25, 1.29, 1.71],
        [1.32, 1.37, 1.80],
        [1.42, 1.46, 1.93],
        [1.51, 1.56, 2.06],
        [1.60, 1.66, 2.19],
        [1.70, 1.76, 2.32],
        [1.79, 1.85, 2.45],
        [1.89, 1.95, 2.58],
        [2.01, 2.07, 2.74],
    ];


    static burstTalentTable = [
    //  0:斬撃, 1:継続, 2:最後の爆発
        [2.04, 0.600, 2.04],
        [2.19, 0.645, 2.19],
        [2.35, 0.690, 2.35],
        [2.55, 0.750, 2.55],
        [2.70, 0.795, 2.70],
        [2.86, 0.84, 2.86],
        [3.06, 0.90, 3.06],
        [3.26, 0.96, 3.26],
        [3.47, 1.02, 3.47],
        [3.67, 1.08, 3.67],
        [3.88, 1.14, 3.88],
        [4.08, 1.20, 4.08],
        [4.34, 1.28, 4.34],
        [4.59, 1.35, 4.59],
    ];


    static presetAttacks = [
        {
            id: "normal_total",
            label: "通常4段累計",
            dmgScale(vm){ return Diluc.normalTalentTable[vm.normalRank()-1].slice(0, 4); },
            attackProps: { isNormal: true, isPhysical: true }
        },
        {
            id: "normal_total_pyro",
            label: "通常4段累計（元素爆発後）",
            dmgScale(vm){ return Diluc.normalTalentTable[vm.normalRank()-1].slice(0, 4); },
            attackProps: { isNormal: true, isPyro: true }
        },
        {
            id: "skill_total",
            label: "元素スキル3段累計",
            list: [
                {
                    dmgScale(vm){ return Diluc.skillTalentTable[vm.skillRank()-1][0]; },
                    attackProps: { isSkill: true, isPyro: true }
                },
                {
                    dmgScale(vm){ return Diluc.skillTalentTable[vm.skillRank()-1].slice(1, 3); },
                    attackProps: { isSkill: true, isPyro: true, isDilucSkill2nd3rd: true }
                }
            ]
        },
        {
            id: "skill_normal_combination",
            label: "(スキル+通常x2)x3",
            list: [
                {
                    dmgScale(vm){ return Diluc.skillTalentTable[vm.skillRank()-1][0]; },
                    attackProps: { isSkill: true, isPyro: true }
                },
                {
                    dmgScale(vm){ return Diluc.skillTalentTable[vm.skillRank()-1].slice(1, 3); },
                    attackProps: { isSkill: true, isPyro: true, isDilucSkill2nd3rd: true }
                },
                {
                    dmgScale(vm){
                        return [
                            Diluc.normalTalentTable[vm.normalRank()-1].slice(0, 4).flat(10),
                            Diluc.normalTalentTable[vm.normalRank()-1].slice(0, 2).flat(10)]; },
                    attackProps: { isNormal: true, isPhysical: true }
                }
            ]
        },
        {
            id: "skill_pyro_normal_combination",
            label: "(スキル+炎通常x2)x3",
            list: [
                {
                    dmgScale(vm){ return Diluc.skillTalentTable[vm.skillRank()-1][0]; },
                    attackProps: { isSkill: true, isPyro: true }
                },
                {
                    dmgScale(vm){ return Diluc.skillTalentTable[vm.skillRank()-1].slice(1, 3); },
                    attackProps: { isSkill: true, isPyro: true, isDilucSkill2nd3rd: true }
                },
                {
                    dmgScale(vm){
                        return [
                            Diluc.normalTalentTable[vm.normalRank()-1].slice(0, 4).flat(10),
                            Diluc.normalTalentTable[vm.normalRank()-1].slice(0, 2).flat(10)]; },
                    attackProps: { isNormal: true, isPyro: true }
                }
            ]
        },
        {
            id: "burst_total",
            label: "斬撃+飛翔中3Hit+爆発",
            dmgScale(vm){
                let list = Diluc.burstTalentTable[vm.burstRank()-1];
                return [list[0], new Array(3).fill(list[1]), list[2]];
            },
            attackProps: { isBurst: true, isPyro: true }
        },
    ];
}


// ディルック
export class DilucViewModel extends Base.CharacterViewModel
{
    // TODO: 6凸効果がすべての通常攻撃に乗る

    constructor(parent)
    {
        super(parent);
        this.useDmgUpEffect = ko.observable(true);  // 元素爆発後のダメージアップ効果
        this.useC1Effect = ko.observable(true);     // ダメージ+15%
        this.stacksOfC2Effect = ko.observable(3);   // 攻撃力+10%/スタック
        this.useC4Effect = ko.observable(true);     // 元素スキルダメージ+40%
        this.useC6Effect = ko.observable(true);     // 通常攻撃ダメージ+30%
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.useDmgUpEffect())
            calc.basePyroDmg.value += 0.2;

        if(this.useC1Effect() && this.constell() >= 1)
            calc.baseAllDmg.value += 0.15;
        
        if(this.constell() >= 2)
            calc.rateAtk.value += Number(this.stacksOfC2Effect()) * 0.1;
        
        if(this.useC4Effect() && this.constell() >= 4) {
            let ctx = Calc.VGData.context;
            calc = calc.applyExtension(Klass => class extends Klass {
                skillDmgBuff(attackProps) {
                    if(attackProps.isDilucSkill2nd3rd)
                        return super.skillDmgBuff(attackProps).add(Calc.VGData.constant(0.4).as(ctx));
                    else
                        return super.skillDmgBuff(attackProps);
                }
            });
        }
            // calc.baseSkillDmg.value += 0.4;
        
        if(this.useC6Effect() && this.constell() >= 6)
            calc.baseNormalDmg.value += 0.3;

        return calc;
    }


    viewHTMLList(target)
    {
        let list = super.viewHTMLList(target);


        if(this.constell() >= 4) {
            list.push(
                Widget.buildViewHTML(target, "元素スキル「逆焔の刃」関連効果",
                    Widget.checkBoxViewHTML("useC4Effect", "元素スキルの2/3段目のダメージ+40%（4凸）")
                    +
                    (this.constell() < 6 ? "" :
                        "<hr>"
                        +
                        Widget.checkBoxViewHTML("useC6Effect", "通常攻撃ダメージ+30%（6凸）")
                    )
            ));
        }


        list.push(
            Widget.buildViewHTML(target, "元素爆発「黎明」関連効果",
                Widget.checkBoxViewHTML("useDmgUpEffect", "炎元素ダメージ+20%（爆発後）")
        ));


        if(this.constell() >= 1) {
            list.push(
                Widget.buildViewHTML(target, "その他効果",
                    Widget.checkBoxViewHTML("useC1Effect", "ダメージ+15%（1凸，HP50%以上の敵）")
                    +
                    (this.constell() < 2 ? "" :
                        "<hr>"
                        +
                        Widget.selectViewHTML("stacksOfC2Effect",
                            new Array(4).fill(0).map((e, i) => { return {value: i, label: `攻撃力+${textPercentageFix(0.1 * i, 0)}`}; }),
                            "2凸効果")
                    )
            ));
        }

    
        return list;
    }


    toJS() {
        let obj = super.toJS();
        obj.useDmgUpEffect = this.useDmgUpEffect();
        obj.useC1Effect = this.useC1Effect();
        obj.stacksOfC2Effect = this.stacksOfC2Effect();
        obj.useC4Effect = this.useC4Effect();
        obj.useC6Effect = this.useC6Effect();
        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.useDmgUpEffect(obj.useDmgUpEffect);
        this.useC1Effect(obj.useC1Effect);
        this.stacksOfC2Effect(obj.stacksOfC2Effect);
        this.useC4Effect(obj.useC4Effect);
        this.useC6Effect(obj.useC6Effect);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Diluc(),
        {
            "vm": {
                "parent_id": "diluc",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "useDmgUpEffect": true,
                "useC1Effect": true,
                "stacksOfC2Effect": 3,
                "useC4Effect": true,
                "useC6Effect": true
            },
            "expected": {
                "normal_total": 4006.875895425,
                "normal_total_pyro": 4559.548432725001,
                "skill_total": 3260.8779181874997,
                "skill_normal_combination": 9000.1696516875,
                "skill_pyro_normal_combination": 9791.7960976875,
                "burst_total": 4947.665287500001
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Diluc().newViewModel()
    ));
});


// クレー
export class Klee extends Base.CharacterData
{
    constructor()
    {
        super(
            "klee",
            "クレー",
            5,
            "Pyro",
            "Catalyst",
            311,            /* bAtk */
            615,            /* bDef */
            10287,          /* bHP */
            "basePyroDmg",   /* bBonusType */
            0.288           /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new KleeViewModel(this);
    }


    static normalTalentTable = [
    //  0:1段,     1:2段      2:3段     3:重撃,   4:落下,   5:低空,   6:高空
        [72.2/100, 62.4/100, 89.9/100, 157/100, 56.8/100, 114/100, 142/100],
        [77.6/100, 67.1/100, 96.7/100, 169/100, 61.5/100, 123/100, 153/100],
        [83.0/100, 71.8/100, 103/100, 181/100, 66.1/100, 132/100, 165/100],
        [90.2/100, 78.0/100, 112/100, 197/100, 72.7/100, 145/100, 182/100],
        [95.6/100, 72.7/100, 119/100, 209/100, 77.3/100, 155/100, 193/100],
        [101/100, 87.4/100, 126/100, 220/100, 82.6/100, 165/100, 206/100],
        [108/100, 93.6/100, 135/100, 236/100, 89.9/100, 180/100, 224/100],
        [115/100, 100/100, 144/100, 252/100, 97.1/100, 194/100, 243/100],
        [123/100, 106/100, 153/100, 268/100, 104/100, 209/100, 261/100],
        [130/100, 112/100, 162/100, 283/100, 112/100, 225/100, 281/100],
        [137/100, 119/100, 171/100, 300/100, 120/100, 240/100, 300/100],
    ];


    static skillTalentTable = [
    // 　0:ボンボン爆弾, 1:トラップ
        [95.2/100, 32.8/100],
        [102/100, 35.3/100],
        [109/100, 37.7/100],
        [119/100, 41.0/100],
        [126/100, 43.5/100],
        [133/100, 45.9/100],
        [143/100, 49.2/100],
        [152/100, 52.5/100],
        [162/100, 55.8/100],
        [171/100, 59.0/100],
        [181/100, 62.3/100],
        [190/100, 65.6/100],
        [202/100, 70.0/100],
    ];

    static burstTalentTable = [
        0.426,
        0.458,
        0.490,
        0.533,
        0.565,
        0.597,
        0.640,
        0.682,
        0.725,
        0.768,
        0.810,
        0.853,
        0.906,
        0.960,
    ];


    static presetAttacks = [
        {
            id: "normal_total",
            label: "通常3段累計",
            dmgScale(vm){ return Klee.normalTalentTable[vm.normalRank()-1].slice(0, 3); },
            attackProps: { isNormal: true, isPyro: true }
        },
        {
            id: "charged",
            label: "重撃",
            dmgScale(vm){ return Klee.normalTalentTable[vm.normalRank()-1][3]; },
            attackProps: { isCharged: true, isPyro: true }
        },
        {
            id: "skill_total",
            label: "ボンボン爆弾3回+トラップ",
            dmgScale(vm){ return [...new Array(3).fill(Klee.skillTalentTable[vm.skillRank()-1][0]), Klee.skillTalentTable[vm.skillRank()-1][1]]; },
            attackProps: { isSkill: true, isPyro: true }
        },
        {
            id: "burst_total",
            label: "元素爆発19発",
            dmgScale(vm){ return new Array(19).fill(Klee.burstTalentTable[vm.burstRank()-1]); },
            attackProps: { isBurst: true, isPyro: true }
        },
    ];
}


// クレー
export class KleeViewModel extends PyroCharacterViewModel
{
    constructor(parent)
    {
        super(parent);
        this.useDmgUpTalent = ko.observable(true);  // こんこんプレゼント, 重撃ダメージ+50%
        this.useC2Effect = ko.observable(true);     // 2凸効果, 防御ダウン
        this.useC6Effect = ko.observable(true);     // 6凸効果，ドッカン花火後炎ダメ+10%
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.useDmgUpTalent()) {
            calc.baseChargedDmg.value += 0.5;
        }

        if(this.constell() >= 2 && this.useC2Effect()) {
            calc.baseEnemyRateDef.value -= 0.23;
        }

        if(this.constell() >= 6 && this.useC6Effect()) {
            calc.basePyroDmg.value += 0.1;
        }

        return calc;
    }


    viewHTMLList(target)
    {
        let ret = super.viewHTMLList(target);

        ret.push(
            Widget.buildViewHTML(target, "こんこんプレゼント",
                Widget.checkBoxViewHTML("useDmgUpTalent", "重撃ダメージ+50%"))
        );
        
        if(this.constell() >= 2) {
            ret.push(Widget.buildViewHTML(target, "弾丸の破片（2凸効果）",
                Widget.checkBoxViewHTML("useC2Effect", "敵の防御力-23%")));
        }

        if(this.constell() >= 6) {
            ret.push(Widget.buildViewHTML(target, "火力全開（6凸効果）",
                Widget.checkBoxViewHTML("useC6Effect", "炎ダメージ+10%")));
        }

        return ret;
    }


    presetAttacks()
    {
        let attacks = super.presetAttacks();
        
        if(this.constell() >= 1) {
            // ゴロゴロコンボ
            attacks.push(new Base.PresetAttackEvaluator(
                this,
                {
                    id: "chained_reactions",
                    label: "ゴロゴロコンボ（1凸効果）",
                    dmgScale(vm){ return Klee.burstTalentTable[vm.burstRank()-1] * 1.2; },
                    attackProps: { isPyro: true }
                }
            ));
        }

        if(this.constell() >= 4) {
            // 一触即発
            attacks.push(new Base.PresetAttackEvaluator(
                this,
                {
                    id: "sparkly_explosion",
                    label: "一触即発（4凸効果）",
                    dmgScale(vm){ return 5.55; },
                    attackProps: { isPyro: true, isBurst: true }
                }
            ));
        }

        return attacks;
    }

    toJS() {
        let obj = super.toJS();
        obj.useDmgUpTalent = this.useDmgUpTalent();
        obj.useC2Effect = this.useC2Effect();
        obj.useC6Effect = this.useC6Effect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);

        this.useDmgUpTalent(obj.useDmgUpTalent);
        this.useC2Effect(obj.useC2Effect);
        this.useC6Effect(obj.useC6Effect);
    }
}

runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Klee(),
        {
            "vm": {
                "parent_id": "klee",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "reactionType": "isVaporize",
                "reactionProb": 0,
                "useDmgUpTalent": true,
                "useC2Effect": true,
                "useC6Effect": true
            },
            "expected": {
                "normal_total": 1480.987648474576,
                "charged": 1413.3033599999997,
                "skill_total": 2100.5212249830506,
                "burst_total": 5340.472475847453,
                "chained_reactions": 337.2929984745761,
                "sparkly_explosion": 2151.6967144067785
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Klee().newViewModel()
    ));
});


// 胡桃
export class HuTao extends Base.CharacterData
{
    constructor()
    {
        super(
            "hu_tao",
            "胡桃",
            5,
            "Pyro",
            "Polearm",
            106,            /* bAtk */
            876,            /* bDef */
            15552,          /* bHP */
            "baseCrtDmg",   /* bBonusType */
            0.384           /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new HuTaoViewModel(this);
    }

    static normalTalentTable = [
    //  0:1段目,   1:2段目,   2:3段目,   3:4段目,   4:5段目,           5:6段目,   6:重撃,     7:落下,    8:低空,  9:高空
        [46.9/100, 48.3/100, 61.1/100, 65.6/100, [33.3/100, 35.2/100], 86.0/100, 136.0/100, 65.4/100, 131/100, 163/100],
        [50.1/100, 51.5/100, 65.2/100, 70.1/100, [35.5/100, 37.6/100], 91.8/100, 145.2/100, 69.9/100, 140/100, 175/100],
        [53.3/100, 54.8/100, 69.4/100, 74.6/100, [37.8/100, 40.0/100], 97.7/100, 154.5/100, 74.3/100, 149/100, 186/100],
        [57.5/100, 59.2/100, 74.9/100, 80.6/100, [40.8/100, 43.2/100], 105.5/100, 166.9/100, 80.3/100, 161/100, 201/100],
        [60.7/100, 62.5/100, 79.1/100, 85.0/100, [43.1/100, 45.6/100], 111.4/100, 176.1/100, 84.7/100, 169/100, 212/100],
        [64.5/100, 66.3/100, 83.9/100, 90.3/100, [45.8/100, 48.4/100], 118.2/100, 186.9/100, 90.0/100, 180/100, 225/100],
        [69.3/100, 71.3/100, 90.2/100, 97.0/100, [49.2/100, 52.0/100], 127.0/100, 200.9/100, 96.6/100, 193/100, 241/100],
        [74.1/100, 76.2/100, 96.4/100, 103.7/100, [52.6/100, 55.6/100], 135.8/100, 214.8/100, 103.3/100, 207/100, 258/100],
        [78.9/100, 81.2/100, 102.7/100, 110.4/100, [56.0/100, 59.2/100], 144.6/100, 228.7/100, 110.0/100, 220/100, 275/100],
        [83.7/100, 86.1/100, 108.9/100, 117.1/100, [59.4/100, 62.8/100], 153.4/100, 242.6/100, 116.7/100, 233/100, 292/100],
        [88.4/100, 91.0/100, 115.2/100, 123.8/100, [62.8/100, 66.4/100], 162.1/100, 256.5/100, 123.4/100, 247/100, 308/100],
    ];

    static skillTalentTable = [
    // 0:攻撃力上昇, 1:血梅香ダメージ
        [3.84/100, 64/100],
        [4.07/100, 69/100],
        [4.30/100, 74/100],
        [4.60/100, 80/100],
        [4.83/100, 85/100],
        [5.06/100, 90/100],
        [5.36/100, 96/100],
        [5.66/100, 102/100],
        [5.96/100, 109/100],
        [6.26/100, 115/100],
        [6.56/100, 122/100],
        [6.85/100, 128/100],
        [7.15/100, 136/100],
    ];

    static burstTalentTable = [
    //  0:ダメージ, 1:低HPダメージ, 2:回復, 3:低HP回復
        [303/100, 379/100, 6.26/100, 8.35/100],
        [321/100, 402/100, 6.64/100, 8.85/100],
        [340/100, 424/100, 7.01/100, 9.35/100],
        [363/100, 454/100, 7.50/100, 10.00/100],
        [381/100, 477/100, 7.88/100, 10.50/100],
        [400/100, 499/100, 8.25/100, 11.00/100],
        [423/100, 529/100, 8.74/100, 11.65/100],
        [447/100, 558/100, 9.23/100, 12.30/100],
        [470/100, 588/100, 9.71/100, 12.95/100],
        [494/100, 617/100, 10.20/100, 13.60/100],
        [518/100, 647/100, 10.69/100, 14.25/100],
        [541/100, 676/100, 11.18/100, 14.90/100],
        [565/100, 706/100, 11.66/100, 15.55/100],
    ];


    static presetAttacks = [
        {
            id: "charged",
            label: "重撃",
            dmgScale(vm){ return HuTao.normalTalentTable[vm.normalRank()-1][6]; },
            attackProps: { isCharged: true, isPhysical: true }
        },
        {
            id: "charged_skill",
            label: "スキル中重撃",
            dmgScale(vm){ return HuTao.normalTalentTable[vm.normalRank()-1][6]; },
            attackProps: { isPyro: true, isCharged: true, isNowHuTaoSkill: true }
        },
        {
            id: "burst",
            label: "爆発（低HP）",
            dmgScale(vm){ return HuTao.burstTalentTable[vm.burstRank()-1][1]; },
            attackProps: { isPyro: true, isBurst: true }
        },
        {
            id: "burst_skill",
            label: "スキル中爆発（低HP）",
            dmgScale(vm){ return HuTao.burstTalentTable[vm.burstRank()-1][1]; },
            attackProps: { isPyro: true, isBurst: true, isNowHuTaoSkill: true }
        }
    ];
}

// 胡桃
export class HuTaoViewModel extends PyroCharacterViewModel
{
    constructor(ch)
    {
        super(ch);
        this.lowHP = ko.observable(true);
        this.useC6Effect = ko.observable(false);
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.lowHP()) {
            calc.basePyroDmg.value += 0.33;
        }

        if(this.constell() >= 6 && this.useC6Effect()) {
            calc.baseCrtRate.value += 1;
        }

        let skillRank_ = this.skillRank();

        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            #hutaoSkillScale = HuTao.skillTalentTable[skillRank_-1][0];

            atk(attackProps) {
                let dst = undefined;
                if(attackProps.isNowHuTaoSkill || false)
                    dst = super.atk(attackProps).add(this.hp(attackProps).mul(this.#hutaoSkillScale).min_number(4 * this.baseAtk.value));
                else
                    dst = super.atk(attackProps);

                return dst;
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    viewHTMLList(target)
    {
        let ret = super.viewHTMLList(target);

        ret.push(
            Widget.buildViewHTML(target, "血のかまど", Widget.checkBoxViewHTML("lowHP", "+33%炎ダメージ"))
        );
        
        if(this.constell() >= 6) {
            ret.push(Widget.buildViewHTML(target, "冥蝶の抱擁（6凸効果）", Widget.checkBoxViewHTML("useC6Effect", "会心率+100%")));
        }

        return ret;
    }


    toJS() {
        let obj = super.toJS();
        obj.lowHP = this.lowHP();
        obj.useC6Effect = this.useC6Effect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);

        this.lowHP(obj.lowHP);
        this.useC6Effect(obj.useC6Effect);
    }
}

runUnittest(function(){
    let vm1 = (new HuTao()).newViewModel();
    vm1.skillRank(1);
    vm1.lowHP(false);
    vm1.useC6Effect(true);
    vm1.constell(6);

    let vm2 = (new HuTao()).newViewModel();
    vm2.fromJS(vm1.toJS());

    console.assert(vm2.skillRank() == 1);
    console.assert(vm2.lowHP() == false);
    console.assert(vm2.useC6Effect() == true);
    console.assert(vm2.constell() == 6);
});


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new HuTao(),
        {
            "vm": {
                "parent_id": "hu_tao",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "reactionType": "isVaporize",
                "reactionProb": 0,
                "lowHP": true,
                "useC6Effect": false
            },
            "expected": {
                "charged": 356.67827874,
                "charged_skill": 1911.3245908698614,
                "burst": 1219.6619200080002,
                "burst_skill": 4914.118318458585
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new HuTao().newViewModel()
    ));
});


// 宵宮
export class Yoimiya extends Base.CharacterData
{
    constructor()
    {
        super(
            "yoimiya",
            "宵宮",
            5,
            "Pyro",
            "Bow",
            323,            /* bAtk */
            615,            /* bDef */
            10164,          /* bHP */
            "baseCrtRate",  /* bBonusType */
            0.192           /* bBonusValue */
        );
    }


    newViewModel() {
        return new YoimiyaViewModel(this);
    }


    static normalTalentTable = [
        // 0:1段,    1:2段,     2:3段,    3:4段,      4:5段,     5:狙撃,   6:フル,   7:焔硝, 8:落下期間, 9:低空, 10:高空
        [35.6*2/100, 68.4/100, 88.9/100, 46.4*2/100, 105.9/100, 43.9/100, 124/100, 16/100, 56.8/100, 114/100, 142/100],
        [38.1*2/100, 73.0/100, 94.9/100, 49.6*2/100, 113.1/100, 47.4/100, 133/100, 18/100, 61.5/100, 123/100, 153/100],
        [40.5*2/100, 77.7/100, 101.0/100, 52.8*2/100, 120.3/100, 51.0/100, 143/100, 19/100, 66.1/100, 132/100, 165/100],
        [43.7*2/100, 83.9/100, 109.1/100, 57.0*2/100, 129.9/100, 56.1/100, 155/100, 21/100, 72.7/100, 145/100, 182/100],
        [46.2*2/100, 88.6/100, 115.2/100, 60.1*2/100, 137.1/100, 59.7/100, 164/100, 22/100, 77.3/100, 155/100, 193/100],
        [49.0*2/100, 94.0/100, 122.2/100, 63.8*2/100, 145.6/100, 63.8/100, 174/100, 23/100, 82.6/100, 165/100, 206/100],
        [52.7*2/100, 101.0/100, 131.3/100, 68.6*2/100, 156.4/100, 69.4/100, 186/100, 25/100, 89.9/100, 180/100, 224/100],
        [56.3*2/100, 108.0/100, 140.4/100, 73.3*2/100, 167.2/100, 75.0/100, 198/100, 26/100, 97.1/100, 194/100, 243/100],
        [59.9*2/100, 115.0/100, 149.5/100, 78.1*2/100, 178.0/100, 80.6/100, 211/100, 28/100, 104.4/100, 209/100, 261/100],
        [63.6*2/100, 122.0/100, 158.6/100, 82.8*2/100, 188.9/100, 86.7/100, 223/100, 30/100, 112.3/100, 225/100, 281/100],
        [67.2*2/100, 129.0/100, 167.7/100, 87.6*2/100, 199.7/100, 92.8/100, 236/100, 31/100, 120.3/100, 240/100, 300/100],
    ];

    static skillTalentTable = [
        137.9/100,
        140.2/100,
        142.4/100,
        145.4/100,
        147.7/100,
        149.9/100,
        152.9/100,
        155.8/100,
        158.8/100,
        161.7/100,
        164.7/100,
        167.6/100,
        170.6/100,
    ];

    static burstTalentTable = [
        // 0:ダメージ, 1:追加爆発ダメージ
        [127/100, 122/100],
        [137/100, 131/100],
        [146/100, 140/100],
        [159/100, 153/100],
        [169/100, 162/100],
        [178/100, 171/100],
        [191/100, 183/100],
        [204/100, 195/100],
        [216/100, 207/100],
        [229/100, 220/100],
        [242/100, 232/100],
        [254/100, 244/100],
        [270/100, 259/100],
    ];


    static presetAttacks = [
        {
            id: "normal_1",
            label: "通常1段目",
            dmgScale(vm){ return Yoimiya.normalTalentTable[vm.normalRank()-1][0]; },
            attackProps: { isPhysical: true, isNormal: true, }
        },
        {
            id: "full_charged",
            label: "フルチャージ狙い撃ち",
            dmgScale(vm){ return Yoimiya.normalTalentTable[vm.normalRank()-1][6]; },
            attackProps: { isPyro: true, isCharged: true, }
        },
        {
            id: "full_charged_additional",
            label: "焔硝の矢3本",
            dmgScale(vm){ return Yoimiya.normalTalentTable[vm.normalRank()-1][7]*3; },
            attackProps: { isPyro: true, isCharged: true, }
        },
        {
            id: "normal_1_skill",
            label: "スキル中通常1段目",
            dmgScale(vm){ return Yoimiya.normalTalentTable[vm.normalRank()-1][0] * Yoimiya.skillTalentTable[vm.skillRank()-1]; },
            attackProps: { isPyro: true, isNormal: true, isNowYoimiyaSkill: true }
        },
        {
            id: "burst",
            label: "元素爆発",
            dmgScale(vm){ return Yoimiya.burstTalentTable[vm.burstRank()-1][0]; },
            attackProps: { isPyro: true, isBurst: true }
        },
        {
            id: "burst_add",
            label: "元素爆発中の追加爆発",
            dmgScale(vm){ return Yoimiya.burstTalentTable[vm.burstRank()-1][1]; },
            attackProps: { isPyro: true, isBurst: true }
        },
    ];
}


// 宵宮
export class YoimiyaViewModel extends PyroCharacterViewModel
{
    // 天賦「炎昼の風物詩」はサポート能力のため無視

    constructor(parent)
    {
        super(parent);
        this.skillStacks = ko.observable(10);   // 天賦「袖火百景図」
        this.useC1Effect = ko.observable(true);   // 1凸効果（攻撃力+20%）の有無
        this.useC2Effect = ko.observable(true);   // 2凸効果（炎元素ダメージ+25%）の有無
        this.useC6Effect = ko.observable(true);   // 6凸効果（追撃）
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        calc.basePyroDmg.value += Number(this.skillStacks()) * 0.02;

        if(this.constell() >= 1 && this.useC1Effect()) {
            calc.rateAtk.value += 0.2;
        }

        if(this.constell() >= 2 && this.useC2Effect()) {
            calc.basePyroDmg.value += 0.25;
        }

        if(this.constell() >= 6 && this.useC6Effect()) {
            let data = this.toJS();
            let CalcType = Object.getPrototypeOf(calc).constructor;
            let NewCalc = class extends CalcType {
                yoimiyaData = data;

                chainedAttackDmg(parentAttackProps) {
                    let dmg = super.chainedAttackDmg(parentAttackProps);

                    if(hasAllPropertiesWithSameValue(parentAttackProps, {isNowYoimiyaSkill: true, isNormal: true})) {
                        let newProps = Calc.deleteAllElementFromAttackProps({isChainable: false, ...parentAttackProps});
                        dmg = dmg.add(this.calculate(0.6, newProps).total().mul(0.5));
                    }

                    return dmg;
                }
            };

            calc = Object.assign(new NewCalc(), calc);
        }

        return calc;
    }


    toJS() {
        let obj = super.toJS();
        obj.skillStacks = this.skillStacks();
        obj.useC1Effect = this.useC1Effect();
        obj.useC2Effect = this.useC2Effect();
        obj.useC6Effect = this.useC6Effect();

        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);

        this.skillStacks(obj.skillStacks);
        this.useC1Effect(obj.useC1Effect);
        this.useC2Effect(obj.useC2Effect);
        this.useC6Effect(obj.useC6Effect);
    }


    viewHTMLList(target)
    {
        let ret = super.viewHTMLList(target);

        ret.push(
            Widget.buildViewHTML(target, "袖火百景図",
                Widget.selectViewHTML("skillStacks", [
                    {label: '炎元素ダメージ+0%', value: 0},
                    {label: '炎元素ダメージ+2%', value: 1},
                    {label: '炎元素ダメージ+4%', value: 2},
                    {label: '炎元素ダメージ+6%', value: 3},
                    {label: '炎元素ダメージ+8%', value: 4},
                    {label: '炎元素ダメージ+10%', value: 5},
                    {label: '炎元素ダメージ+12%', value: 6},
                    {label: '炎元素ダメージ+14%', value: 7},
                    {label: '炎元素ダメージ+16%', value: 8},
                    {label: '炎元素ダメージ+18%', value: 9},
                    {label: '炎元素ダメージ+20%', value: 10},])
            )
        );

        if(this.constell() >= 1) {
            ret.push(
                Widget.buildViewHTML(target, "紅玉の琉金（1凸）", Widget.checkBoxViewHTML("useC1Effect", "+20%攻撃力"))
            );
        }

        if(this.constell() >= 2) {
            ret.push(
                Widget.buildViewHTML(target, "万燈の火（2凸）", Widget.checkBoxViewHTML("useC2Effect", "+25%炎元素ダメージ"))
            );
        }
        
        if(this.constell() >= 6) {
            ret.push(
                Widget.buildViewHTML(target, "長野原龍勢流星群（6凸）", Widget.checkBoxViewHTML("useC6Effect", "スキル中の通常攻撃に50%の確率で60%の追撃ダメージを加算"))
            );
        }

        return ret;
    }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Yoimiya(),
        {
            "vm": {
                "parent_id": "yoimiya",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "skillStacks": 10,
                "useC1Effect": true,
                "useC2Effect": true,
                "useC6Effect": true
            },
            "expected": {
                "normal_1": 396.19515636,
                "full_charged": 1011.8189322899999,
                "full_charged_additional": 402.80943276000005,
                "normal_1_skill": 1011.4931130345361,
                "burst": 1035.7956842400001,
                "burst_add": 992.63753073
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Yoimiya().newViewModel()
    ));
});


// 香菱
export class Xiangling extends Base.CharacterData
{
    constructor()
    {
        super(
            "xiangling",
            "香菱",
            4,
            "Pyro",
            "Polearm",
            225,            /* bAtk */
            669,            /* bDef */
            10875,          /* bHP */
            "baseMastery",  /* bBonusType */
            96              /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new XianglingViewModel(this);
    }


    static normalTalentTable = [
    //  0:1段目,     1:2段目,  2:3段目,              3:4段目,               4:5段目,  5:重撃,   6:落下,   7:低空,  8:高空
        [42.1/100, 42.1/100, Array(2).fill(0.261), Array(4).fill(0.141), 71.0/100, 122/100, 63.9/100, 128/100, 160/100],
        [45.5/100, 45.6/100, Array(2).fill(0.282), Array(4).fill(0.153), 76.8/100, 132/100, 69.1/100, 138/100, 173/100],
        [48.9/100, 49.0/100, Array(2).fill(0.303), Array(4).fill(0.164), 82.6/100, 142/100, 74.3/100, 149/100, 186/100],
        [53.8/100, 53.9/100, Array(2).fill(0.333), Array(4).fill(0.180), 90.9/100, 156/100, 81.8/100, 164/100, 204/100],
        [57.2/100, 57.3/100, Array(2).fill(0.355), Array(4).fill(0.192), 96.6/100, 166/100, 87.0/100, 174/100, 217/100],
        [61.1/100, 61.3/100, Array(2).fill(0.379), Array(4).fill(0.205), 103/100, 177/100, 92.9/100, 186/100, 232/100],
        [66.5/100, 66.6/100, Array(2).fill(0.412), Array(4).fill(0.223), 112/100, 192/100, 101.1/100, 202/100, 253/100],
        [71.9/100, 72.0/100, Array(2).fill(0.445), Array(4).fill(0.241), 121/100, 208/100, 109/100, 219/100, 273/100],
        [77.3/100, 77.4/100, Array(2).fill(0.479), Array(4).fill(0.259), 131/100, 224/100, 117/100, 235/100, 293/100],
        [83.1/100, 83.3/100, Array(2).fill(0.515), Array(4).fill(0.279), 140/100, 241/100, 126/100, 253/100, 316/100],
        [89.9/100, 90.0/100, Array(2).fill(0.557), Array(4).fill(0.301), 152/100, 260/100, 135/100, 271/100, 338/100],
    ];


    static skillTalentTable = [
        1.11,
        1.20,
        1.28,
        1.39,
        1.47,
        1.56,
        1.67,
        1.78,
        1.89,
        2.00,
        2.11,
        2.23,
        2.36,
    ];


    static burstTalentTable = [
    // 0:1段目    1:2段目   2:3段目, 3:継続
        [72.0/100, 88/100, 1.10, 1.12],
        [77.4/100, 95/100, 1.18, 1.20],
        [82.8/100, 101/100, 1.26, 1.29],
        [90.0/100, 110/100, 1.37, 1.40],
        [95.4/100, 117/100, 1.45, 1.48],
        [101/100, 123/100, 1.53, 1.57],
        [108/100, 132/100, 1.64, 1.68],
        [115/100, 141/100, 1.75, 1.79],
        [122/100, 150/100, 1.86, 1.90],
        [130/100, 158/100, 1.97, 2.02],
        [137/100, 167/100, 2.08, 2.13],
        [144/100, 176/100, 2.19, 2.24],
        [153/100, 187/100, 2.33, 2.38],
    ];


    static presetAttacks = [
        {
            id: "normal_total",
            label: "通常1～5段累計",
            dmgScale(vm){ return Xiangling.normalTalentTable[vm.normalRank()-1].slice(0, 5).flat(10); },
            attackProps: { isPhysical: true, isNormal: true, }
        },
        {
            id: "charged",
            label: "重撃",
            dmgScale(vm){ return Xiangling.normalTalentTable[vm.normalRank()-1][5]; },
            attackProps: { isPhysical: true, isCharged: true, }
        },
        {
            id: "skill",
            label: "グゥオパァー",
            dmgScale(vm){ return Xiangling.skillTalentTable[vm.skillRank()-1]; },
            attackProps: { isPyro: true, isSkill: true, }
        },
        {
            id: "burst_first",
            label: "旋火輪発動時の振り回し1～3段累計",
            dmgScale(vm){ return Xiangling.burstTalentTable[vm.burstRank()-1].slice(0, 3); },
            attackProps: { isPyro: true, isBurst: true, isXianglingBurst: true }
        },
        {
            id: "burst_cont",
            label: "旋火輪継続中ダメージ",
            dmgScale(vm){ return Xiangling.burstTalentTable[vm.burstRank()-1][3]; },
            attackProps: { isPyro: true, isBurst: true, isXianglingBurst: true }
        },
    ];
}


// 香菱
export class XianglingViewModel extends PyroCharacterViewModel
{
    // 2凸効果の爆縮ダメージは未実装

    constructor(parent)
    {
        super(parent);
        this.useAtkIncEffect = ko.observable(true);     // 唐辛子を拾うと攻撃力+10%
        this.useC1Effect = ko.observable(true);         // グゥオパァーの攻撃で炎耐性-15%
        this.useC6Effect = ko.observable(true);         // 旋火輪発動後に炎ダメージが15％上昇（ただし， 旋火輪には乗らない）
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.useAtkIncEffect()) {
            calc.rateAtk.value += 0.1;
        }

        if(this.useC1Effect() && this.constell() >= 1) {
            calc.basePyroResis.value -= 0.15;
        }

        if(this.useC6Effect() && this.constell() >= 6) {
            let CalcType = Object.getPrototypeOf(calc).constructor;
            let NewCalc = class extends CalcType {
                pyroDmgBuff(attackProps) {
                    if(attackProps.isXianglingBurst || false)
                        return super.pyroDmgBuff(attackProps);
                    else
                        return super.pyroDmgBuff(attackProps).add(0.15);
                }
            };
    
            calc = Object.assign(new NewCalc(), calc);
        }

        return calc;
    }


    viewHTMLList(target)
    {
        let ret = super.viewHTMLList(target);

        ret.push(Widget.buildViewHTML(target, "激辛唐辛子",
            Widget.checkBoxViewHTML("useAtkIncEffect", "攻撃力+10%")
        ));


        if(this.constell() >= 1) {
            ret.push(Widget.buildViewHTML(target, "外カリ中フワ",
                Widget.checkBoxViewHTML("useC1Effect", "敵の炎耐性-15%")
            ));
        }

        if(this.constell() >= 6) {
            ret.push(Widget.buildViewHTML(target, "竜巻旋火輪",
                Widget.checkBoxViewHTML("useC6Effect", "炎ダメージ+15%（旋火輪は適用外）")
            ));
        }

        return ret;
    }


    toJS() {
        let obj = super.toJS();
        obj.useAtkIncEffect = this.useAtkIncEffect();
        obj.useC1Effect = this.useC1Effect();
        obj.useC6Effect = this.useC6Effect();
        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.useAtkIncEffect(obj.useAtkIncEffect);
        this.useC1Effect(obj.useC1Effect);
        this.useC6Effect(obj.useC6Effect);
    }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Xiangling(),
        {
            "vm": {
                "parent_id": "xiangling",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "reactionType": "isVaporize",
                "reactionProb": 0,
                "useAtkIncEffect": true,
                "useC1Effect": true,
                "useC6Effect": true
            },
            "expected": {
                "normal_total": 1097.0688093750002,
                "charged": 506.58300000000014,
                "skill": 559.813791796875,
                "burst_first": 1179.639828125,
                "burst_cont": 489.370234375
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Xiangling().newViewModel()
    ));
});



// 煙緋
export class Yanfei extends Base.CharacterData
{
    constructor()
    {
        super(
            "yanfei",
            "煙緋",
            4,
            "Pyro",
            "Catalyst",
            240,            /* bAtk */
            587,            /* bDef */
            9352,           /* bHP */
            "basePyroDmg",  /* bBonusType */
            0.240           /* bBonusValue */
        );
    }


    newViewModel()
    {
        return new YanfeiViewModel(this);
    }


    static normalTalentTable = [
        // 0:1段目, 1:2段目, 2:3段目, 3: 重撃                                   4: 落下期間, 5:低空, 6:高空
        [58/100, 52/100, 76/100, [98/100, 116/100, 133/100, 150/100, 168/100], 56.8/100, 114/100, 142/100],     // lv. 1
        [63/100, 56/100, 82/100, [104/100, 122/100, 141/100, 159/100, 178/100], 61.5/100, 123/100, 153/100],
        [67/100, 60/100, 87/100, [110/100, 129/100, 149/100, 168/100, 188/100], 66.1/100, 132/100, 165/100],
        [73/100, 65/100, 95/100, [118/100, 138/100, 159/100, 180/100, 201/100], 72.7/100, 145/100, 182/100],
        [77/100, 69/100, 101/100, [124/100, 145/100, 167/100, 189/100, 211/100], 77.3/100, 155/100, 193/100],
        [82/100, 73/100, 106/100, [129/100, 152/100, 175/100, 198/100, 221/100], 82.6/100, 165/100, 206/100],
        [88/100, 78/100, 114/100, [137/100, 161/100, 185/100, 210/100, 234/100], 89.9/100, 180/100, 224/100],
        [93/100, 83/100, 122/100, [145/100, 170/100, 196/100, 221/100, 247/100], 97.1/100, 194/100, 243/100],
        [99/100, 89/100, 129/100, [152/100, 179/100, 206/100, 233/100, 260/100], 104.4/100, 209/100, 261/100],
        [105/100, 94/100, 137/100, [160/100, 188/100, 216/100, 245/100, 273/100], 112.3/100, 225/100, 281/100],
        [111/100, 99/100, 144/100, [168/100, 197/100, 227/100, 256/100, 286/100], 120.3/100, 240/100, 300/100], // lv. 11
    ];

    //                        lv. 1                                                                     lv. 13
    static skillTalentTable = [1.70, 1.82, 1.95, 2.12, 2.25, 2.37, 2.54, 2.71, 2.88, 3.05, 3.22, 3.39, 3.60];

    static burstTalentTable = [
    //  ダメージ, 重撃ダメバフ 
        [1.82, 0.33],
        [1.96, 0.35],
        [2.10, 0.37],
        [2.28, 0.40],
        [2.42, 0.42],
        [2.55, 0.44],
        [2.74, 0.47],
        [2.92, 0.49],
        [3.10, 0.52],
        [3.28, 0.54],
        [3.47, 0.57],
        [3.65, 0.60],
        [3.88, 0.62],
    ];


    static presetAttacks = [
        {
            id: "normal_1",
            label: "通常1段目",
            dmgScale(vm){ return Yanfei.normalTalentTable[vm.normalRank()-1][0] },
            attackProps: { isNormal: true, isPyro: true }
        },
        {
            id: "charged_without_additional",
            label: "重撃（追撃なし）",
            dmgScale(vm){ return Yanfei.normalTalentTable[vm.normalRank()-1][3][vm.getCountSeals()]; },
            attackProps: { isCharged: true, isPyro: true, isChainable: false }
        },
        {
            id: "charged",
            label: "重撃（追撃あり）",
            dmgScale(vm){ return Yanfei.normalTalentTable[vm.normalRank()-1][3][vm.getCountSeals()]; },
            attackProps: { isCharged: true, isPyro: true }
        },
        {
            id: "additional_only",
            label: "追撃のみ",
            dmgScale(vm){ return 0; },
            attackProps: { isCharged: true, isPyro: true }
        },
        {
            id: "skill",
            label: "スキル",
            dmgScale(vm){ return Yanfei.skillTalentTable[vm.skillRank()-1] },
            attackProps: { isPyro: true, isSkill: true }
        },
        {
            id: "burst",
            label: "爆発",
            dmgScale(vm){ return Yanfei.burstTalentTable[vm.burstRank()-1][0] },
            attackProps: { isPyro: true, isBurst: true }
        }
    ];

}


// 煙緋
export class YanfeiViewModel extends PyroCharacterViewModel
{
    constructor(ch)
    {
        super(ch);
        this.countSeals = ko.observable(4);
        this.useC2Effect = ko.observable(true);
        this.useBurstEffect = ko.observable(true);
    }


    maxSkillTalentRank() { return this.constell() >= 3 ? super.maxSkillTalentRank() + 3 : super.maxSkillTalentRank(); }
    maxBurstTalentRank() { return this.constell() >= 5 ? super.maxBurstTalentRank() + 3 : super.maxBurstTalentRank(); }


    getCountSeals() {
        return Math.min(Number(this.countSeals()), this.constell() >= 6 ? 4 : 3);
    }


    getBurstChargedDmgBuff() {
        return Yanfei.burstTalentTable[this.burstRank()-1][1];
    }


    applyDmgCalcImpl(calc)
    {
        calc = super.applyDmgCalcImpl(calc);

        if(this.useBurstEffect()) {
            // 重撃ダメージアップ
            calc.baseChargedDmg.value += this.getBurstChargedDmgBuff();
        }

        calc.basePyroDmg.value += 0.05 * this.getCountSeals();

        let data = this.toJS();
        let CalcType = Object.getPrototypeOf(calc).constructor;
        let NewCalc = class extends CalcType {
            #yanfeiData = data;

            crtRate(attackProps) {
                if(this.#yanfeiData.constell >= 2 && this.#yanfeiData.useC2Effect
                    && hasAllPropertiesWithSameValue(attackProps, {isCharged: true})) {
                    // 2凸効果
                    return super.crtRate(attackProps).add(0.2);
                }

                return super.crtRate(attackProps);
            }

            chainedAttackDmg(parentAttackProps) {
                let dmg = super.chainedAttackDmg(parentAttackProps);

                if(hasAllPropertiesWithSameValue(parentAttackProps, {isCharged: true})) {
                    let newprops = shallowDup(parentAttackProps);
                    newprops = Calc.deleteAllElementFromAttackProps(newprops);
                    newprops = Calc.deleteAllAttackTypeFromAttackProps(newprops);
                    newprops.isChainable = false;
                    newprops.isPyro = true;
                    newprops.isCharged = true;

                    // 重撃が会心時に80%の重撃を発生
                    dmg = dmg.add(this.calculate(0.8, newprops).total().mul(this.crtRate(parentAttackProps)));
                }

                return dmg;
            }
        };

        calc = Object.assign(new NewCalc(), calc);
        return calc;
    }


    viewHTMLList(target)
    {
        let ret = super.viewHTMLList(target);

        ret.push(Widget.buildViewHTML(target, "丹火の印",
            Widget.selectViewHTML("countSeals", [
                {label: "0個（炎ダメ+0%）", value: 0},
                {label: "1個（炎ダメ+5%）", value: 1},
                {label: "2個（炎ダメ+10%）", value: 2},
                {label: "3個（炎ダメ+15%）", value: 3},
                {label: (this.constell() >= 6 ? "最大（炎ダメ+20%）" : "最大（炎ダメ+15%）"), value: 4},
            ])
        ));


        ret.push(
            Widget.buildViewHTML(target, "灼灼（元素爆発後）",
                Widget.checkBoxViewHTML("useBurstEffect",
                    `重撃ダメージ+${Widget.spanPercentageFix("getBurstChargedDmgBuff()", 1)}`)
            )
        );

        if(this.constell() >= 2) {
            ret.push(Widget.buildViewHTML(target, "最終解釈権（2凸）",
                Widget.checkBoxViewHTML("useC2Effect", "重撃の会心率+20%")
            ));
        }

        return ret;
    }


    toJS() {
        let obj = super.toJS();
        obj.countSeals = this.countSeals();
        obj.useC2Effect = this.useC2Effect();
        obj.useBurstEffect = this.useBurstEffect();
        return obj;
    }


    fromJS(obj) {
        super.fromJS(obj);
        this.countSeals(obj.countSeals);
        this.useC2Effect(obj.useC2Effect);
        this.useBurstEffect(obj.useBurstEffect);
    }
}


runUnittest(function(){
    console.assert(Utils.checkUnittestForCharacter(
        new Yanfei(),
        {
            "vm": {
                "parent_id": "yanfei",
                "constell": 6,
                "normalRank": 9,
                "skillRank": 9,
                "burstRank": 9,
                "reactionType": "isVaporize",
                "reactionProb": 0,
                "countSeals": 4,
                "useC2Effect": true,
                "useBurstEffect": true
            },
            "expected": {
                "normal_1": 303.43895999999995,
                "charged_without_additional": 1185.5844,
                "charged": 1313.26272,
                "additional_only": 127.67832000000001,
                "skill": 882.7315199999999,
                "burst": 950.1623999999999
            }
        }
    ));

    console.assert(Utils.checkSerializationUnittest(
        new Yanfei().newViewModel()
    ));
});