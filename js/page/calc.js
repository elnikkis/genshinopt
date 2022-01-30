//@ts-check
import * as Data from '../modules/data.mjs';
import * as Calc from '../modules/dmg-calc.mjs';
import * as Migrator from '../modules/migrator.mjs'
import * as UI from '../modules/ui.mjs'


function newBundleSetting()
{
    return new UI.BundleSetting({
        bCharPicker: true,
        selectedChar: undefined,
        bTalent: true,
        bAttack: false,
        bWeapon: true,
        bArtifact: true,
        bArtifactStatus: true,
        bExternalBuff: true
    });
}


class CalcSetting
{
    /**
     * @param {Object} bundleData 
     * @param {Calc.DamageCalculator} calc 
     */
    constructor(bundleData, calc)
    {
        this.setting = newBundleSetting();
        this.setting.fromJS(bundleData);
        this.calc = calc;

        let oldValue = Calc.VGData.doCalcExprText;
        Calc.VGData.doCalcExprText = true;
        try {
            // 設定をダメージ計算式に反映する
            this.calc = this.setting.applyDmgCalc(this.calc);

            this.attackResults = [];

            // そのキャラクターのすべてのダメージの計算をする
            let cvm = this.setting.characterVMSetting.viewModel();
            let attacks = cvm.presetAttacks();
            attacks.forEach(attack => {
                let obj = {}
                obj.id = attack.id;
                obj.label = attack.label;
                obj.calc = this.calc;
                obj.attack = attack;
                obj.dmg = obj.attack.evaluate(this.calc);
                obj.crtDmg = obj.attack.evaluate(this.calc, {isForcedCritical: true});
                obj.nonCrtDmg = obj.attack.evaluate(this.calc, {isForcedNonCritical: true});

                this.attackResults.push(obj);
            });
        } finally {
            Calc.VGData.doCalcExprText = oldValue;
        }
    }
}


class EnemySetting
{
    constructor()
    {
        this.level = ko.observable(90);
        this.pyroResis = ko.observable(10);
        this.hydroResis = ko.observable(10);
        this.dendroResis = ko.observable(10);
        this.electroResis = ko.observable(10);
        this.anemoResis = ko.observable(10);
        this.cryoResis = ko.observable(10);
        this.geoResis = ko.observable(10);
        this.physicalResis = ko.observable(10);
    }


    newDamageCalculator()
    {
        let calc = new Calc.DamageCalculator();
        calc.enemyLv = Number(this.level());
        calc.baseAllResis.value = 0;
        calc.basePyroResis.value = Number(this.pyroResis()) / 100;
        calc.baseHydroResis.value = Number(this.hydroResis()) / 100;
        calc.baseDendroResis.value = Number(this.dendroResis()) / 100;
        calc.baseElectroResis.value = Number(this.electroResis()) / 100;
        calc.baseAnemoResis.value = Number(this.anemoResis()) / 100;
        calc.baseCryoResis.value = Number(this.cryoResis()) / 100;
        calc.baseGeoResis.value = Number(this.geoResis()) / 100;
        calc.basePhysicalResis.value = Number(this.physicalResis()) / 100;
        return calc;
    }
}


class ViewModel
{
    constructor()
    {
        this.bundleSetting = newBundleSetting();
        this.enemySetting = new EnemySetting();

        this.calculateResult = ko.computed(function(){
            if(!this.bundleSetting.isValid())
                return undefined;

            return new CalcSetting(this.bundleSetting.toJS(), this.enemySetting.newDamageCalculator());
        }, this);
    }


    fromJS(obj) {
        this.bundleSetting.fromJS(obj);
    }


    toJS() {
        return this.bundleSetting.toJS();
    }
}


$(function(){
    let viewModel = new ViewModel()
    window.viewModel = viewModel;
    ko.applyBindings(window.viewModel);

    function loadDataFromURI(version, uri)
    {
        let migrated = Migrator.calcDataMigrator.migrate(version, decodeFromURI(uri));
        viewModel.fromJS(migrated);
    }

    (async () => {
        // await nlopt.ready
        // viewModel.readyNLopt(true);

        // ページロード時にgetパラメータにデータがあればそれを復元する
        try {
            var url = new URL(window.location.href);
            const uridata = url.searchParams.get('data');
            const verdata = url.searchParams.get('ver') || '0';    // データのバージョン

            if(uridata && verdata) {
                loadDataFromURI(verdata, uridata);
                viewModel.optimizeAllCases();
            }
        } catch(ex) {

        };
    })();
});
