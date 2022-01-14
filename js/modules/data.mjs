export * from './characters.mjs';
export * from './weapons.mjs';
export * from './artifacts.mjs';
export * from './buffeffect.mjs';

import * as Characters from './characters.mjs';
import * as Artifacts from './artifacts.mjs';
import * as BuffEffect from './buffeffect.mjs'

export const bufferEffects = [
    new BuffEffect.ConstantBufferEffect("elem_pyro", "炎元素共鳴：攻撃力+25%", "E", {"rateAtk": 0.25}),
    new BuffEffect.ConstantBufferEffect("elem_cryo", "氷元素共鳴：会心率+15%", "E", {"baseCrtRate": 0.15}),
    new BuffEffect.ConstantBufferEffect("elem_geo", "岩元素共鳴：ダメージ+15%，岩耐性-20%，シールド強化+15%", "E", {"baseAllDmg": 0.15, "baseGeoResis": -0.20, "baseRateShieldStrength": 0.15 }),
    new BuffEffect.ConstantBufferEffect("art_noblesse_oblige_4", "旧貴族のしつけ4：攻撃力+20%", "A", {"rateAtk": 0.2}),
    new BuffEffect.BufferEffectViewModelFactory("vaporize_melt", "蒸発・溶解", "E", (parent) => new BuffEffect.VaporizeMeltEffectViewModel(parent)),
    new BuffEffect.BufferEffectViewModelFactory("yun_jin", "雲菫", "C", (parent) => new Characters.YunJinBufferViewModel(parent)),
    new BuffEffect.BufferEffectViewModelFactory("shenhe", "申鶴", "C", (parent) => new (Characters.ShenheViewModel(BuffEffect.CharacterBufferEffectViewModel))(parent, true)),
];


export function lookupBuffEffect(id)
{
    let ret = undefined;
    bufferEffects.forEach(e => {
        if(e.id == id)
            ret = e;
    });

    return ret;
}