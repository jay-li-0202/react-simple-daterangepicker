import React from 'react';
import './App.css';
import TextField from '@mui/material/TextField';
import DateRangePicker, { DateRange } from '@mui/lab/DateRangePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Box from '@mui/material/Box';
import SimpleDateRangePicker from './SimpleDateRangePicker';
import { format } from 'date-fns';

function App() {
    const [value, setValue] = React.useState<DateRange<Date>>([null, null]);
    const [fromDate, setFromDate] = React.useState<string>("");
    const [toDate, setToDate] = React.useState<string>("");

    return (
        <>
      <div style={{padding: '24px'}}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateRangePicker
              startText="Check-in"
              endText="Check-out"
              value={value}
              onChange={(newValue) => {
                  setValue(newValue);
              }}
              renderInput={(startProps, endProps) => (
                  <React.Fragment>
                      <TextField {...startProps} />
                      <Box sx={{ mx: 2 }}> to </Box>
                      <TextField {...endProps} />
                  </React.Fragment>
              )}
          />
        </LocalizationProvider>
      </div>
            <div style={{ padding: '24px' }}>
                <SimpleDateRangePicker onChangeFrom={(e) => { setFromDate(e ? format(e!, 'MM/dd/yyyy') : ''); }} onChangeTo={(e) => { setToDate(e ? format(e!, 'MM/dd/yyyy') : '')}} />
            </div>
            <p>From: {fromDate}</p>
            <p>To: {toDate}</p>
        </>
  );
}

export default App;
