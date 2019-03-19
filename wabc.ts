/*
* 基于蜂巢结构的micro:bit扩展，各扩展通过磁吸方式与micro:bit底座拼接
* Web : https://woaibiancheng.com
* @author : 张云鹏 wabc@graviton.dev
*/

//% weight=80 color=#0fbc11 icon="\uf1b3"
namespace wabc {
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09
    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD

    const STP_CHA_L = 2047
    const STP_CHA_H = 4095

    const STP_CHB_L = 1
    const STP_CHB_H = 2047

    const STP_CHC_L = 1023
    const STP_CHC_H = 3071

    const STP_CHD_L = 3071
    const STP_CHD_H = 1023


    export enum FanSpeed {
        Speedup = 0x1,
        SpeedDown = 0x2,
        TurnOff = 0x3
    }

    let initialized = false

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE, false);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADDRESS, MODE1, 0x00)
        setFreq(50);
        setPwm(0, 0, 4095);
        for (let idx = 1; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        initialized = true
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }

  	/**
  	 * Servo Execute
  	 * @param degree [0-180] degree of servo; eg: 90, 0, 180
  	*/
    //% blockId=setServo block="Servo channel|%channel|degree %degree"
    //% weight=85
    //% degree.min=0 degree.max=180
    export function Servo(channel: number, degree: number): void {
        if (!initialized) {
            initPCA9685();
        }
        // 50hz: 20,000 us
        let v_us = (degree * 1800 / 180 + 600); // 0.6 ~ 2.4
        let value = v_us * 4096 / 20000;
        setPwm(channel, 0, value);
    }

  	/**
  	 * Servo Execute
  	 * @param pulse [500-2500] pulse of servo; eg: 1500, 500, 2500
  	*/
    //% blockId=setServoPulse block="Servo channel|%channel|pulse %pulse"
    //% weight=85
    //% pulse.min=500 pulse.max=2500
    export function ServoPulse(channel: number, pulse: number): void {
        if (!initialized) {
            initPCA9685();
        }
        // 50hz: 20,000 us
        let value = pulse * 4096 / 20000;
        setPwm(channel, 0, value);
    }
    /**
     * 获取照度传感器的值（单位：勒克斯）
     */
    //% blockId=wabc_ill block="get Illuminance"
    //% weight=999
    export function Illuminance(): number {
        let y = pins.i2cReadNumber(35, NumberFormat.UInt16BE, false);
        return Math.round (y / 1.2);
    }
    /**
     * 获取压力传感器的值（单位：牛）
     */
    //% blockId=wabc_pressure block="get Pressure"
    //% weight=777
    export function Pressure(): number {
        let y = pins.i2cReadNumber(37, NumberFormat.UInt16BE, false);
        return Math.round (y);
    }

    /**
     * 获取PM2.5传感器的值
     */
    //% blockId=wabc_pm25 block="get AQI of PM2.5"
    //% weight=666
    export function Pm25(): number {
        let y = pins.i2cReadNumber(38, NumberFormat.UInt16BE, false);
        return Math.round (y);
    }

    /**
     * 获取PM10传感器的值
     */
    //% blockId=wabc_pm10 block="get AQI of PM10"
    //% weight=555
    export function Pm10(): number {
        let y = pins.i2cReadNumber(39, NumberFormat.UInt16BE, false);
        return Math.round (y);
    }

   /**
    * 人体红外传感器检测到人体
    */
    //% blockId=wabc_infrared block="Human infrared sensor detects people"
    //% weight=888
    export function HumanBodyDetected(): boolean {
        let y = pins.i2cReadNumber(36, NumberFormat.UInt8BE, false);
        return (y==1);
    }

    //% blockId=wabc_fan block="Change Fan Speed|%index|"
    //% weight=80
    export function ChangeFanSpeed(index: FanSpeed): void {
        pins.i2cWriteNumber(40, index, NumberFormat.UInt8BE);
    }

}
