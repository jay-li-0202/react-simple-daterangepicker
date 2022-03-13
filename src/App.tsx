import React from 'react';
import './App.css';
import SimpleDateRangePicker, { DaySelectionRangeOptions, SimpleDateRangeColors } from './SimpleDateRangePicker';
import { format, parse, isValid } from 'date-fns';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from '@mui/material';
import InputMask from "react-input-mask";
import { SketchPicker } from 'react-color';

function App() {
    const [fromDate, setFromDate] = React.useState<string>("");
    const [toDate, setToDate] = React.useState<string>("");
    const [daySelectionRangeOptions, setDaySelectionRangeOptions] = React.useState<DaySelectionRangeOptions>(DaySelectionRangeOptions.ExtendToAfterTwoClicks);
    let now = new Date();
    const [availabilityDateRange, setAvailabilityDateRange] = React.useState<Date[]>([new Date(), new Date(now.getFullYear(), now.getMonth() + 6, 1)]);

    const [simpleDateRangeColors, setSimpleDateRangeColors] = React.useState<SimpleDateRangeColors>({
        dayInsideRangeSelected: '#1EA1A1',
        fromToDaySelected: '#265b5f',
        dayNotSelected: '#fff',
        dayTextColor: '#000',
        dayBorderColor: '#000',
        disabledDayTextColor: '#ccc',
        disabledDayBorderColor: '#ccc',
        disabledDayBackgroundColor: '#eee'
    });

    return (
        <>
            <div style={{ padding: '24px' }}>
                <h1>Simple Date Range Picker</h1>
                <div style={{ padding: '24px' }}>
                    <h2>Picker</h2>
                    <SimpleDateRangePicker simpleDateRangeColors={simpleDateRangeColors} availabilityDateRange={availabilityDateRange} daySelectionRangeOptions={daySelectionRangeOptions} onChangeFrom={(e) => { setFromDate(e ? format(e!, 'MM/dd/yyyy') : ''); }} onChangeTo={(e) => { setToDate(e ? format(e!, 'MM/dd/yyyy') : '') }} />
                </div>

                <div style={{ padding: '24px' }}>
                    <h2>Output</h2>
                    <p><strong>From:</strong> {fromDate}</p>
                    <p><strong>To:</strong> {toDate}</p>
                </div>
                <h2>Options</h2>
                <h3>Day Selection Range</h3>
                <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">Options</FormLabel>
                    <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        defaultValue="0"
                        name="radio-buttons-group"
                        onChange={(e) => {optionsOnChange(e)}}
                    >
                        <FormControlLabel value="0" control={<Radio />} label="Extend To After Two Clicks" />
                        <FormControlLabel value="1" control={<Radio />} label="Reset From After Two Clicks" />
                    </RadioGroup>
                </FormControl>
                <h3>Availability Date Range</h3>
                <InputMask mask="99/99/9999" onChange={(e) => availabilityOnChangeFrom(e)} value={format(availabilityDateRange[0], 'MM/dd/yyyy')}>
                    {() => <TextField id="outlined-basic" label="From" variant="outlined" />}
                </InputMask>
                <InputMask mask="99/99/9999" onChange={(e) => availabilityOnChangeTo(e)} value={format(availabilityDateRange[1], 'MM/dd/yyyy')}>
                    {() => <TextField id="outlined-basic" label="To" variant="outlined" />}
                </InputMask>
                <h3>Colors</h3>
                <div style={{ display: 'inline-block', padding: '12px' }}>
                    <h4>Day Inside Range Selected Color</h4>
                    <SketchPicker color={simpleDateRangeColors.dayInsideRangeSelected} onChange={(color, e) => {
                        let r = {
                            ...simpleDateRangeColors,
                            dayInsideRangeSelected: color.hex
                        };
                        setSimpleDateRangeColors(r)
                    }} />
                </div>
                <div style={{ display: 'inline-block', padding: '12px' }}>
                <h4>From / To Day Selected Color</h4>
                <SketchPicker color={simpleDateRangeColors.fromToDaySelected} onChange={(color, e) => {
                    let r = {
                        ...simpleDateRangeColors,
                        fromToDaySelected: color.hex
                    };
                    setSimpleDateRangeColors(r)
                }} />
                </div>
                <div style={{ display: 'inline-block', padding: '12px' }}>
                <h4>Day Not Selected Color</h4>
                <SketchPicker color={simpleDateRangeColors.dayNotSelected} onChange={(color, e) => {
                    let r = {
                        ...simpleDateRangeColors,
                        dayNotSelected: color.hex
                    };
                    setSimpleDateRangeColors(r)
                }} />
                </div>
                <div style={{ display: 'inline-block', padding: '12px' }}>
                    <h4>Day Text Color</h4>
                    <SketchPicker color={simpleDateRangeColors.dayTextColor} onChange={(color, e) => {
                        let r = {
                            ...simpleDateRangeColors,
                            dayTextColor: color.hex
                        };
                        setSimpleDateRangeColors(r)
                    }} />
                </div>
                <div style={{ display: 'inline-block', padding: '12px' }}>
                    <h4>Day Border Color</h4>
                    <SketchPicker color={simpleDateRangeColors.dayBorderColor} onChange={(color, e) => {
                        let r = {
                            ...simpleDateRangeColors,
                            dayBorderColor: color.hex
                        };
                        setSimpleDateRangeColors(r)
                    }} />
                </div>
                <div style={{ display: 'inline-block', padding: '12px' }}>
                    <h4>Disabled Day Text Color</h4>
                    <SketchPicker color={simpleDateRangeColors.disabledDayTextColor} onChange={(color, e) => {
                        let r = {
                            ...simpleDateRangeColors,
                            disabledDayTextColor: color.hex
                        };
                        setSimpleDateRangeColors(r)
                    }} />
                </div>
                <div style={{ display: 'inline-block', padding: '12px' }}>
                    <h4>Disabled Day Border Color</h4>
                    <SketchPicker color={simpleDateRangeColors.disabledDayBorderColor} onChange={(color, e) => {
                        let r = {
                            ...simpleDateRangeColors,
                            disabledDayBorderColor: color.hex
                        };
                        setSimpleDateRangeColors(r)
                    }} />
                </div>
                <div style={{ display: 'inline-block', padding: '12px' }}>
                    <h4>Disabled Day Background Color</h4>
                    <SketchPicker color={simpleDateRangeColors.disabledDayBackgroundColor} onChange={(color, e) => {
                        let r = {
                            ...simpleDateRangeColors,
                            disabledDayBackgroundColor: color.hex
                        };
                        setSimpleDateRangeColors(r)
                    }} />
                </div>
            </div>
        </>
    );

    function availabilityOnChangeFrom(e: React.ChangeEvent<HTMLInputElement>): void {
        if (!isValid(parse(e.target.value, 'MM/dd/yyyy', new Date()))) {
            return;
        }

        setAvailabilityDateRange([new Date(e.target.value), availabilityDateRange[1]])
    }

    function availabilityOnChangeTo(e: React.ChangeEvent<HTMLInputElement>): void {
        if (!isValid(parse(e.target.value, 'MM/dd/yyyy', new Date()))) {
            return;
        }

        setAvailabilityDateRange([availabilityDateRange[0], new Date(e.target.value)])
    }

    function optionsOnChange(e: React.ChangeEvent<HTMLInputElement>): void {
        let option: DaySelectionRangeOptions = parseInt(e.target.value);
        setDaySelectionRangeOptions(option);
    }
}

export default App;
