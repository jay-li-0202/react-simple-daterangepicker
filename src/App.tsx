import React from 'react';
import './App.css';
import SimpleDateRangePicker from './SimpleDateRangePicker';
import { format } from 'date-fns';

function App() {
    const [fromDate, setFromDate] = React.useState<string>("");
    const [toDate, setToDate] = React.useState<string>("");

    return (
        <>
            <div style={{ padding: '24px' }}>
                <SimpleDateRangePicker onChangeFrom={(e) => { setFromDate(e ? format(e!, 'MM/dd/yyyy') : ''); }} onChangeTo={(e) => { setToDate(e ? format(e!, 'MM/dd/yyyy') : '')}} />
            </div>
            <p>From: {fromDate}</p>
            <p>To: {toDate}</p>
        </>
  );
}

export default App;
