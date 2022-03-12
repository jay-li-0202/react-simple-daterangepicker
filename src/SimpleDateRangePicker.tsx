import { Button, Paper, TextField } from '@mui/material';
import { ChangeEventHandler, Component } from 'react';
import InputMask from "react-input-mask";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import React from 'react';
import { format } from 'date-fns';

export interface SimpleDateRangePickerProps {
    onChangeFrom: ChangeEventHandler<HTMLInputElement>;
    onChangeTo: ChangeEventHandler<HTMLInputElement>;
}

export interface SimpleDateRangePickerState {
    fromDate: Date | undefined;
    toDate: Date | undefined;
    fromDateValue: string;
    toDateValue: string;
    currentCalendarDate: Date;
    showCalendar: boolean;
    calendarRef: React.RefObject<any>;
}

export default class SimpleDateRangePicker extends Component<SimpleDateRangePickerProps, SimpleDateRangePickerState> {

    state: SimpleDateRangePickerState;

    constructor(props: SimpleDateRangePickerProps) {
        super(props);
        this.state = {
            fromDateValue: '',
            toDateValue: '',
            currentCalendarDate: new Date(), // start with today
            showCalendar: false,
            calendarRef: React.createRef(),
            fromDate: undefined,
            toDate: undefined
        };
    }

    componentDidMount() {
        document.addEventListener('mousedown', (e) => { this.handleOutsideClick(e) });
    }

    handleOutsideClick(e: MouseEvent): void {
        let clickedOutsideCalendar = this.state.calendarRef && !this.state.calendarRef.current.contains(e.target);

        this.setState({
            showCalendar: clickedOutsideCalendar ? false : !clickedOutsideCalendar ? true : !this.state.showCalendar
        });
    }

    onChangeFrom(e: React.ChangeEvent<HTMLInputElement>): void {
        // get the user callback
        const { onChangeFrom } = this.props;

        // if it exists
        if (onChangeFrom) {

            // call it
            onChangeFrom(e);
        }

        this.setState({
            fromDateValue: e.target.value
        });
    }

    onChangeTo(e: React.ChangeEvent<HTMLInputElement>): void {
        // get the user callback
        const { onChangeTo } = this.props;

        // if it exists
        if (onChangeTo) {

            // call it
            onChangeTo(e);
        }

        this.setState({
            toDateValue: e.target.value
        });
    }

    calendarNavigateBack(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.setState({
            currentCalendarDate: new Date(this.state.currentCalendarDate.setMonth(this.state.currentCalendarDate.getMonth() - 1))
        });
    }

    calendarNavigateNext(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.setState({
            currentCalendarDate: new Date(this.state.currentCalendarDate.setMonth(this.state.currentCalendarDate.getMonth() + 1))
        });
    }

    getCurrentCalendarDateDaysInMonth(): number {
        return new Date(this.state.currentCalendarDate.getFullYear(), this.state.currentCalendarDate.getMonth() + 1, 0).getDate();
    }

    dayClicked(e: React.MouseEvent<HTMLDivElement, MouseEvent>, day: number): void {

        let newDate = new Date(this.state.currentCalendarDate);
        newDate.setDate(day);

        if (this.state.fromDate !== undefined && this.state.toDate !== undefined) {
            if (newDate > this.state.toDate) {
                this.setState({
                    toDate: newDate,
                    toDateValue: format(newDate, 'MM/dd/yyyy')
                });
            }
            else {
                this.setState({
                    fromDate: newDate,
                    fromDateValue: format(newDate, 'MM/dd/yyyy'),
                    toDate: undefined,
                    toDateValue: ''
                });
            }
        }
        else {
            if (this.state.fromDate === undefined) {
                this.setState({
                    fromDate: newDate,
                    fromDateValue: format(newDate, 'MM/dd/yyyy')
                });
            }
            else {
                this.setState({
                    toDate: newDate,
                    toDateValue: format(newDate, 'MM/dd/yyyy')
                });
            }
        }
    }

    render() {

        let daysInMonth = this.getCurrentCalendarDateDaysInMonth();

        let weeks : Array<number[]> = [];
        for (var i = 7; i < daysInMonth; i += 7) {

            let r = [];
            for (var j = i; j > i - 7; j--) {
                r.push(j);
            }

            weeks.push(r.reverse());
        }

        let lastWeek = weeks[weeks.length - 1];

        // get the remainder
        if (lastWeek[lastWeek.length - 1] !== daysInMonth) {
            let finalWeek = [];
            for (var i = lastWeek[lastWeek.length - 1] + 1; i <= daysInMonth; i++) {
                finalWeek.push(i);
            }

            weeks.push(finalWeek);
        }

        let weekDayNames = [
            'Su',
            'Mo',
            'Tu',
            'We',
            'Th',
            'Fr',
            'Sa'
        ];

        return (
            <div id="parentElement" ref={this.state.calendarRef} style={{width: '500px'}}>
                <InputMask mask="99/99/9999" onChange={(e) => this.onChangeFrom(e)} value={this.state.fromDateValue}>
                    {() => <TextField id="outlined-basic" label="From" variant="outlined" />}
                </InputMask>
                <InputMask mask="99/99/9999" onChange={(e) => this.onChangeTo(e)} value={this.state.toDateValue}>
                    {() => <TextField id="outlined-basic" label="To" variant="outlined" />}
                </InputMask>

                <Paper style={{ padding: '24px', width: '300px', textAlign: 'center', display: this.state.showCalendar ? 'block' : 'none' }}>
                    <div style={{float: 'left', width: '100%'}}>
                    <Button onClick={(e) => { this.calendarNavigateBack(e) }} style={{ float: 'left' }}>
                        <NavigateBeforeIcon />
                    </Button>
                        <span style={{fontWeight: '700'}}>{this.state.currentCalendarDate.toLocaleString('default', { month: 'long' })} {this.state.currentCalendarDate.toLocaleString('default', { year: 'numeric' })}</span>
                        <Button onClick={(e) => { this.calendarNavigateNext(e) }} style={{ float: 'right' }}>
                        <NavigateNextIcon />
                    </Button>
                    </div>
                    <div style={{ display: 'inline-block' }}>
                    {
                        weekDayNames.map(name => {
                            return (
                                <Paper sx={{borderColor: 'white'}} variant="outlined" style={{ display: 'inline-block', width: '36px', height: '36px', textAlign: 'center', color: '#999' }}>{name}</Paper>
                                );
                        })
                    }
                    </div>
                    <div style={{ display: 'inline-block' }}>
                    {
                        weeks.map(week => {
                            return (<div style={{ display: 'block', textAlign: 'left' }}>
                                {
                                    week.map(day => {
                                        return <Paper onClick={(e) => { this.dayClicked(e, day) }} variant="outlined" style={{ display: 'inline-block', width: '36px', height: '36px', textAlign: 'center' }}>{day}</Paper>
                                    })
                                }
                            </div>
                            )
                        })
                    }
                    </div>
                    <div style={{ display: 'block' }}>
                        <Button onClick={() => { this.setState({currentCalendarDate: new Date()})}}>
                            Today
                        </Button>
                    </div>
                </Paper>
            </div>
            );
    }
}