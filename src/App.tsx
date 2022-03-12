import React from 'react';
import './App.css';
import SimpleDateRangePicker, { DaySelectionRangeOptions } from './SimpleDateRangePicker';
import { format } from 'date-fns';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';

function App() {
    const [fromDate, setFromDate] = React.useState<string>("");
    const [toDate, setToDate] = React.useState<string>("");
    const [daySelectionRangeOptions, setDaySelectionRangeOptions] = React.useState<DaySelectionRangeOptions>(DaySelectionRangeOptions.ExtendToAfterTwoClicks);

    return (
        <>
            <div style={{ padding: '24px' }}>
                <h1>Simple Date Range Picker</h1>
                <h2>Options</h2>
                <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">Day Selection Range Options</FormLabel>
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
            </div>
            <div style={{ padding: '24px' }}>
                <h2>Picker</h2>
                <SimpleDateRangePicker daySelectionRangeOptions={daySelectionRangeOptions} onChangeFrom={(e) => { setFromDate(e ? format(e!, 'MM/dd/yyyy') : ''); }} onChangeTo={(e) => { setToDate(e ? format(e!, 'MM/dd/yyyy') : '')}} />
            </div>

            <div style={{ padding: '24px' }}>
                <h2>Output</h2>
                <p><strong>From:</strong> {fromDate}</p>
                <p><strong>To:</strong> {toDate}</p>
            </div>
        </>
    );

    function optionsOnChange(e: React.ChangeEvent<HTMLInputElement>): void {
        let option: DaySelectionRangeOptions = parseInt(e.target.value);
        setDaySelectionRangeOptions(option);
    }
}

export default App;
