/*
* 基于蜂巢结构的micro:bit扩展，各扩展通过磁吸方式与micro:bit底座拼接
* Web : https://woaibiancheng.com
* @author : 张云鹏 physicsfamily@gmail.com
*/

//% weight=6 color=#1abc9c icon="\uf1b3"
namespace wabc {

    export enum FanSpeed {
        Speedup = 0x1,
        SpeedDown = 0x2,
        TurnOff = 0x3
    }

    /**
     * 获取照度传感器的值（单位：勒克斯）
     */
    //% blockId=wabc_ill block="get Illuminance"
    //% weight=64
    export function Illuminance(): number {
        let y = pins.i2cReadNumber(35, NumberFormat.UInt16BE, false);
        return Math.round(y / 1.2);
    }
    /**
     * 获取压力传感器的值（单位：牛）
     */
    //% blockId=wabc_pressure block="get Pressure"
    //% weight=63
    export function Pressure(): number {
        let y = pins.i2cReadNumber(37, NumberFormat.UInt16BE, false);
        return Math.round(y);
    }

    /**
     * 获取PM2.5传感器的值
     */
    //% blockId=wabc_pm25 block="get AQI of PM2.5"
    //% weight=62
    export function Pm25(): number {
        let y = pins.i2cReadNumber(38, NumberFormat.UInt16BE, false);
        return Math.round(y);
    }

    /**
     * 获取PM10传感器的值
     */
    //% blockId=wabc_pm10 block="get AQI of PM10"
    //% weight=61
    export function Pm10(): number {
        let y = pins.i2cReadNumber(39, NumberFormat.UInt16BE, false);
        return Math.round(y);
    }

    /**
     * 人体红外传感器检测到人体
     */
    //% blockId=wabc_infrared block="Human infrared sensor detects people"
    //% weight=60
    export function HumanBodyDetected(): boolean {
        let y = pins.i2cReadNumber(36, NumberFormat.UInt8BE, false);
        return (y == 1);
    }
    /**
     * 声音传感器检测到声音
     */
    //% blockId=wabc_sound block="Sound sensor detects sound"
    //% weight=59
    export function SoundDetected(): boolean {
        let y = pins.i2cReadNumber(18, NumberFormat.UInt8BE, false);
        return (y == 1);
    }

    //% blockId=wabc_fan block="Change Fan Speed|%index|"
    //% weight=58
    export function ChangeFanSpeed(index: FanSpeed): void {
        pins.i2cWriteNumber(40, index, NumberFormat.UInt8BE);
    }

}
